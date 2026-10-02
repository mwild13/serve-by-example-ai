-- Audit 2026-09-30, Phase 4: atomic attempts, idempotency, server-graded quiz.
--
-- 1. record_attempt(): Scenario Training and Arena attempts used to be a
--    read-then-upsert in lib/mastery.ts. Two requests at once lost updates
--    (M2), and a retried or double-clicked submit counted twice (M1). This
--    does the whole update in one transaction with the mastery row locked,
--    keyed by a client-generated attempt id: a repeated id returns the first
--    result and changes nothing.
-- 2. mark_module_mastered(): the quiz mastery write, same treatment.
-- 3. verify_attempts + advance_verify_attempt(): the verify quiz is graded on
--    the server one answer at a time. The browser never holds the answer key,
--    and the streak lives here, not in the request (C4).
--
-- All three functions are service_role only. Clients have no access to
-- either new table. Rollback: supabase/rollbacks/20261002_atomic_attempts_and_verify_quiz_rollback.sql

BEGIN;

-- ── training_attempts: idempotency ledger ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.training_attempts (
  id             uuid PRIMARY KEY,
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module         text NOT NULL,
  scenario_type  text NOT NULL CHECK (scenario_type IN ('descriptor', 'roleplay')),
  scenario_index integer NOT NULL,
  score          integer NOT NULL,
  -- record_attempt()'s result, returned again on a repeated attempt id.
  result         jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- The grader's feedback, so a retry gets the same answer without a second
  -- OpenAI call.
  evaluation     jsonb,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_training_attempts_user_created ON public.training_attempts (user_id, created_at);

ALTER TABLE public.training_attempts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.training_attempts FROM anon, authenticated;

-- ── verify_attempts: one row per verify quiz run ─────────────────────────
CREATE TABLE IF NOT EXISTS public.verify_attempts (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id      integer NOT NULL,
  -- Question indexes in the order they are asked. Only the server knows
  -- which answers are right.
  question_order integer[] NOT NULL,
  position       integer NOT NULL DEFAULT 0,
  streak         integer NOT NULL DEFAULT 0,
  status         text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'passed', 'exhausted')),
  created_at     timestamptz NOT NULL DEFAULT now(),
  expires_at     timestamptz NOT NULL,
  completed_at   timestamptz
);
CREATE INDEX IF NOT EXISTS idx_verify_attempts_user_module_created ON public.verify_attempts (user_id, module_id, created_at);

ALTER TABLE public.verify_attempts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.verify_attempts FROM anon, authenticated;

