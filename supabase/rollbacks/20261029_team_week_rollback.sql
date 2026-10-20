-- Rolls back supabase/migrations/20261029_team_week.sql. Forgets the answer
-- log and every venue's goals and guests of the week.

select cron.unschedule('trim-quiz-answer-log')
 where exists (select 1 from cron.job where jobname = 'trim-quiz-answer-log');

BEGIN;
DROP TABLE IF EXISTS public.venue_weeks;
DROP TABLE IF EXISTS public.quiz_answer_log;
COMMIT;
