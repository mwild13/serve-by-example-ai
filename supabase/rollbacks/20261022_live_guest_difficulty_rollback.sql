-- Rolls back supabase/migrations/20261022_live_guest_difficulty.sql.
-- Run only after the Phase 7 code is rolled back, since it reads the column.

BEGIN;

ALTER TABLE public.live_guest_sessions DROP COLUMN IF EXISTS difficulty;

COMMIT;
