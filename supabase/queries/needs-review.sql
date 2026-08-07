-- Needs review: everything still sitting at status 'new', OLDEST FIRST.
--
-- Oldest first is the point of this query. Sorting newest first is how the
-- application that has been waiting longest ends up buried. This is the
-- working queue; clear it from the top.
--
-- To take one out of the queue, set its status by hand:
--   update public.pitch_submissions set status = 'reviewing' where id = '...';
-- Then 'passed' or 'progressing' once decided.

select
  created_at,
  company_name,
  founder_name,
  email,
  stage,
  industry,
  country,
  deck_path,
  id
from public.pitch_submissions
where status = 'new'
order by created_at asc;
