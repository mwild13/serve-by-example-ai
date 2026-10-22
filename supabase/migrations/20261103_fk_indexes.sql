-- Index the last four foreign keys that had none (Supabase performance
-- advisor, lint 0001, 2026-10-22). Every other foreign key and the columns
-- the app filters on (venue_id, user_id, manager_user_id, org_id,
-- stripe_customer_id, created_at) already have one.
--
-- These are audit stamps the app never filters by, but deleting an account
-- or a module has to find the rows that point at it (SET NULL / CASCADE),
-- and without an index that is a full scan of the table.
--
-- Additive: safe to run before or after the code.
-- Rollback: supabase/rollbacks/20261103_fk_indexes_rollback.sql

CREATE INDEX IF NOT EXISTS quiz_modules_started_module_id_idx
  ON public.quiz_modules_started (module_id);
CREATE INDEX IF NOT EXISTS venue_content_items_created_by_idx
  ON public.venue_content_items (created_by);
CREATE INDEX IF NOT EXISTS venue_content_questions_reviewed_by_idx
  ON public.venue_content_questions (reviewed_by);
CREATE INDEX IF NOT EXISTS venue_weeks_updated_by_idx
  ON public.venue_weeks (updated_by);
