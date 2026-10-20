-- Team features (Rich update, Phase 16): a venue goal for the week, a guest
-- of the week, and the manager's briefing card.
--
-- quiz_answer_log: one row per module quiz or drill answer, right or wrong,
--   written by /api/training/verify/answer and /api/training/drill/answer.
--   The venue goal counts the team's correct answers from it, and the
--   briefing card finds the questions the team missed most. Managers only
--   ever see team totals, and a question only shows once two or more people
--   have missed it, so no one is singled out. Rows go after 180 days.
-- venue_weeks: one row per venue per week (week_start is the Monday, Sydney
--   time): the manager's goal (what is counted, and the target) and the
--   guest of the week (a Live Guest brief id from lib/live-guest/guests.ts).
--
-- Additive: safe to run before the new code is live. Until it's run, answers
-- aren't logged and the team screens say there's nothing set this week.
-- Rollback: supabase/rollbacks/20261029_team_week_rollback.sql

BEGIN;

CREATE TABLE IF NOT EXISTS public.quiz_answer_log (
  id           bigint      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id      uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  module_id    integer     NOT NULL,
  question_id  text        NOT NULL CHECK (char_length(question_id) <= 100),
  correct      boolean     NOT NULL,
  source       text        NOT NULL CHECK (source IN ('quiz', 'drill')),
  answered_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS quiz_answer_log_user_idx ON public.quiz_answer_log (user_id, answered_at DESC);
CREATE INDEX IF NOT EXISTS quiz_answer_log_at_idx ON public.quiz_answer_log (answered_at);

ALTER TABLE public.quiz_answer_log ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.quiz_answer_log FROM anon, authenticated;

CREATE TABLE IF NOT EXISTS public.venue_weeks (
  venue_id     uuid        NOT NULL REFERENCES public.venues (id) ON DELETE CASCADE,
  week_start   date        NOT NULL CHECK (extract(isodow FROM week_start) = 1),
  goal_kind    text        CHECK (goal_kind IN ('correct_answers', 'training_days', 'live_guest_passes', 'rush_shifts')),
  goal_target  integer     CHECK (goal_target BETWEEN 1 AND 100000),
  guest_id     text        CHECK (char_length(guest_id) <= 60),
  updated_by   uuid        REFERENCES auth.users (id) ON DELETE SET NULL,
  updated_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (venue_id, week_start),
  CHECK ((goal_kind IS NULL) = (goal_target IS NULL))
);

ALTER TABLE public.venue_weeks ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.venue_weeks FROM anon, authenticated;

COMMIT;

-- Old answers go after 180 days, every night at 3:30am Sydney (16:30 UTC,
-- an hour out in winter).
select cron.unschedule('trim-quiz-answer-log')
 where exists (select 1 from cron.job where jobname = 'trim-quiz-answer-log');

select cron.schedule(
  'trim-quiz-answer-log',
  '30 16 * * *',
  $job$ delete from public.quiz_answer_log where answered_at < now() - interval '180 days'; $job$
);

-- Check after running:
--   SELECT grantee FROM information_schema.role_table_grants
--   WHERE table_name IN ('quiz_answer_log', 'venue_weeks') AND grantee IN ('anon', 'authenticated');
--     -- no rows
--   select jobname, schedule, active from cron.job where jobname = 'trim-quiz-answer-log';
--     -- 30 16 * * *, true
