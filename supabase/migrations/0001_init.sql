-- ============================================================================
-- Coastline Catalyst: pitch submissions, contact messages, deck storage
-- Migration 0001. Run once in the Supabase SQL Editor.
--
-- AFTER RUNNING, YOU SHOULD SEE EXACTLY THIS IN THE DASHBOARD
--
--   Database > Tables
--     public.pitch_submissions   20 columns, "RLS enabled" badge
--     public.contact_messages     8 columns, "RLS enabled" badge
--
--   Database > Enumerated Types
--     submission_status   new, reviewing, passed, progressing
--     funding_stage       idea, pre_seed, seed, series_a, later
--
--   Database > Indexes  (5 new, besides the two primary keys)
--     pitch_submissions_created_at_idx
--     pitch_submissions_status_idx
--     pitch_submissions_ip_created_at_idx
--     contact_messages_created_at_idx
--     contact_messages_ip_created_at_idx
--
--   Storage > Buckets
--     pitch-decks    Private, 25 MB limit, application/pdf only
--
--   Authentication > Policies
--     ZERO policies on both tables. The dashboard will show these tables with
--     a warning that RLS is enabled with no policies. THAT WARNING IS THE
--     INTENDED STATE, not a mistake. See the note above the alter statements.
--
-- This migration is safe to re-run: every object is created conditionally.
-- gen_random_uuid() is built into Postgres 13+, so no extension is required.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'submission_status' and n.nspname = 'public'
  ) then
    create type public.submission_status as enum ('new', 'reviewing', 'passed', 'progressing');
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'funding_stage' and n.nspname = 'public'
  ) then
    create type public.funding_stage as enum ('idea', 'pre_seed', 'seed', 'series_a', 'later');
  end if;
end
$$;


-- ---------------------------------------------------------------------------
-- pitch_submissions
--
-- deck_path is the object key inside the private pitch-decks bucket, written
-- after the browser has uploaded straight to Storage. It is deliberately a
-- plain text column and not a foreign key: Storage objects are managed by the
-- storage schema, and a hard reference would block housekeeping there.
-- ---------------------------------------------------------------------------

create table if not exists public.pitch_submissions (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),

  -- Step 1: about you
  company_name     text not null,
  founder_name     text not null,
  email            text not null,
  phone            text,
  website          text,
  linkedin         text,

  -- Step 2: about the business
  stage            public.funding_stage,
  revenue_band     text,
  industry         text,
  country          text,
  description      text,

  -- Step 3: fit and materials
  why_coastline    text,
  deck_path        text,
  deck_filename    text,
  deck_size_bytes  bigint,

  -- Review workflow, maintained by hand in the dashboard
  status           public.submission_status not null default 'new',
  reviewer_notes   text,

  submitted_ip     inet
);

comment on table public.pitch_submissions is
  'Founder applications. Reviewed directly in the dashboard; there are no email notifications in this build.';
comment on column public.pitch_submissions.deck_path is
  'Object key in the private pitch-decks bucket. Never expose publicly; download via the dashboard or a short-lived signed URL.';
comment on column public.pitch_submissions.status is
  'Review state. Set by hand: new -> reviewing -> passed or progressing.';


-- ---------------------------------------------------------------------------
-- contact_messages
-- ---------------------------------------------------------------------------

create table if not exists public.contact_messages (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  name          text not null,
  email         text not null,
  subject       text,
  message       text not null,
  handled       boolean not null default false,
  submitted_ip  inet
);

comment on table public.contact_messages is
  'General enquiries. Pitches go to pitch_submissions instead.';
comment on column public.contact_messages.handled is
  'Flipped to true by hand once someone has replied.';


-- ---------------------------------------------------------------------------
-- Row level security
--
-- RLS IS ENABLED WITH ZERO POLICIES ON BOTH TABLES, AND THAT IS DELIBERATE.
--
-- In Postgres, RLS enabled with no policies denies everything to ordinary
-- roles. So the anon and authenticated keys, which are the only keys that can
-- ever reach a browser, can read and write nothing here. The service role key
-- bypasses RLS by design and is read only inside serverless functions, which
-- is the single path by which rows are written.
--
-- Do not add a policy to "make it work". If something cannot read these tables,
-- it is because it is not supposed to. The dashboard's warning about enabled
-- RLS with no policies is the state we want, not a problem to fix.
-- ---------------------------------------------------------------------------

alter table public.pitch_submissions enable row level security;
alter table public.contact_messages  enable row level security;


-- ---------------------------------------------------------------------------
-- Indexes
--
-- created_at desc drives the review lists; status drives the triage list;
-- the (ip, created_at desc) pairs support rate limiting and abuse checks.
-- ---------------------------------------------------------------------------

create index if not exists pitch_submissions_created_at_idx
  on public.pitch_submissions (created_at desc);

create index if not exists pitch_submissions_status_idx
  on public.pitch_submissions (status);

create index if not exists pitch_submissions_ip_created_at_idx
  on public.pitch_submissions (submitted_ip, created_at desc);

create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);

create index if not exists contact_messages_ip_created_at_idx
  on public.contact_messages (submitted_ip, created_at desc);


-- ---------------------------------------------------------------------------
-- Storage bucket
--
-- Private, so no object is ever reachable by URL. The browser still uploads
-- straight to Storage: a serverless function mints a signed upload URL with
-- the service role key, and that token authorises the single upload on its
-- own. Signed uploads do not consult storage.objects policies, which is why
-- this bucket needs none.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('pitch-decks', 'pitch-decks', false, 26214400, array['application/pdf'])
on conflict (id) do nothing;
