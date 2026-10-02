-- Audit 2026-09-30, follow-up found in Phase 5: the verify quiz answer key was
-- still readable by any signed-in user.
--
-- public.scenarios holds the 320 verify quiz questions (8 per module, all 40
-- modules) with their answers and explanations in `content`. The policy
-- "Anyone can read scenarios" (SELECT, authenticated, USING true) let any
-- account read the whole table straight from PostgREST with the public anon
-- key and its own JWT, which undid Phase 4's server-side grading (C4).
--
-- No app code reads this table through a user client: the quiz is graded
-- from lib/verify-questions.ts, and the only route that queried the table
-- (/api/training/modules/[moduleId]/scenarios, no callers) is deleted in the
-- same release. The service role keeps full access.
--
-- Safe to apply at any time, independent of the app deploy.
-- Rollback: supabase/rollbacks/20261003_lock_scenarios_answer_key_rollback.sql

BEGIN;

DROP POLICY IF EXISTS "Anyone can read scenarios" ON public.scenarios;
REVOKE ALL ON public.scenarios FROM anon, authenticated;

COMMIT;

-- Verification (run after applying):
--   SELECT policyname FROM pg_policies WHERE tablename = 'scenarios';                        -- no rows
--   SELECT has_table_privilege('authenticated', 'public.scenarios', 'SELECT');               -- false
--   SELECT has_table_privilege('anon', 'public.scenarios', 'SELECT');                        -- false
