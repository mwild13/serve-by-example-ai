-- Rolls back supabase/migrations/20261025_preshift_streak.sql.
-- Deletes everyone's shift days and pre-shift drill history (the streaks).

BEGIN;

DROP TABLE IF EXISTS public.preshift_days;
DROP TABLE IF EXISTS public.shift_schedules;
ALTER TABLE public.drill_runs DROP COLUMN IF EXISTS kind;

COMMIT;