-- ── record_attempt ───────────────────────────────────────────────────────
-- Port of recordAttempt() from lib/mastery.ts, same rules, plus:
--   - scores are clamped to 0..25 and rounded (scenario_mastery stores
--     integers; Arena's score/4 was fractional, so its upserts were failing)
--   - a spam-guarded attempt no longer moves last_attempt_at, so the 60-minute
--     window can't keep sliding (L3)
--   - the Pro-badge streak on profiles is updated in the same transaction
CREATE OR REPLACE FUNCTION public.record_attempt(
  p_attempt_id     uuid,
  p_user_id        uuid,
  p_module         text,
  p_module_id      integer,
  p_scenario_type  text,
  p_scenario_index integer,
  p_score          numeric,
  p_passed         boolean,
  p_confidence     text,
  p_evaluation     jsonb DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prior        public.training_attempts%ROWTYPE;
  v_row          public.scenario_mastery%ROWTYPE;
  v_now          timestamptz := now();
  v_score        integer;
  v_correct      boolean;
  v_fresh        boolean;
  v_guarded      boolean := false;
  v_prev_level   integer;
  v_level        integer;
  v_cc           integer;
  v_cf           integer;
  v_elo          integer;
  v_new_elo      integer;
  v_total        integer;
  v_difficulty   integer;
  v_expected     double precision;
  v_review       timestamptz;
  v_persona      text;
  v_result       jsonb;
BEGIN
  IF p_attempt_id IS NULL OR p_user_id IS NULL OR p_module IS NULL OR p_scenario_index IS NULL THEN
    RAISE EXCEPTION 'record_attempt: missing argument';
  END IF;
  IF p_scenario_type NOT IN ('descriptor', 'roleplay') THEN
    RAISE EXCEPTION 'record_attempt: invalid scenario_type %', p_scenario_type;
  END IF;
  IF p_confidence NOT IN ('low', 'medium', 'high') THEN
    RAISE EXCEPTION 'record_attempt: invalid confidence %', p_confidence;
  END IF;
  IF p_score IS NULL OR p_score = 'NaN'::numeric THEN
    RAISE EXCEPTION 'record_attempt: invalid score';
  END IF;

  v_score   := greatest(0, least(25, round(p_score)))::integer;
  v_correct := coalesce(p_passed, v_score >= 15);

  -- Claim the attempt id. A concurrent call with the same id waits here for
  -- the first to commit, then takes the replay branch.
  INSERT INTO public.training_attempts (id, user_id, module, scenario_type, scenario_index, score, evaluation)
  VALUES (p_attempt_id, p_user_id, p_module, p_scenario_type, p_scenario_index, v_score, p_evaluation)
  ON CONFLICT (id) DO NOTHING;

  IF NOT FOUND THEN
    SELECT * INTO v_prior FROM public.training_attempts WHERE id = p_attempt_id;
    IF v_prior.user_id <> p_user_id OR v_prior.module <> p_module
       OR v_prior.scenario_type <> p_scenario_type OR v_prior.scenario_index <> p_scenario_index THEN
      RAISE EXCEPTION 'ATTEMPT_ID_CONFLICT';
    END IF;
    RETURN v_prior.result || jsonb_build_object('replayed', true, 'evaluation', v_prior.evaluation);
  END IF;

  -- Make sure the mastery row exists, then lock it.
  INSERT INTO public.scenario_mastery (user_id, module, module_id, scenario_type, scenario_index)
  VALUES (p_user_id, p_module, p_module_id, p_scenario_type, p_scenario_index)
  ON CONFLICT (user_id, module, scenario_type, scenario_index) DO NOTHING;

  SELECT * INTO v_row FROM public.scenario_mastery
  WHERE user_id = p_user_id AND module = p_module
    AND scenario_type = p_scenario_type AND scenario_index = p_scenario_index
  FOR UPDATE;

  -- An archived row (reset progress) counts as not existing: start clean.
  v_fresh      := v_row.archived_at IS NOT NULL;
  v_prev_level := CASE WHEN v_fresh THEN 0 ELSE v_row.mastery_level END;
  v_cc         := CASE WHEN v_fresh THEN 0 ELSE v_row.consecutive_correct END;
  v_cf         := CASE WHEN v_fresh THEN 0 ELSE v_row.consecutive_fails END;
  v_elo        := CASE WHEN v_fresh THEN 1200 ELSE v_row.elo_rating END;
  v_total      := CASE WHEN v_fresh THEN 0 ELSE v_row.total_attempts END;

  IF NOT v_fresh AND v_row.last_attempt_at IS NOT NULL
     AND v_now - v_row.last_attempt_at < interval '60 minutes' THEN
    v_guarded := true;
  END IF;

  -- Elo (retired in Phase 5): difficulty scales 1000..1400 by index.
  v_difficulty := 1000 + round(
    p_scenario_index::numeric
    / greatest(CASE p_module WHEN 'management' THEN 20 ELSE 10 END - 1, 1)
    * 400)::integer;
  v_expected := 1 / (1 + power(10::double precision, (v_difficulty - v_elo) / 400.0));
  v_new_elo  := round(v_elo + 32 * (least(v_score / 25.0, 1) - v_expected))::integer;

  v_level := v_prev_level;
  IF NOT v_guarded THEN
    IF v_correct THEN
      v_cc := v_cc + 1;
      v_cf := 0;
      IF v_cc >= 3 THEN
        v_level := 3;
      ELSIF v_cc >= 2 THEN
        v_level := greatest(v_level, 2);
      ELSE
        v_level := greatest(v_level, 1);
      END IF;
    ELSE
      v_cc := 0;
      v_cf := v_cf + 1;
      v_level := greatest(v_level - 1, 0);
    END IF;
  END IF;

  v_persona := CASE
    WHEN p_confidence = 'high' AND v_correct THEN 'expert'
    WHEN p_confidence = 'low'  AND v_correct THEN 'lucky-guesser'
    WHEN p_confidence = 'high' THEN 'liability'
    ELSE 'student'
  END;

  v_review := CASE WHEN v_correct
    THEN v_now + make_interval(days => greatest(v_level, 1) * greatest(v_level, 1))
    ELSE v_now END;

  UPDATE public.scenario_mastery SET
    module_id                 = coalesce(p_module_id, module_id),
    mastery_level             = v_level,
    consecutive_correct       = v_cc,
    consecutive_fails         = v_cf,
    total_attempts            = v_total + 1,
    total_score_points        = CASE WHEN v_fresh THEN 0 ELSE total_score_points END + v_score,
    best_score                = greatest(CASE WHEN v_fresh THEN 0 ELSE best_score END, v_score),
    last_score                = v_score,
    last_attempt_at           = CASE WHEN v_guarded THEN last_attempt_at ELSE v_now END,
    next_review_at            = v_review,
    elo_rating                = v_new_elo,
    last_confidence           = p_confidence,
    high_confidence_incorrect = CASE WHEN v_fresh THEN 0 ELSE high_confidence_incorrect END
                                + CASE WHEN p_confidence = 'high' AND NOT v_correct THEN 1 ELSE 0 END,
    low_confidence_correct    = CASE WHEN v_fresh THEN 0 ELSE low_confidence_correct END
                                + CASE WHEN p_confidence = 'low' AND v_correct THEN 1 ELSE 0 END,
    -- Arena: a pass sets is_mastered, and a later fail never clears it.
    is_mastered               = (NOT v_fresh AND is_mastered)
                                OR (p_scenario_type = 'roleplay' AND v_correct),
    updated_at                = v_now,
    archived_at               = NULL
  WHERE id = v_row.id;

  -- Pro-badge streak: Scenario Training only, skipped when spam-guarded.
  IF p_scenario_type = 'descriptor' AND NOT v_guarded THEN
    UPDATE public.profiles SET
      current_correct_streak = CASE WHEN v_score >= 15 THEN coalesce(current_correct_streak, 0) + 1 ELSE 0 END,
      best_correct_streak    = greatest(coalesce(best_correct_streak, 0),
                                 CASE WHEN v_score >= 15 THEN coalesce(current_correct_streak, 0) + 1 ELSE 0 END)
    WHERE id = p_user_id;
  END IF;

  v_result := jsonb_build_object(
    'masteryLevel',       v_level,
    'previousLevel',      v_prev_level,
    'levelChanged',       v_level <> v_prev_level,
    'spamGuarded',        v_guarded,
    'eloRating',          v_new_elo,
    'eloDelta',           v_new_elo - v_elo,
    'nextReviewAt',       v_review,
    'isBridge',           v_cf >= 2,
    'consecutiveFails',   v_cf,
    'confidenceAccuracy', v_persona
  );

  UPDATE public.training_attempts SET result = v_result WHERE id = p_attempt_id;

  RETURN v_result || jsonb_build_object('replayed', false);
END;
$$;

-- ── mark_module_mastered ─────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.mark_module_mastered(
  p_user_id   uuid,
  p_module    text,
  p_module_id integer,
  p_streak    integer
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row     public.scenario_mastery%ROWTYPE;
  v_now     timestamptz := now();
  v_score   integer := least(greatest(coalesce(p_streak, 0), 0) * 5, 25);
  v_fresh   boolean;
  v_already boolean;
BEGIN
  INSERT INTO public.scenario_mastery (user_id, module, module_id, scenario_type, scenario_index)
  VALUES (p_user_id, p_module, p_module_id, 'quiz', 0)
  ON CONFLICT (user_id, module, scenario_type, scenario_index) DO NOTHING;

  SELECT * INTO v_row FROM public.scenario_mastery
  WHERE user_id = p_user_id AND module = p_module AND scenario_type = 'quiz' AND scenario_index = 0
  FOR UPDATE;

  v_fresh   := v_row.archived_at IS NOT NULL;
  v_already := NOT v_fresh AND v_row.is_mastered;

  UPDATE public.scenario_mastery SET
    module_id           = coalesce(p_module_id, module_id),
    is_mastered         = true,
    mastery_level       = 3,
    consecutive_correct = greatest(coalesce(p_streak, 0), 0),
    consecutive_fails   = 0,
    total_attempts      = CASE WHEN v_fresh THEN 0 ELSE total_attempts END + 1,
    total_score_points  = CASE WHEN v_fresh THEN 0 ELSE total_score_points END + v_score,
    best_score          = greatest(CASE WHEN v_fresh THEN 0 ELSE best_score END, v_score),
    last_score          = v_score,
    last_attempt_at     = v_now,
    next_review_at      = v_now,
    updated_at          = v_now,
    archived_at         = NULL
  WHERE id = v_row.id;

  RETURN jsonb_build_object('alreadyMastered', v_already);
END;
$$;

-- ── advance_verify_attempt ───────────────────────────────────────────────
-- Records one graded quiz answer. The route grades it (the answer key lives
-- in server code) and passes p_position, the position it graded; if the
-- attempt has moved on in the meantime this raises instead of counting the
-- answer twice. Reaching p_required in a row marks the module mastered in
-- the same transaction, exactly once per attempt.
CREATE OR REPLACE FUNCTION public.advance_verify_attempt(
  p_attempt_id uuid,
  p_user_id    uuid,
  p_position   integer,
  p_correct    boolean,
  p_required   integer,
  p_module     text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_att     public.verify_attempts%ROWTYPE;
  v_streak  integer;
  v_status  text := 'active';
  v_mastery jsonb := NULL;
BEGIN
  SELECT * INTO v_att FROM public.verify_attempts
  WHERE id = p_attempt_id AND user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'VERIFY_ATTEMPT_NOT_FOUND'; END IF;
  IF v_att.status <> 'active' THEN RAISE EXCEPTION 'VERIFY_ATTEMPT_CLOSED'; END IF;
  IF v_att.expires_at <= now() THEN RAISE EXCEPTION 'VERIFY_ATTEMPT_EXPIRED'; END IF;
  IF v_att.position <> p_position THEN RAISE EXCEPTION 'VERIFY_POSITION_MISMATCH'; END IF;

  v_streak := CASE WHEN p_correct THEN v_att.streak + 1 ELSE 0 END;

  IF v_streak >= p_required THEN
    v_status  := 'passed';
    v_mastery := public.mark_module_mastered(p_user_id, p_module, v_att.module_id, v_streak);
  ELSIF p_position + 1 >= coalesce(array_length(v_att.question_order, 1), 0) THEN
    v_status := 'exhausted';
  END IF;

  UPDATE public.verify_attempts SET
    position     = p_position + 1,
    streak       = v_streak,
    status       = v_status,
    completed_at = CASE WHEN v_status <> 'active' THEN now() ELSE NULL END
  WHERE id = p_attempt_id;

  RETURN jsonb_build_object(
    'streak',          v_streak,
    'status',          v_status,
    'alreadyMastered', coalesce((v_mastery ->> 'alreadyMastered')::boolean, false)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.record_attempt(uuid, uuid, text, integer, text, integer, numeric, boolean, text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.mark_module_mastered(uuid, text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.advance_verify_attempt(uuid, uuid, integer, boolean, integer, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_attempt(uuid, uuid, text, integer, text, integer, numeric, boolean, text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.mark_module_mastered(uuid, text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.advance_verify_attempt(uuid, uuid, integer, boolean, integer, text) TO service_role;

COMMIT;

-- Verification (run after applying):
--   SELECT proname, proacl FROM pg_proc WHERE proname IN ('record_attempt','mark_module_mastered','advance_verify_attempt');
--     -- proacl lists service_role only (plus the owner)
--   SELECT grantee, privilege_type FROM information_schema.role_table_grants
--   WHERE table_name IN ('training_attempts','verify_attempts') AND grantee IN ('anon','authenticated');
--     -- no rows
