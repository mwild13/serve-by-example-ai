-- Rolls back supabase/migrations/20261106_gate_cron_http_calls.sql:
-- both jobs call their route on every run again.
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
