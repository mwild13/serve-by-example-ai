-- Rollback for 20261020_question_engine.sql. Run only after the old quiz code
-- is back on main: the new code can't start a run without run_state.

BEGIN;
DROP FUNCTION IF EXISTS public.advance_quiz_run(uuid, uuid, integer, jsonb, integer, text, text, integer);
ALTER TABLE public.verify_attempts DROP COLUMN IF EXISTS run_state;
COMMIT;
