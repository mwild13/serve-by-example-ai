-- Stage 2: Seat Correction & Mastery Backfill
-- Purpose:
--   1. Correct tier/plan seat limits that were initially set incorrectly
--   2. Retroactively backfill mastery streak and completion data
-- Date: 2026-06-29

-- ============================================================
-- PART 1: SEAT CORRECTION VIA TIER/PLAN
-- ============================================================
-- NOTE: Seats are NOT stored in DB — they are derived from tier (plan column).
-- This script documents the corrected tiers for reference.
-- The live tier-to-seat mapping in app/api/management/memberships/route.ts:
--   boutique: 15
--   commercial: 35
--   enterprise: 9999
--   venue_single: 15
--   venue_multi: 35

-- Identify managers currently on legacy Boutique plan (15 seats)
-- Boutique tier has been corrected in code to 15 seats ✓

-- Identify managers currently on Commercial plan (now 35 seats)
-- Commercial plan: previously was 25, now corrected to 35 ✓

-- No schema changes needed — tier mapping is in application code only.
-- The corrected tier limits are:
-- - Boutique/venue_single: 15 seats (confirmed)
-- - Commercial/venue_multi: 35 seats (corrected from 25)
-- - Enterprise: unlimited

-- ============================================================
-- PART 2: MASTERY STREAKS & COMPLETION BACKFILL
-- ============================================================

-- Query mastery_rows to retroactively compute streaks
-- Compute current_correct_streak: consecutive correct from most recent attempts
-- Compute best_correct_streak: max consecutive correct ever achieved
-- Determine all_modules_completed: true if user mastered all 20 modules
-- Determine sbe_elite_number: 1 if user has completed at least 20 distinct modules

-- This backfill depends on scenario_mastery table existing
-- and having is_mastered, consecutive_correct, module_id columns

DO $$
DECLARE
  v_user_id uuid;
  v_current_streak integer;
  v_best_streak integer;
  v_mastered_count integer;
  v_elite_flag boolean;
BEGIN
  -- Cursor through all distinct user_ids with training history
  FOR v_user_id IN (
    SELECT DISTINCT user_id FROM scenario_mastery WHERE user_id IS NOT NULL
  ) LOOP
    -- Get best consecutive_correct across all scenarios for this user
    SELECT COALESCE(MAX(consecutive_correct), 0) INTO v_best_streak
    FROM scenario_mastery
    WHERE user_id = v_user_id;

    -- Get current streak (most recent attempt in scenario_mastery)
    SELECT COALESCE(MAX(consecutive_correct), 0) INTO v_current_streak
    FROM scenario_mastery
    WHERE user_id = v_user_id
    ORDER BY last_attempt_at DESC
    LIMIT 1;

    -- Count distinct modules where is_mastered = true at scenario_index = 0
    SELECT COUNT(DISTINCT module_id) INTO v_mastered_count
    FROM scenario_mastery
    WHERE user_id = v_user_id
      AND is_mastered = true
      AND module_id IS NOT NULL
      AND scenario_index = 0;

    -- Elite flag: true if user mastered 20 or more distinct modules
    v_elite_flag := v_mastered_count >= 20;

    -- Update profiles with backfilled values
    UPDATE profiles
    SET
      current_correct_streak = v_current_streak,
      best_correct_streak = v_best_streak,
      sbe_elite_number = CASE WHEN v_elite_flag THEN 1 ELSE 0 END,
      all_modules_completed = v_elite_flag
    WHERE id = v_user_id;
  END LOOP;

  RAISE NOTICE 'Mastery backfill complete: % users processed',
    (SELECT COUNT(DISTINCT user_id) FROM scenario_mastery WHERE user_id IS NOT NULL);
END $$;

-- ============================================================
-- VERIFY CORRECTIONS
-- ============================================================

SELECT
  p.id,
  p.email,
  p.plan,
  p.current_correct_streak,
  p.best_correct_streak,
  p.sbe_elite_number,
  p.all_modules_completed,
  COUNT(DISTINCT sm.module_id) FILTER (WHERE sm.is_mastered = true AND sm.scenario_index = 0) as modules_mastered
FROM profiles p
LEFT JOIN scenario_mastery sm ON p.id = sm.user_id AND sm.is_mastered = true AND sm.scenario_index = 0
WHERE p.plan IN ('commercial', 'boutique', 'venue_single', 'venue_multi', 'enterprise')
  OR p.all_modules_completed = true
GROUP BY p.id, p.email, p.plan, p.current_correct_streak, p.best_correct_streak, p.sbe_elite_number, p.all_modules_completed
ORDER BY p.email;
