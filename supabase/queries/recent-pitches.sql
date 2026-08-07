-- Recent pitches: the last 50 submissions, newest first.
-- Save as a bookmark in the SQL Editor. This is the "what has come in" view.
--
-- Long text (description, why_coastline, reviewer_notes) is left out on
-- purpose so the result stays scannable. Open a single row to read those.
-- deck_path is the object key inside the private pitch-decks bucket: find it
-- under Storage > pitch-decks to download. It is not a public URL.

select
  created_at,
  company_name,
  founder_name,
  email,
  stage,
  industry,
  status,
  deck_path
from public.pitch_submissions
order by created_at desc
limit 50;
