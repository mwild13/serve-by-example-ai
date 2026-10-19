-- Rolls back supabase/migrations/20261023_mixed_drills.sql.
-- Deletes every drill and the record of which modules people have started.
-- Drill answers already counted in training_activity_daily stay counted.

BEGIN;

DROP TRIGGER IF EXISTS quiz_module_started ON public.verify_attempts;
DROP FUNCTION IF EXISTS public.quiz_module_started_from_verify();
DROP TABLE IF EXISTS public.drill_runs;
DROP TABLE IF EXISTS public.quiz_modules_started;

COMMIT;
