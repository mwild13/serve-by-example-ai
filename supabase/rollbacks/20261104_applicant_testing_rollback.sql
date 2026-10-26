-- Rolls back supabase/migrations/20261104_applicant_testing.sql. Forgets every
-- applicant test, answer and report, and the monthly usage counts.

select cron.unschedule('trim-applicant-tests')
 where exists (select 1 from cron.job where jobname = 'trim-applicant-tests');

BEGIN;
DROP FUNCTION IF EXISTS public.claim_applicant_ai_call(uuid, integer);
DROP FUNCTION IF EXISTS public.claim_applicant_test(uuid, date, integer);
DROP TABLE IF EXISTS public.applicant_test_usage;
DROP TABLE IF EXISTS public.applicant_answers;
DROP TABLE IF EXISTS public.applicant_tests;
COMMIT;
