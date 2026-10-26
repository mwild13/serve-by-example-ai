-- Applicant Testing (docs/APPLICANT_TESTING.md): a manager emails a job
-- applicant a link to a test of about 30 minutes, and gets a report back.
-- Applicants have no account. The link carries a random token, and only its
-- SHA-256 hash is stored here (lib/applicant/token.ts).
--
-- applicant_tests: one row per invite.
--   run_state: { "queue": ["<item key>", ...] } from drawTest()
--     (lib/applicant/blueprint.ts). Item keys never change meaning.
--   position: items answered. Each answer is saved only if position is still
--     what the server read, so two answers can't land on one item.
--   current_served_at: when the item at `position` was sent. Copied onto the
--     answer, so the time to answer is the server's, not the browser's.
--   visits: times the link was opened after the first, so a gap shows.
--   ai_calls: AI calls this test has made. The routes stop at a fixed cap.
--   report: scores, signals and the written summary once submitted.
-- applicant_answers: one row per answered item, with the answer, its score
--   and the signals from the browser (time on and away from the page,
--   pastes, typing time), already checked against the server's own times.
-- applicant_test_usage: tests sent per paying account per month (Sydney),
--   for the plan allowance. Counted when an invite is sent and never given
--   back, so deleting a test doesn't free a test.
--
-- Everything is deleted 12 months after the invite, with the venue, or when
-- the venue deletes one applicant (a DELETE on applicant_tests cascades).
--
-- Additive: safe to run before the new code is live.
-- Rollback: supabase/rollbacks/20261104_applicant_testing_rollback.sql

BEGIN;

