-- Rollback for 20261017_notification_sender.sql.
-- Stops the schedule and removes the send log and its functions. The Vault
-- secret and the two extensions are left in place: other features may come
-- to use them, and removing a secret that Cloudflare still holds is harmless
-- but confusing. Drop them by hand if wanted:
--   select vault... (Project Settings, Vault, delete notifications_cron_secret)
--   drop extension pg_net; drop extension pg_cron;

select cron.unschedule('send-notification-emails')
 where exists (select 1 from cron.job where jobname = 'send-notification-emails');

drop function if exists public.finish_notification_batch(text, date, uuid[], uuid[]);
drop function if exists public.claim_notification_batch(text, date, date, date, integer);
drop table if exists public.notification_sends;
