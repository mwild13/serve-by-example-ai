-- Saturday Rush, the timed service game (Rich update, Phase 15).
--
-- rush_runs: one row per finished shift. The game runs in the browser from a
--   seed; /api/training/rush replays the seed and the moves with the same
--   engine (lib/rush/engine.ts) and stores the score it worked out itself,
--   never one the browser sent. (user_id, seed) is unique, so a resent save
--   is stored once.
-- A finished shift counts as one scenario in training_activity_daily, so it
--   shows in the manager's daily activity like other practice.
--
-- Additive: safe to run before the new code is live. The game plays without
-- it; only the saving and the personal best wait for it.
-- Rollback: supabase/rollbacks/20261028_saturday_rush_rollback.sql

BEGIN;

CREATE TABLE IF NOT EXISTS public.rush_runs (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  seed        bigint      NOT NULL CHECK (seed >= 0 AND seed < 4294967296),
  moves       jsonb       NOT NULL,
  score       integer     NOT NULL CHECK (score BETWEEN 0 AND 100),
  result      jsonb       NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, seed)
);

CREATE INDEX IF NOT EXISTS rush_runs_user_idx ON public.rush_runs (user_id, created_at DESC);

ALTER TABLE public.rush_runs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.rush_runs FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.training_activity_from_rush()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.bump_training_activity(NEW.user_id, NEW.created_at, 0, 0, 1, 0);
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.training_activity_from_rush() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS training_activity_rush ON public.rush_runs;
CREATE TRIGGER training_activity_rush
  AFTER INSERT ON public.rush_runs
  FOR EACH ROW EXECUTE FUNCTION public.training_activity_from_rush();

COMMIT;

-- Check after running:
--   SELECT grantee FROM information_schema.role_table_grants
--   WHERE table_name = 'rush_runs' AND grantee IN ('anon', 'authenticated');
--     -- no rows
--   SELECT tgname FROM pg_trigger WHERE tgname = 'training_activity_rush';
--     -- one row
