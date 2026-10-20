-- Venue content (Rich update, Phase 11): a manager adds a spec, a special, a
-- new product or an 86'd item. The AI drafts 3 to 5 questions about it, the
-- manager approves each one in the Manager Console, and approved questions
-- go into that venue's staff's mixed drills.
--
-- venue_content_items: one row per thing the manager added.
--   kind: spec | special | product | eighty_six | note
--   details: what the manager wrote (the spec, the special, what's off).
--   ends_on: optional last day (a weekend special, an 86'd keg). Questions
--     leave drills after it.
--   archived_at: set when the manager takes the item down. Kept, not deleted,
--     so drills already under way can still be graded.
--
-- venue_content_questions: the drafted questions.
--   question: one question in the module quiz's shape (lib/question-bank.ts):
--     { format, prompt, options?, steps?, answer?, unit?, tolerance?,
--       explanation, difficulty }. Graded by the same code as module quizzes.
--   status: draft | approved | rejected. Only approved questions reach staff.
--
-- Written only by /api/management/venue-content (behind requireManager) and
-- read by the drill routes, all through the service-role client.
--
-- Additive: safe to run before the new code is live.
-- Rollback: supabase/rollbacks/20261024_venue_content_rollback.sql

BEGIN;

CREATE TABLE IF NOT EXISTS public.venue_content_items (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id    uuid        NOT NULL REFERENCES public.venues (id) ON DELETE CASCADE,
  created_by  uuid        REFERENCES auth.users (id) ON DELETE SET NULL,
  kind        text        NOT NULL CHECK (kind IN ('spec', 'special', 'product', 'eighty_six', 'note')),
  title       text        NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  details     text        NOT NULL CHECK (char_length(details) BETWEEN 1 AND 2000),
  ends_on     date,
  archived_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS venue_content_items_venue_idx
  ON public.venue_content_items (venue_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.venue_content_questions (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id     uuid        NOT NULL REFERENCES public.venue_content_items (id) ON DELETE CASCADE,
  venue_id    uuid        NOT NULL REFERENCES public.venues (id) ON DELETE CASCADE,
  question    jsonb       NOT NULL,
  status      text        NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'rejected')),
  reviewed_by uuid        REFERENCES auth.users (id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS venue_content_questions_item_idx
  ON public.venue_content_questions (item_id);
CREATE INDEX IF NOT EXISTS venue_content_questions_venue_live_idx
  ON public.venue_content_questions (venue_id, reviewed_at DESC) WHERE status = 'approved';

-- No client access: the API routes read and write through the service role.
ALTER TABLE public.venue_content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_content_questions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.venue_content_items FROM anon, authenticated;
REVOKE ALL ON public.venue_content_questions FROM anon, authenticated;

COMMIT;

-- Check after running:
--   SELECT grantee, privilege_type FROM information_schema.role_table_grants
--   WHERE table_name IN ('venue_content_items', 'venue_content_questions') AND grantee IN ('anon', 'authenticated');
--     -- no rows
--   SELECT relname, relrowsecurity FROM pg_class
--   WHERE relname IN ('venue_content_items', 'venue_content_questions');
--     -- both true
