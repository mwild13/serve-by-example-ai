-- A manager's AI coach chats go with their account.
--
-- manager_coach_sessions.manager_user_id referenced auth.users with no
-- ON DELETE rule, so deleting the account of anyone who had saved a coach
-- chat failed (app/api/profile/delete/route.ts answered 500). Venue owners
-- are refused before that point, but a duty manager can save chats with no
-- venue and has no such refusal. The chats are that person's own history,
-- so they are deleted with them, as every other per-user table is.
--
-- Safe to run before or after the code: nothing reads the rule.
-- Rollback: supabase/rollbacks/20261102_coach_sessions_delete_cascade_rollback.sql

BEGIN;

ALTER TABLE public.manager_coach_sessions
  DROP CONSTRAINT IF EXISTS manager_coach_sessions_manager_user_id_fkey,
  ADD CONSTRAINT manager_coach_sessions_manager_user_id_fkey
    FOREIGN KEY (manager_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

COMMIT;
