-- The question engine (Rich update, Phase 2). Quiz runs now ask questions in
-- several formats and bring a missed fact back in another form, so the order
-- changes as the run goes. The app plans each step (lib/verify-quiz.ts) and
-- stores the run in run_state; advance_quiz_run() saves one answer under a
-- row lock and masters the module when the run passes.
--
-- Additive: safe to run before the new code is live. The old engine's
-- advance_verify_attempt() and question_order stay until a later cleanup.
-- Rollback: supabase/rollbacks/20261020_question_engine_rollback.sql

BEGIN;

ALTER TABLE public.verify_attempts ADD COLUMN IF NOT EXISTS run_state jsonb;

CREATE OR REPLACE FUNCTION public.advance_quiz_run(
  p_attempt_id uuid,
  p_user_id    uuid,
  p_position   integer,
  p_run_state  jsonb,
  p_streak     integer,
  p_status     text,
  p_module     text,
  p_score      integer
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_att     public.verify_attempts%ROWTYPE;
  v_mastery jsonb := NULL;
BEGIN
  IF p_status NOT IN ('active', 'passed', 'exhausted') THEN
    RAISE EXCEPTION 'advance_quiz_run: invalid status %', p_status;
  END IF;
  IF p_run_state IS NULL OR jsonb_typeof(p_run_state) <> 'object' THEN
    RAISE EXCEPTION 'advance_quiz_run: invalid run_state';
  END IF;

  SELECT * INTO v_att FROM public.verify_attempts
  WHERE id = p_attempt_id AND user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND OR v_att.run_state IS NULL THEN RAISE EXCEPTION 'VERIFY_ATTEMPT_NOT_FOUND'; END IF;
  IF v_att.status <> 'active' THEN RAISE EXCEPTION 'VERIFY_ATTEMPT_CLOSED'; END IF;
  IF v_att.expires_at <= now() THEN RAISE EXCEPTION 'VERIFY_ATTEMPT_EXPIRED'; END IF;
  -- The app planned this step from the row as it was at p_position. Any
  -- other answer since then moved the position, so the plan is stale.
  IF v_att.position <> p_position THEN RAISE EXCEPTION 'VERIFY_POSITION_MISMATCH'; END IF;

  IF p_status = 'passed' THEN
    v_mastery := public.mark_module_mastered(p_user_id, p_module, v_att.module_id, p_score);
  END IF;

  UPDATE public.verify_attempts SET
    position     = p_position + 1,
    streak       = greatest(coalesce(p_streak, 0), 0),
    status       = p_status,
    run_state    = p_run_state,
    completed_at = CASE WHEN p_status <> 'active' THEN now() ELSE NULL END
  WHERE id = p_attempt_id;

  RETURN jsonb_build_object(
    'status',          p_status,
    'alreadyMastered', coalesce((v_mastery ->> 'alreadyMastered')::boolean, false)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.advance_quiz_run(uuid, uuid, integer, jsonb, integer, text, text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.advance_quiz_run(uuid, uuid, integer, jsonb, integer, text, text, integer) TO service_role;

COMMIT;

-- Check after running:
--   SELECT proname, proacl FROM pg_proc WHERE proname = 'advance_quiz_run';
--     -- proacl lists service_role only (plus the owner)
--   SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_name = 'verify_attempts' AND column_name = 'run_state';
--     -- one row, jsonb
