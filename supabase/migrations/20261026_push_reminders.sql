-- Shift reminders by web push (Rich update, Phase 12, part 2).
--
-- shift_schedules.reminder_time: the Sydney time of day to remind someone on
--   their shift days, or null for no reminder.
-- shift_schedules.last_reminded_on: the Sydney day the last reminder went,
--   so a retry or an overlapping run never sends two on one day.
-- push_subscriptions: one row per browser or installed app that allowed
--   notifications. Only the push service's address and keys; no message
--   content is ever stored or sent (the app shows a fixed notification).
--
-- The cron job calls /api/cron/reminders every 15 minutes, every day, with
-- the same shared secret as the notification emails
-- (20261017_notification_sender.sql must have been run).
--
-- Additive: safe to run before the new code is live. Until the VAPID keys
-- are set in Cloudflare the route sends nothing.
-- Rollback: supabase/rollbacks/20261026_push_reminders_rollback.sql

BEGIN;

ALTER TABLE public.shift_schedules
  ADD COLUMN IF NOT EXISTS reminder_time time,
  ADD COLUMN IF NOT EXISTS last_reminded_on date;

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  endpoint   text        NOT NULL UNIQUE CHECK (char_length(endpoint) <= 1000),
  p256dh     text        NOT NULL CHECK (char_length(p256dh) <= 200),
  auth       text        NOT NULL CHECK (char_length(auth) <= 100),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS push_subscriptions_user_idx ON public.push_subscriptions (user_id);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.push_subscriptions FROM anon, authenticated;

COMMIT;

-- Every 15 minutes, every day. The route decides who is due, so most runs
-- send nothing.
select cron.unschedule('send-shift-reminders')
 where exists (select 1 from cron.job where jobname = 'send-shift-reminders');

select cron.schedule(
  'send-shift-reminders',
  '*/15 * * * *',
  $job$
  select net.http_post(
    url := 'https://servebyexample.co/api/cron/reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'notifications_cron_secret')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 30000
  );
  $job$
);

-- Check after running:
--   select jobname, schedule, active from cron.job where jobname = 'send-shift-reminders';
--     -- */15 * * * *, true
--   SELECT grantee FROM information_schema.role_table_grants
--   WHERE table_name = 'push_subscriptions' AND grantee IN ('anon', 'authenticated');
--     -- no rows
