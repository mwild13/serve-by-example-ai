-- Mixed drills (Rich update, Phase 10): a short quiz that mixes questions
-- from every module the person has started or mastered. A drill never
-- masters a module; it's practice.
--
-- quiz_modules_started: one row per person per module, the first time they
--   answer a question in that module's quiz. verify_attempts rows are deleted
--   after a day, so they can't say which modules someone has started. Filled
--   by a trigger on verify_attempts, and backfilled from the runs still kept
--   and from mastered modules.
--
-- drill_runs: one row per drill.
--   run_state: { "queue": ["<module id>:<question id>", ...],
--                "titles": { "<module id>": "<title>" },
--                "results": [{ "module": <id>, "correct": bool }, ...] }
--   position: questions answered. Each answer is saved only if position is
--     still what the server read, so two answers can't land on one question.
--   The latest drill is kept even when old, so the next one can avoid its
--   questions.
--
-- Drill answers count towards training_activity_daily.quiz_answers, through
-- the same trigger function as module quiz answers.
--
-- Additive: safe to run before the new code is live.
-- Rollback: supabase/rollbacks/20261023_mixed_drills_rollback.sql

BEGIN;

CREATE TABLE IF NOT EXISTS public.quiz_modules_started (
  user_id    uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  module_id  integer     NOT NULL REFERENCES public.modules (id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, module_id)
);

ALTER TABLE public.quiz_modules_started ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.quiz_modules_started FROM anon, authenticated;

CREATE TABLE IF NOT EXISTS public.drill_runs (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  run_state    jsonb       NOT NULL,
  position     integer     NOT NULL DEFAULT 0,
  correct      integer     NOT NULL DEFAULT 0,
  status       text        NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'finished')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  expires_at   timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS drill_runs_user_created_idx
  ON public.drill_runs (user_id, created_at DESC);

-- Read and written by the API routes through the service-role client only.
ALTER TABLE public.drill_runs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.drill_runs FROM anon, authenticated;

-- The first answer in a module quiz marks the module as started.
CREATE OR REPLACE FUNCTION public.quiz_module_started_from_verify()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.position > 0 AND OLD.position = 0 THEN
    INSERT INTO public.quiz_modules_started (user_id, module_id)
    VALUES (NEW.user_id, NEW.module_id)
    ON CONFLICT (user_id, module_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.quiz_module_started_from_verify() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS quiz_module_started ON public.verify_attempts;
CREATE TRIGGER quiz_module_started
  AFTER UPDATE OF position ON public.verify_attempts
  FOR EACH ROW EXECUTE FUNCTION public.quiz_module_started_from_verify();

-- training_activity_from_verify() reads only user_id, position and status,
-- which drill_runs has too. A drill is never 'passed', so it adds answers only.
DROP TRIGGER IF EXISTS training_activity_drill ON public.drill_runs;
CREATE TRIGGER training_activity_drill
  AFTER UPDATE OF position, status ON public.drill_runs
  FOR EACH ROW EXECUTE FUNCTION public.training_activity_from_verify();

-- Backfill: runs still kept, and every module mastered by quiz.
INSERT INTO public.quiz_modules_started (user_id, module_id, started_at)
SELECT user_id, module_id, min(at)
FROM (
  SELECT user_id, module_id, created_at AS at
  FROM public.verify_attempts WHERE position > 0
  UNION ALL
  SELECT user_id, module_id, coalesce(updated_at, created_at)
  FROM public.scenario_mastery
  WHERE scenario_type = 'quiz' AND is_mastered = true AND module_id IS NOT NULL AND archived_at IS NULL
) history
WHERE EXISTS (SELECT 1 FROM auth.users u WHERE u.id = history.user_id)
  AND EXISTS (SELECT 1 FROM public.modules m WHERE m.id = history.module_id)
GROUP BY user_id, module_id
ON CONFLICT (user_id, module_id) DO NOTHING;

COMMIT;

-- Check after running:
--   SELECT count(*) AS rows, count(DISTINCT user_id) AS people FROM public.quiz_modules_started;
--   SELECT grantee, privilege_type FROM information_schema.role_table_grants
--   WHERE table_name IN ('drill_runs', 'quiz_modules_started') AND grantee IN ('anon', 'authenticated');
--     -- no rows
--   SELECT tgname FROM pg_trigger WHERE tgname IN ('quiz_module_started', 'training_activity_drill');
--     -- two rows
