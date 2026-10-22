-- Rollback for 20261102_coach_sessions_delete_cascade.sql: puts back the
-- rule-less foreign key, which blocks deleting an account that has coach chats.

BEGIN;

ALTER TABLE public.manager_coach_sessions
  DROP CONSTRAINT IF EXISTS manager_coach_sessions_manager_user_id_fkey,
  ADD CONSTRAINT manager_coach_sessions_manager_user_id_fkey
    FOREIGN KEY (manager_user_id) REFERENCES auth.users(id);

COMMIT;
