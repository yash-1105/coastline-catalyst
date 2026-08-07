-- ============================================================================
-- Coastline Catalyst: table privileges for service_role
-- Migration 0002. Run once in the Supabase SQL Editor, after 0001.
--
-- WHY THIS IS NEEDED
--
-- Row level security and table privileges are two independent gates in
-- Postgres, and a request has to pass both.
--
--   RLS         service_role has the BYPASSRLS attribute, so it was never the
--               problem. The zero-policy setup from 0001 stands unchanged.
--   GRANT       a separate, older mechanism. Without it the role cannot touch
--               the table at all, whatever RLS says.
--
-- Tables created by 0001 arrived with no grant for service_role, so every
-- insert failed with 42501, "permission denied for table contact_messages".
-- This migration grants the minimum needed and, just as importantly, revokes
-- everything from anon and authenticated so the security model is enforced
-- twice over: no privileges AND no policies.
--
-- AFTER RUNNING, YOU SHOULD SEE
--   The contact form saving a row, and the last query in this file returning
--   service_role for both tables and nothing for anon or authenticated.
-- ============================================================================


-- The role needs to see the schema before it can see anything in it.
grant usage on schema public to service_role;

-- All four verbs: the app inserts, and the dashboard review workflow updates
-- status, reviewer_notes and handled. Delete is there for retention cleanup.
grant select, insert, update, delete on public.pitch_submissions to service_role;
grant select, insert, update, delete on public.contact_messages  to service_role;

-- Anything added to this schema later gets the same treatment automatically,
-- so a future table cannot repeat this failure.
alter default privileges in schema public grant all on tables to service_role;


-- ---------------------------------------------------------------------------
-- Belt and braces.
--
-- RLS with no policies already denies anon and authenticated everything. These
-- revokes make it true at the privilege layer as well, so a policy added by
-- mistake later still cannot open these tables up.
-- ---------------------------------------------------------------------------

revoke all on public.pitch_submissions from anon, authenticated;
revoke all on public.contact_messages  from anon, authenticated;

-- Stop the default-privileges rule above from ever handing new tables to the
-- browser-facing roles.
alter default privileges in schema public revoke all on tables from anon, authenticated;


-- ---------------------------------------------------------------------------
-- Verification. Run this after the statements above.
-- Expect exactly two rows per table, both for service_role.
-- If anon or authenticated appear here, stop and re-read this file.
-- ---------------------------------------------------------------------------

select
  table_name,
  grantee,
  string_agg(privilege_type, ', ' order by privilege_type) as privileges
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('pitch_submissions', 'contact_messages')
  and grantee in ('anon', 'authenticated', 'service_role')
group by table_name, grantee
order by table_name, grantee;
