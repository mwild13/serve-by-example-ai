-- Rolls back supabase/migrations/20261105_applicant_marking_cron.sql.
select cron.unschedule('applicant-marking')
 where exists (select 1 from cron.job where jobname = 'applicant-marking');
