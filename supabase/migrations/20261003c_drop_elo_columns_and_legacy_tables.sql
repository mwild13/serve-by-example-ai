-- Audit 2026-09-30, Phase 5 (contract step): drop the retired Elo columns and
-- the two legacy progress tables.
--
-- !! DO NOT APPLY until the Phase 5 app code is live in PRODUCTION. !!
-- Code before Phase 5 still selects these columns and tables, and a dropped
-- column makes those queries fail outright.
--
-- Before applying, confirm zero references in the deployed code:
--   grep -rnE "elo_rating|avg_module_elo|min_elo_for_advanced|user_level_progress|_legacy_user_training_progress" app lib components
-- (the only hits should be comments), and that record_attempt() no longer
-- mentions Elo (20261003b applied):
--   SELECT prosrc ILIKE '%elo%' FROM pg_proc WHERE proname = 'record_attempt';   -- false
--
-- What goes:
--   scenario_mastery.elo_rating                  computed per attempt, never a reliable signal
--   venue_staff.elo_rating, venue_staff.avg_module_elo   roster copies of the above
--   modules.min_elo_for_advanced                 gated an "advanced scenarios" path that never shipped
--   user_level_progress (3 rows on 2026-10-02)   legacy 3-stage tracking; last reader removed in Phase 5
--   _legacy_user_training_progress (8 rows)      write-only since Phase 4
--
-- Kept: module_elo_baseline. Despite its name it now stores the placement
-- check's per-category percentages, which order module recommendations.
--
-- Checked on 2026-10-02: no views, triggers or functions other than
-- record_attempt reference these columns, and no foreign keys point at the
-- two tables.
--
-- Rollback: supabase/rollbacks/20261003c_drop_elo_columns_and_legacy_tables_rollback.sql
-- restores the columns (with their defaults) and empty tables, not the data.
-- Take a backup first if the 11 legacy rows matter.

BEGIN;

ALTER TABLE public.scenario_mastery DROP COLUMN IF EXISTS elo_rating;
ALTER TABLE public.venue_staff      DROP COLUMN IF EXISTS elo_rating;
ALTER TABLE public.venue_staff      DROP COLUMN IF EXISTS avg_module_elo;
ALTER TABLE public.modules          DROP COLUMN IF EXISTS min_elo_for_advanced;

DROP TABLE IF EXISTS public.user_level_progress;
DROP TABLE IF EXISTS public._legacy_user_training_progress;

COMMIT;
