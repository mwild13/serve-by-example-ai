-- Rolls back supabase/migrations/20261026_push_reminders.sql.
-- Stops the reminders and forgets every browser's push subscription.

select cron.unschedule('send-shift-reminders')
 where exists (select 1 from cron.job where jobname = 'send-shift-reminders');

BEGIN;

DROP TABLE IF EXISTS public.push_subscriptions;
ALTER TABLE public.shift_schedules
  DROP COLUMN IF EXISTS reminder_time,
  DROP COLUMN IF EXISTS last_reminded_on;

COMMIT;
