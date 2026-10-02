-- ROLLBACK for supabase/migrations/20261003_lock_scenarios_answer_key.sql
--
-- Restores the captured pre-migration state exactly. This re-exposes the
-- verify quiz answer key to every signed-in user; emergency use only.

BEGIN;

GRANT SELECT ON public.scenarios TO anon, authenticated;
CREATE POLICY "Anyone can read scenarios" ON public.scenarios
  FOR SELECT TO authenticated USING (true);

COMMIT;
