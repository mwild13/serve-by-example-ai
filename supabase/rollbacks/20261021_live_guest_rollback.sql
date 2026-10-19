-- Rolls back supabase/migrations/20261021_live_guest.sql.
-- Deletes every Live Guest transcript. Results already recorded through
-- record_attempt() stay in training_attempts and scenario_mastery.

BEGIN;

DROP TABLE IF EXISTS public.live_guest_sessions;

COMMIT;
