-- 2026-10-14: store each person's training activity per day.
--
-- Until now only venue_staff.last_active_at was kept, so the Manager Console
-- could say when someone last trained but not how often. This table holds one
-- row per person per day (Sydney time) with counts of what they did.
--
-- It is filled by triggers on the two tables every training write already
-- touches, so no route makes an extra call:
--   verify_attempts    one row per module quiz run; position counts answers,
--                      status turns 'passed' when the module is mastered.
--   training_attempts  one row per Scenario Training (descriptor) or AI Arena
--                      (roleplay) attempt. A replayed attempt id inserts
--                      nothing, so it is not counted twice.
--
-- Safe to run before or after the matching app code: the app only reads this
-- table, and treats it as empty when it is missing.

CREATE TABLE IF NOT EXISTS public.training_activity_daily (
  user_id        uuid    NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  day            date    NOT NULL,
  quiz_answers   integer NOT NULL DEFAULT 0,
  quizzes_passed integer NOT NULL DEFAULT 0,
  scenarios      integer NOT NULL DEFAULT 0,
  ai_scenarios   integer NOT NULL DEFAULT 0,
  updated_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, day)
);

-- Read by the Manager Console through the service-role client only.
ALTER TABLE public.training_activity_daily ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.training_activity_daily FROM anon, authenticated;

CREATE INDEX IF NOT EXISTS training_activity_daily_day_idx ON public.training_activity_daily (day);

-- Adds to one person's counts for the day the event happened.
CREATE OR REPLACE FUNCTION public.bump_training_activity(
  p_user_id uuid,
  p_at timestamptz,
  p_quiz_answers integer,
  p_quizzes_passed integer,
  p_scenarios integer,
  p_ai_scenarios integer
) RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  INSERT INTO public.training_activity_daily AS t
    (user_id, day, quiz_answers, quizzes_passed, scenarios, ai_scenarios)
  VALUES
    (p_user_id, (p_at AT TIME ZONE 'Australia/Sydney')::date,
     p_quiz_answers, p_quizzes_passed, p_scenarios, p_ai_scenarios)
  ON CONFLICT (user_id, day) DO UPDATE SET
    quiz_answers   = t.quiz_answers   + excluded.quiz_answers,
    quizzes_passed = t.quizzes_passed + excluded.quizzes_passed,
    scenarios      = t.scenarios      + excluded.scenarios,
    ai_scenarios   = t.ai_scenarios   + excluded.ai_scenarios,
    updated_at     = now();
$$;

CREATE OR REPLACE FUNCTION public.training_activity_from_verify()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_answers integer := greatest(NEW.position - OLD.position, 0);
  v_passed  integer := CASE WHEN NEW.status = 'passed' AND OLD.status <> 'passed' THEN 1 ELSE 0 END;
BEGIN
  IF v_answers > 0 OR v_passed > 0 THEN
    PERFORM public.bump_training_activity(NEW.user_id, now(), v_answers, v_passed, 0, 0);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.training_activity_from_attempt()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.bump_training_activity(
    NEW.user_id, NEW.created_at, 0, 0,
    CASE WHEN NEW.scenario_type = 'descriptor' THEN 1 ELSE 0 END,
    CASE WHEN NEW.scenario_type = 'roleplay' THEN 1 ELSE 0 END
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS training_activity_verify ON public.verify_attempts;
CREATE TRIGGER training_activity_verify
  AFTER UPDATE OF position, status ON public.verify_attempts
  FOR EACH ROW EXECUTE FUNCTION public.training_activity_from_verify();

DROP TRIGGER IF EXISTS training_activity_attempt ON public.training_attempts;
CREATE TRIGGER training_activity_attempt
  AFTER INSERT ON public.training_attempts
  FOR EACH ROW EXECUTE FUNCTION public.training_activity_from_attempt();

REVOKE ALL ON FUNCTION public.bump_training_activity(uuid, timestamptz, integer, integer, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.training_activity_from_verify() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.training_activity_from_attempt() FROM PUBLIC, anon, authenticated;

-- Backfill from the history both tables already hold (they start 2026-10-02).
-- Quiz answers are dated by the day the run started; a pass by the day it
-- finished. Running this file twice does not double-count: the backfill only
-- fills days that have no row yet.
INSERT INTO public.training_activity_daily (user_id, day, quiz_answers, quizzes_passed, scenarios, ai_scenarios)
SELECT user_id, day, sum(quiz_answers), sum(quizzes_passed), sum(scenarios), sum(ai_scenarios)
FROM (
  SELECT user_id, (created_at AT TIME ZONE 'Australia/Sydney')::date AS day,
         position AS quiz_answers, 0 AS quizzes_passed, 0 AS scenarios, 0 AS ai_scenarios
  FROM public.verify_attempts WHERE position > 0
  UNION ALL
  SELECT user_id, (completed_at AT TIME ZONE 'Australia/Sydney')::date, 0, 1, 0, 0
  FROM public.verify_attempts WHERE status = 'passed' AND completed_at IS NOT NULL
  UNION ALL
  SELECT user_id, (created_at AT TIME ZONE 'Australia/Sydney')::date, 0, 0,
         CASE WHEN scenario_type = 'descriptor' THEN 1 ELSE 0 END,
         CASE WHEN scenario_type = 'roleplay' THEN 1 ELSE 0 END
  FROM public.training_attempts
) history
WHERE EXISTS (SELECT 1 FROM auth.users u WHERE u.id = history.user_id)
GROUP BY user_id, day
ON CONFLICT (user_id, day) DO NOTHING;

-- Check after running:
--   SELECT day, count(*) AS people, sum(quiz_answers) AS answers, sum(scenarios + ai_scenarios) AS scenarios
--   FROM public.training_activity_daily GROUP BY day ORDER BY day DESC LIMIT 14;
