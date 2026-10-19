-- Live Guest (Rich update, Phase 6): a short typed conversation with a guest
-- who talks back. Each conversation is one row. The server keeps the whole
-- transcript here, so the browser can never rewrite what the guest said or
-- skip a turn; it only sends the staff member's next reply.
--
-- turns: [{ "staff": text, "guest": text, "mood": 1-5, "thought": text }]
--   The guest's opening line is in the guest brief (lib/live-guest/guests.ts),
--   so turns holds one entry per staff reply.
-- turn_count: entries in turns. Each reply is saved only if turn_count is
--   still what the server read, so two replies can't land on the same turn.
-- result: the debrief once the conversation ends.
-- attempt_id: the training_attempts row the result was recorded under.
--
-- Additive: safe to run before the new code is live.
-- Rollback: supabase/rollbacks/20261021_live_guest_rollback.sql

BEGIN;

CREATE TABLE IF NOT EXISTS public.live_guest_sessions (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  guest_id    text        NOT NULL,
  module_id   integer     NOT NULL,
  turns       jsonb       NOT NULL DEFAULT '[]'::jsonb,
  turn_count  integer     NOT NULL DEFAULT 0,
  status      text        NOT NULL DEFAULT 'active'
              CHECK (status IN ('active', 'resolved', 'walked_out', 'unresolved', 'breach')),
  result      jsonb,
  attempt_id  uuid,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS live_guest_sessions_user_created_idx
  ON public.live_guest_sessions (user_id, created_at DESC);

-- Read and written by the API routes through the service-role client only.
ALTER TABLE public.live_guest_sessions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.live_guest_sessions FROM anon, authenticated;

COMMIT;
