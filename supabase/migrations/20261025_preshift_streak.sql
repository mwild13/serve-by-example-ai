-- Pre-shift drill and shift streak (Rich update, Phase 12, part 1).
--
-- drill_runs.kind: 'mixed' (the Mixed Drill) or 'preshift' (the shorter
--   "Ready for your shift" drill from mobile Home).
-- shift_schedules: the weekdays a person usually works (0 Sunday to 6
--   Saturday), set by them. An empty list means every day counts.
-- preshift_days: one row per person per Sydney day they finished a pre-shift
--   drill. The shift streak is worked out from these and the schedule
--   (lib/shift-streak.ts). Kept, unlike drill_runs, which are deleted after
--   a week.
--
-- Additive: safe to run before the new code is live.
-- Rollback: supabase/rollbacks/20261025_preshift_streak_rollback.sql

BEGIN;

ALTER TABLE public.drill_runs
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'mixed' CHECK (kind IN ('mixed', 'preshift'));

CREATE TABLE IF NOT EXISTS public.shift_schedules (
  user_id    uuid        PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  shift_days smallint[]  NOT NULL DEFAULT '{}'
             CHECK (shift_days <@ ARRAY[0, 1, 2, 3, 4, 5, 6]::smallint[]),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.preshift_days (
  user_id    uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  day        date        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, day)
);

-- Read and written by the API routes through the service-role client only.
ALTER TABLE public.shift_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preshift_days ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.shift_schedules FROM anon, authenticated;
REVOKE ALL ON public.preshift_days FROM anon, authenticated;

COMMIT;

-- Check after running:
--   SELECT column_name, column_default FROM information_schema.columns
--   WHERE table_name = 'drill_runs' AND column_name = 'kind';
--     -- one row, default 'mixed'
--   SELECT grantee, privilege_type FROM information_schema.role_table_grants
--   WHERE table_name IN ('shift_schedules', 'preshift_days') AND grantee IN ('anon', 'authenticated');
--     -- no rows
