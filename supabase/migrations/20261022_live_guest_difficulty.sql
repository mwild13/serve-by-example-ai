-- Live Guest difficulty (Rich update, Phase 7). The guest plays harder as the
-- person improves: 1 patient, 2 as written, 3 tough. The level is worked out
-- when the conversation starts (lib/live-guest/difficulty.ts) and kept here,
-- so it can't change halfway through. Conversations from before this
-- migration were played as written, so they default to 2.
--
-- The dials (speed, safety, money) need no new column: each entry in turns
-- now also carries "speed", "safety" (1-5 or null) and "money" (the brief's
-- item ids), and result carries the dial summary.
--
-- Additive: safe to run before the new code is live. The new code needs it,
-- so run it before testing the preview.
-- Rollback: supabase/rollbacks/20261022_live_guest_difficulty_rollback.sql

BEGIN;

ALTER TABLE public.live_guest_sessions
  ADD COLUMN IF NOT EXISTS difficulty smallint NOT NULL DEFAULT 2
  CHECK (difficulty BETWEEN 1 AND 3);

COMMIT;
