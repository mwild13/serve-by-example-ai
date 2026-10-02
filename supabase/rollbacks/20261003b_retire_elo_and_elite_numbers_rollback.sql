-- ROLLBACK for supabase/migrations/20261003b_retire_elo_and_elite_numbers.sql
--
-- Restores the Phase 4 record_attempt() (with Elo) and removes the SBE Elite
-- numbering. Only meaningful while scenario_mastery.elo_rating still exists
-- (i.e. before 20261003c). Revert the app code first: Phase 5 code calls
-- award_sbe_elite(). Any Elite numbers already assigned stay on profiles.

BEGIN;

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

DROP FUNCTION IF EXISTS public.award_sbe_elite(uuid);
DROP SEQUENCE IF EXISTS public.sbe_elite_number_seq;

COMMIT;
