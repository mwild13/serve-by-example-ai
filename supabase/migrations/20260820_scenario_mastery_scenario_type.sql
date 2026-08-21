-- ─────────────────────────────────────────────────────────────
-- 20260820_scenario_mastery_scenario_type.sql
-- V4 migration: disambiguate scenario_mastery's overloaded key.
--
-- Root cause (v4-migration-plan/00-bug-batch-plan.md): scenario_mastery's
-- real key today is (user_id, module, scenario_index). Three structurally
-- different systems write into that same key space:
--   - Quiz (markModuleMastered)      → always scenario_index = 0
--   - Scenario Training (recordAttempt, descriptor) → real content index,
--     0-9 for bartending/sales, 0-19 for management (trainer-data.ts)
--   - AI Arena (recordAttempt, roleplay)             → always scenario_index = 40
-- For modules 1-3, Quiz (index 0) collides with the first Scenario Training
-- scenario (also index 0, real content) — whichever writes last stomps the
-- other's mastery_level/elo_rating/total_attempts/consecutive_correct. This
-- migration adds scenario_type so all three can coexist under one uniqueness
-- key without corrupting each other.
--
-- SAFETY: whole script wrapped in a transaction — any failed step rolls
-- back everything.
--
-- APPLIED: 2026-08-20, manually via Supabase SQL editor by the user. The
-- version actually run adds explicit ::text[] casts in step 4's array
-- comparison (see comment there) — pg_attribute.attname is type `name`,
-- and there's no built-in `name[] = text[]` operator, so the uncasted
-- comparison Claude originally wrote would have failed at runtime. Fixed
-- here so this file matches what's live.
-- ─────────────────────────────────────────────────────────────

BEGIN;

-- ── 1. Add the column (nullable for now — NOT NULL only after backfill) ──
ALTER TABLE public.scenario_mastery
  ADD COLUMN IF NOT EXISTS scenario_type TEXT
  CHECK (scenario_type IN ('quiz', 'descriptor', 'roleplay'));

-- ── 2. Backfill existing rows ────────────────────────────────
-- Priority order matters: scenario_index = 0 AND is_mastered = true can only
-- ever have been written by markModuleMastered() (the only write path that
-- sets is_mastered — recordAttempt() never touches that column), so it is a
-- reliable signal even on a row whose OTHER fields (mastery_level, elo_rating,
-- total_attempts) may already be corrupted by a colliding Scenario Training
-- write. scenario_index = 40 is the fixed Arena convention (see
-- lib/mastery.ts's ARENA_SCENARIO_INDEX). Everything else is Scenario
-- Training (descriptor) content.
UPDATE public.scenario_mastery
SET scenario_type = CASE
  WHEN scenario_index = 0 AND is_mastered = TRUE THEN 'quiz'
  WHEN scenario_index = 40 THEN 'roleplay'
  ELSE 'descriptor'
END
WHERE scenario_type IS NULL;

-- ── 3. Lock the column down now that every row is classified ──
ALTER TABLE public.scenario_mastery
  ALTER COLUMN scenario_type SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_scenario_mastery_scenario_type
  ON public.scenario_mastery(scenario_type);

-- ── 4. Widen the uniqueness key to include scenario_type ──────
-- The existing 3-column unique constraint/index on
-- (user_id, module, scenario_index) predates every migration file in this
-- repo, so its name isn't known in advance — found dynamically via catalog
-- introspection rather than guessed. Handles both a named UNIQUE constraint
-- and a bare unique index (DROP CONSTRAINT no-ops harmlessly in the latter
-- case; the DROP INDEX below then catches it).
--
-- Explicit ::text[] casts on both sides of the comparison: pg_attribute's
-- attname column is type `name`, so array_agg(a.attname) produces a
-- name[], and Postgres has no built-in `name[] = text[]` array operator
-- (unlike the scalar name→text cast, array equality requires matching
-- element types) — without the casts this DO block fails at runtime.
DO $$
DECLARE
  v_name text;
BEGIN
  SELECT ix.relname INTO v_name
  FROM pg_index i
  JOIN pg_class ix ON ix.oid = i.indexrelid
  JOIN pg_class tbl ON tbl.oid = i.indrelid
  WHERE tbl.relname = 'scenario_mastery'
    AND i.indisunique
    AND (
      SELECT array_agg(a.attname ORDER BY a.attname)
      FROM unnest(i.indkey) WITH ORDINALITY AS k(attnum, ord)
      JOIN pg_attribute a ON a.attrelid = tbl.oid AND a.attnum = k.attnum
    )::text[] = ARRAY['module', 'scenario_index', 'user_id']::text[]
  LIMIT 1;

  IF v_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.scenario_mastery DROP CONSTRAINT IF EXISTS %I', v_name);
    EXECUTE format('DROP INDEX IF EXISTS public.%I', v_name);
  END IF;
END $$;

ALTER TABLE public.scenario_mastery
  ADD CONSTRAINT scenario_mastery_user_module_type_index_key
  UNIQUE (user_id, module, scenario_type, scenario_index);

-- ── 5. Verification ────────────────────────────────────────
DO $$
DECLARE
  v_null_count INT;
  v_quiz_count INT;
  v_descriptor_count INT;
  v_roleplay_count INT;
BEGIN
  SELECT COUNT(*) INTO v_null_count FROM public.scenario_mastery WHERE scenario_type IS NULL;
  SELECT COUNT(*) INTO v_quiz_count FROM public.scenario_mastery WHERE scenario_type = 'quiz';
  SELECT COUNT(*) INTO v_descriptor_count FROM public.scenario_mastery WHERE scenario_type = 'descriptor';
  SELECT COUNT(*) INTO v_roleplay_count FROM public.scenario_mastery WHERE scenario_type = 'roleplay';

  RAISE NOTICE 'scenario_type backfill complete: quiz=%, descriptor=%, roleplay=%, still_null=%',
    v_quiz_count, v_descriptor_count, v_roleplay_count, v_null_count;

  IF v_null_count > 0 THEN
    RAISE EXCEPTION 'Backfill failed: % rows still have NULL scenario_type', v_null_count;
  END IF;
END $$;

COMMIT;
