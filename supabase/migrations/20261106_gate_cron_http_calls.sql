-- Cuts database writes from the two frequent cron jobs. Same schedules, but
-- Postgres only makes the HTTP call when the route has something to do.
-- Measured 2026-11-06: every kept response was a no-op ({"completed":0} or
-- {"due":0,"sent":0}), and each call writes a pg_net queue row and a
-- net._http_response row as well as the cron run log.
--
-- applicant-marking: the same check as needsCompleting() in
-- lib/applicant/service.ts and the route's 5 minute grace and 7 day cut-off.
-- send-shift-reminders: the route only sends to people with a browser
-- subscribed, so with none there is nothing it could send.
--
-- The routes still make the final decision. pg_cron still logs each run in
-- cron.job_run_details.
-- Rollback: supabase/rollbacks/20261106_gate_cron_http_calls_rollback.sql

select cron.unschedule('applicant-marking')
 where exists (select 1 from cron.job where jobname = 'applicant-marking');

select cron.schedule(
  'applicant-marking',
  '*/5 * * * *',
  $job$
  select net.http_post(
    url := 'https://servebyexample.co/api/cron/applicant-marking',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'notifications_cron_secret')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 30000
  )
  where exists (
    select 1 from public.applicant_tests
    where status = 'submitted'
      and submitted_at < now() - interval '5 minutes'
      and submitted_at > now() - interval '7 days'
      and (report is null
           or coalesce((report->>'pendingScores')::int, 0) > 0
           or report->>'summary' is null)
  );
  $job$
);

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
  )
  where exists (
    select 1 from public.push_subscriptions p
    join public.shift_schedules s on s.user_id = p.user_id
    where s.reminder_time is not null
  );
  $job$
);

-- Check after running:
--   select jobname, schedule, active, command like '%where exists%' as gated
--   from cron.job where jobname in ('applicant-marking', 'send-shift-reminders');
--     -- both rows: same schedule, true, true
-- After 30 minutes, the newest response should be older than the change:
--   select max(created) from net._http_response;
