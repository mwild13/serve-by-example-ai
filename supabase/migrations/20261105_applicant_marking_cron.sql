-- Applicant Testing: the marking safety net (docs/APPLICANT_TESTING.md §4).
-- Every 5 minutes, /api/cron/applicant-marking finishes the oldest finished
-- applicant test whose written answers or summary are still waiting, if the
-- background run after the test didn't. Most runs find nothing to do.
--
-- Same shared secret as the reminders and notification emails
-- (notifications_cron_secret in Vault). Additive: until the route is live on
-- production, each call is a harmless 404.
-- Rollback: supabase/rollbacks/20261105_applicant_marking_cron_rollback.sql

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
  );
  $job$
);

-- Check after running:
--   select jobname, schedule, active from cron.job where jobname = 'applicant-marking';
--     -- */5 * * * *, true