CREATE TABLE IF NOT EXISTS public.applicant_tests (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id          uuid        NOT NULL REFERENCES public.venues (id) ON DELETE CASCADE,
  account_id        uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  created_by        uuid        REFERENCES auth.users (id) ON DELETE SET NULL,
  applicant_name    text        NOT NULL CHECK (char_length(applicant_name) BETWEEN 1 AND 120),
  applicant_email   text        NOT NULL CHECK (char_length(applicant_email) BETWEEN 3 AND 254 AND applicant_email = lower(applicant_email)),
  track             text        NOT NULL CHECK (track IN ('bar', 'floor', 'kitchen', 'management')),
  intro_message     text        CHECK (char_length(intro_message) <= 2000),
  token_hash        text        NOT NULL UNIQUE CHECK (char_length(token_hash) BETWEEN 40 AND 64),
  status            text        NOT NULL DEFAULT 'invited'
                    CHECK (status IN ('invited', 'started', 'submitted', 'expired', 'withdrawn')),
  run_state         jsonb,
  position          integer     NOT NULL DEFAULT 0 CHECK (position >= 0),
  current_served_at timestamptz,
  visits            integer     NOT NULL DEFAULT 0,
  ai_calls          integer     NOT NULL DEFAULT 0,
  consent_at        timestamptz,
  sent_at           timestamptz,
  started_at        timestamptz,
  last_seen_at      timestamptz,
  submitted_at      timestamptz,
  expires_at        timestamptz NOT NULL,
  report            jsonb,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  -- A test only starts once it has its items and the applicant's consent.
  CHECK (status NOT IN ('started', 'submitted') OR (run_state IS NOT NULL AND consent_at IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS applicant_tests_venue_created_idx ON public.applicant_tests (venue_id, created_at DESC);
CREATE INDEX IF NOT EXISTS applicant_tests_account_idx ON public.applicant_tests (account_id);
CREATE INDEX IF NOT EXISTS applicant_tests_created_by_idx ON public.applicant_tests (created_by);
CREATE INDEX IF NOT EXISTS applicant_tests_created_idx ON public.applicant_tests (created_at);

ALTER TABLE public.applicant_tests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.applicant_tests FROM anon, authenticated;

CREATE TABLE IF NOT EXISTS public.applicant_answers (
  id            bigint      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  test_id       uuid        NOT NULL REFERENCES public.applicant_tests (id) ON DELETE CASCADE,
  position      integer     NOT NULL CHECK (position >= 0),
  item_key      text        NOT NULL CHECK (char_length(item_key) <= 120),
  section       text        NOT NULL CHECK (section IN ('core', 'role', 'order', 'written')),
  answer        jsonb       NOT NULL,
  correct       boolean,
  -- 0 to 100. Null while an AI score is still to come.
  score         smallint    CHECK (score BETWEEN 0 AND 100),
  evaluation    jsonb,
  served_at     timestamptz NOT NULL,
  answered_at   timestamptz NOT NULL DEFAULT now(),
  active_ms     integer     NOT NULL DEFAULT 0 CHECK (active_ms >= 0),
  away_ms       integer     NOT NULL DEFAULT 0 CHECK (away_ms >= 0),
  away_count    integer     NOT NULL DEFAULT 0 CHECK (away_count >= 0),
  paste_count   integer     NOT NULL DEFAULT 0 CHECK (paste_count >= 0),
  pasted_chars  integer     NOT NULL DEFAULT 0 CHECK (pasted_chars >= 0),
  typing_ms     integer     NOT NULL DEFAULT 0 CHECK (typing_ms >= 0),
  answer_chars  integer     NOT NULL DEFAULT 0 CHECK (answer_chars >= 0),
  UNIQUE (test_id, item_key),
  UNIQUE (test_id, position)
);

ALTER TABLE public.applicant_answers ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.applicant_answers FROM anon, authenticated;

CREATE TABLE IF NOT EXISTS public.applicant_test_usage (
  account_id  uuid    NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  -- The first day of the month, Sydney time.
  month       date    NOT NULL CHECK (extract(day FROM month) = 1),
  tests_sent  integer NOT NULL DEFAULT 0 CHECK (tests_sent >= 0),
  PRIMARY KEY (account_id, month)
);

ALTER TABLE public.applicant_test_usage ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.applicant_test_usage FROM anon, authenticated;

-- Takes one test from the account's allowance for the month. False when the
-- allowance is used up. One statement, so two invites sent at once can't
-- both take the last test.
CREATE OR REPLACE FUNCTION public.claim_applicant_test(p_account uuid, p_month date, p_limit integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  claimed integer;
BEGIN
  IF p_limit IS NULL OR p_limit < 1 THEN
    RETURN false;
  END IF;
  INSERT INTO public.applicant_test_usage AS u (account_id, month, tests_sent)
  VALUES (p_account, p_month, 1)
  ON CONFLICT (account_id, month) DO UPDATE
    SET tests_sent = u.tests_sent + 1
    WHERE u.tests_sent < p_limit
  RETURNING tests_sent INTO claimed;
  RETURN claimed IS NOT NULL AND claimed <= p_limit;
END;
$$;
REVOKE ALL ON FUNCTION public.claim_applicant_test(uuid, date, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_applicant_test(uuid, date, integer) TO service_role;

COMMIT;

-- Tests go 12 months after the invite, and usage counts after 13, every night
-- at 3:40am Sydney (16:40 UTC, an hour out in winter).
select cron.unschedule('trim-applicant-tests')
 where exists (select 1 from cron.job where jobname = 'trim-applicant-tests');

select cron.schedule(
  'trim-applicant-tests',
  '40 16 * * *',
  $job$
    delete from public.applicant_tests where created_at < now() - interval '12 months';
    delete from public.applicant_test_usage where month < (now() - interval '13 months')::date;
  $job$
);

-- Check after running:
--   SELECT table_name, grantee FROM information_schema.role_table_grants
--   WHERE table_name LIKE 'applicant_%' AND grantee IN ('anon', 'authenticated');
--     -- no rows
--   SELECT grantee FROM information_schema.routine_privileges
--   WHERE routine_name = 'claim_applicant_test';
--     -- service_role (and postgres), no anon or authenticated
--   select jobname, schedule, active from cron.job where jobname = 'trim-applicant-tests';
--     -- 40 16 * * *, true
