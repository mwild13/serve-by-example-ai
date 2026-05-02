-- ─────────────────────────────────────────────────────────────
-- 20260502_v3_purge_legacy_stages.sql
-- V3 migration: purge legacy descriptor + roleplay content,
-- clean orphaned mastery rows, add binary mastery flag.
--
-- SAFETY: Wrap whole script in a transaction. If any step fails,
-- everything rolls back. Backup tables are kept on commit.
-- See docs/v3-architecture.md for the V3 architecture.
-- ─────────────────────────────────────────────────────────────

BEGIN;

-- ── 1. Pre-flight audit ─────────────────────────────────────
-- Surface counts before any destructive action. Review output.
DO $$
DECLARE
  v_l2_count   INT;
  v_l3_count   INT;
  v_rp_count   INT;
  v_orphan_count INT;
BEGIN
  SELECT COUNT(*) INTO v_l2_count FROM public.scenarios WHERE scenario_type = 'descriptor_l2';
  SELECT COUNT(*) INTO v_l3_count FROM public.scenarios WHERE scenario_type = 'descriptor_l3';
  SELECT COUNT(*) INTO v_rp_count FROM public.scenarios WHERE scenario_type = 'roleplay';

  -- Orphan candidates: scenario_mastery rows where scenario_index >= 1
  -- (legacy stage 2 = index 1, stage 3 = index 2, stage 4 = index 3).
  -- Index 0 = stage 1 quiz mastery, which V3 still uses (binary verify).
  SELECT COUNT(*) INTO v_orphan_count
  FROM public.scenario_mastery
  WHERE scenario_index >= 1;

  RAISE NOTICE 'V3 purge preview: descriptor_l2=%, descriptor_l3=%, roleplay=%, orphan_mastery_rows=%',
    v_l2_count, v_l3_count, v_rp_count, v_orphan_count;
END $$;

-- ── 2. Backups (kept on commit; drop manually after V3 sign-off) ──
CREATE TABLE IF NOT EXISTS public._v3_backup_scenarios_20260502 AS
  SELECT * FROM public.scenarios
  WHERE scenario_type IN ('descriptor_l2', 'descriptor_l3', 'roleplay');

CREATE TABLE IF NOT EXISTS public._v3_backup_scenario_mastery_20260502 AS
  SELECT * FROM public.scenario_mastery
  WHERE scenario_index >= 1;

-- ── 3. Orphan cleanup on scenario_mastery ───────────────────
-- Remove mastery rows tied to legacy stages 2/3/4. Binary V3
-- mastery uses a single row per (user_id, module_id) at index 0.
DELETE FROM public.scenario_mastery
WHERE scenario_index >= 1;

-- ── 4. Purge legacy scenario_types ──────────────────────────
DELETE FROM public.scenarios
WHERE scenario_type IN ('descriptor_l2', 'descriptor_l3', 'roleplay');

-- ── 5. Add V3 binary mastery flag (additive, nullable) ──────
ALTER TABLE public.scenario_mastery
  ADD COLUMN IF NOT EXISTS is_mastered BOOLEAN NOT NULL DEFAULT FALSE;

-- Backfill: any legacy row at mastery_level >= 3 → is_mastered = true.
UPDATE public.scenario_mastery
SET is_mastered = TRUE
WHERE mastery_level >= 3;

CREATE INDEX IF NOT EXISTS idx_scenario_mastery_is_mastered
  ON public.scenario_mastery(user_id, is_mastered);

-- ── 6. Verification ────────────────────────────────────────
DO $$
DECLARE
  v_remaining_legacy INT;
  v_quiz_count INT;
  v_mastered_count INT;
BEGIN
  SELECT COUNT(*) INTO v_remaining_legacy
  FROM public.scenarios
  WHERE scenario_type IN ('descriptor_l2', 'descriptor_l3', 'roleplay');

  SELECT COUNT(*) INTO v_quiz_count
  FROM public.scenarios WHERE scenario_type = 'quiz';

  SELECT COUNT(*) INTO v_mastered_count
  FROM public.scenario_mastery WHERE is_mastered = TRUE;

  RAISE NOTICE 'V3 purge complete: remaining_legacy=%, quiz_scenarios=%, mastered_rows=%',
    v_remaining_legacy, v_quiz_count, v_mastered_count;

  IF v_remaining_legacy > 0 THEN
    RAISE EXCEPTION 'Purge failed: % legacy rows remain', v_remaining_legacy;
  END IF;
END $$;

COMMIT;

-- ── Post-commit cleanup (run later, after V3 sign-off) ─────
-- DROP TABLE public._v3_backup_scenarios_20260502;
-- DROP TABLE public._v3_backup_scenario_mastery_20260502;
