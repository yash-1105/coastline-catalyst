-- Unhandled contacts: general enquiries nobody has replied to yet, newest first.
--
-- message is included in full here. Contact messages are short, and the whole
-- point is to read and reply, unlike the pitch list where the long fields
-- would only get in the way.
--
-- After replying, mark it off:
--   update public.contact_messages set handled = true where id = '...';

select
  created_at,
  name,
  email,
  subject,
  message,
  id
from public.contact_messages
where handled = false
order by created_at desc;
