-- The Recognise feature was removed from the Manager Console on 2026-10-09
-- (dialog, Leaderboards button and /api/management/recognitions). Nothing
-- reads or writes this table any more.
--
-- Run only after that code is live in production. This permanently deletes
-- every recognition message already sent.
DROP TABLE IF EXISTS public.staff_recognitions;
