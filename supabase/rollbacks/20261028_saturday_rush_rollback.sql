-- Rolls back supabase/migrations/20261028_saturday_rush.sql. Forgets every
-- saved shift; the activity already counted stays in training_activity_daily.

BEGIN;
DROP TRIGGER IF EXISTS training_activity_rush ON public.rush_runs;
DROP FUNCTION IF EXISTS public.training_activity_from_rush();
DROP TABLE IF EXISTS public.rush_runs;
COMMIT;
