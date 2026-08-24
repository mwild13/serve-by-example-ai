-- ─────────────────────────────────────────────────────────────
-- 20260824_reset_progress_soft_delete.sql
-- Mobile bug-fix plan, Phase 3a: "Reset progress" (Me > Settings).
--
-- Adds archived_at to scenario_mastery and user_challenges so a staff
-- member's "reset progress" action can soft-delete their learning history
-- (irreversible from the UI, but not a hard SQL DELETE) rather than
-- destroying it outright. This preserves the manager-facing compliance/
-- analytics rollup in Mission Control (lib/mastery.ts's
-- syncMasteryToVenueStaff(), which reads scenario_mastery directly) — a
-- staff-triggered self-service action should never be able to silently
-- erase a manager's visibility into what that staff member has done
-- historically, which is this product's core value proposition per
-- CLAUDE.md ("managers have no visibility into who knows what").
--
-- Every existing read of these two tables (lib/mastery.ts,
-- app/api/training/progress/route.ts) is updated in the same pass to filter
-- WHERE archived_at IS NULL, and every write path that upserts on the
-- existing (user_id, module, scenario_type, scenario_index) /
-- (user_id, challenge_index) unique keys now explicitly resets
-- archived_at = NULL — so a fresh attempt on a previously-archived
-- scenario/challenge "reactivates" that row with all-new values instead of
-- either erroring on the unique-constraint conflict or silently reviving
-- stale archived data.
--
-- SAFETY: wrapped in a transaction; ADD COLUMN IF NOT EXISTS / CREATE INDEX
-- IF NOT EXISTS throughout so this is safe to re-run.
--
-- Per this repo's convention (see 20260820_scenario_mastery_scenario_type
-- .sql's own note), migration files here are written to be run manually via
-- the Supabase SQL editor, not through an automated migration runner — this
-- file has NOT been applied yet as of this commit.
-- ─────────────────────────────────────────────────────────────

BEGIN;

ALTER TABLE public.scenario_mastery
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE public.user_challenges
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL;

-- Partial indexes — every hot-path read filters `archived_at IS NULL`, and
-- archived rows are a small minority of the table, so a partial index over
-- just the live rows keeps those reads fast without bloating the index with
-- rows nothing will query by this predicate again.
CREATE INDEX IF NOT EXISTS idx_scenario_mastery_user_live
  ON public.scenario_mastery(user_id)
  WHERE archived_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_user_challenges_user_live
  ON public.user_challenges(user_id)
  WHERE archived_at IS NULL;

COMMENT ON COLUMN public.scenario_mastery.archived_at IS
  'Set by POST /api/profile/reset-progress (soft-delete) — a "reset progress" staff self-service action. NULL = live row. Never hard-deleted so manager-facing analytics (syncMasteryToVenueStaff) retain history.';
COMMENT ON COLUMN public.user_challenges.archived_at IS
  'Set by POST /api/profile/reset-progress (soft-delete). NULL = live row.';

COMMIT;
