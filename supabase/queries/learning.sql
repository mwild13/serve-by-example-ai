-- The learning numbers for the Rich update. Definitions and how to read them:
-- docs/Rich Update/LEARNING_METRICS.md.
--
-- Read-only. Run one query at a time in the Supabase SQL editor.
--
-- "Account" means an account that has signed in at least once, as in
-- funnel.sql. Weeks start on Monday, Sydney time. training_activity_daily
-- already stores Sydney dates.


-- 1. Quiz runs finished, by the week the run started.
--    Finished = passed or ran out of questions. Abandoned = still active after
--    its 20 minutes ran out. Runs still inside their 20 minutes are left out
--    of the percentage.
select
  date_trunc('week', v.created_at at time zone 'Australia/Sydney')::date as week_starting,
  count(*) as runs,
  count(*) filter (where v.status = 'passed') as passed,
  count(*) filter (where v.status = 'exhausted') as ran_out,
  count(*) filter (where v.status = 'active' and v.expires_at <= now()) as abandoned,
  round(
    100.0 * count(*) filter (where v.status in ('passed', 'exhausted'))
    / nullif(count(*) filter (where v.status <> 'active' or v.expires_at <= now()), 0),
    1
  ) as percent_finished
from public.verify_attempts v
join auth.users u on u.id = v.user_id
where u.last_sign_in_at is not null
group by 1
order by 1 desc;


-- 2. Days with training per active staff member, per week.
--    Active = trained on at least one day that week.
with weekly as (
  select
    d.user_id,
    date_trunc('week', d.day)::date as week_starting,
    count(*) as days_trained
  from public.training_activity_daily d
  join auth.users u on u.id = d.user_id
  where u.last_sign_in_at is not null
  group by 1, 2
)
select
  week_starting,
  count(*) as active_people,
  round(avg(days_trained), 2) as average_days_trained
from weekly
group by 1
order by 1 desc;


-- 3. Still training in week 4, by the week each person first trained.
--    Week 4 = days 22 to 28 after the first day of training. Groups whose
--    week 4 hasn't finished yet show as still_filling.
with first_day as (
  select d.user_id, min(d.day) as first_day
  from public.training_activity_daily d
  join auth.users u on u.id = d.user_id
  where u.last_sign_in_at is not null
  group by 1
)
select
  date_trunc('week', f.first_day)::date as first_trained_week,
  count(*) as people,
  count(*) filter (where exists (
    select 1 from public.training_activity_daily d
    where d.user_id = f.user_id
      and d.day between f.first_day + 21 and f.first_day + 27
  )) as trained_in_week_4,
  round(100.0 * count(*) filter (where exists (
    select 1 from public.training_activity_daily d
    where d.user_id = f.user_id
      and d.day between f.first_day + 21 and f.first_day + 27
  )) / count(*), 1) as percent,
  bool_or(f.first_day + 27 >= (now() at time zone 'Australia/Sydney')::date) as still_filling
from first_day f
group by 1
order by 1 desc;


-- 4. What people train on, per week. A baseline for the mix: the upgrade
--    should move time from the old scenario screens to the new levels.
select
  date_trunc('week', d.day)::date as week_starting,
  sum(d.quiz_answers)   as quiz_answers,
  sum(d.quizzes_passed) as quizzes_passed,
  sum(d.scenarios)      as scenario_training,
  sum(d.ai_scenarios)   as ai_arena
from public.training_activity_daily d
join auth.users u on u.id = d.user_id
where u.last_sign_in_at is not null
group by 1
order by 1 desc;


-- 5. Venue trials where someone tried Live Guest in the first session, by
--    the week the trial started. "First session" is the trial's first 24
--    hours, and "someone" is anyone whose profile belongs to the venue
--    (owner or staff). Live Guest started in Phase 6 (live_guest_sessions).
select
  date_trunc('week', o.trial_started_at at time zone 'Australia/Sydney')::date as week_starting,
  count(*) as trials_started,
  count(*) filter (where exists (
    select 1
    from public.live_guest_sessions s
    join public.profiles p on p.id = s.user_id
    where p.org_id = o.id
      and s.created_at < o.trial_started_at + interval '24 hours'
  )) as tried_live_guest,
  round(100.0 * count(*) filter (where exists (
    select 1
    from public.live_guest_sessions s
    join public.profiles p on p.id = s.user_id
    where p.org_id = o.id
      and s.created_at < o.trial_started_at + interval '24 hours'
  )) / count(*), 1) as percent
from public.organizations o
where o.trial_started_at is not null
  and o.trial_started_at >= date '2026-10-19'
group by 1
order by 1 desc;


-- 6. Live Guest conversations per week: how they ended, and passes.
select
  date_trunc('week', s.created_at at time zone 'Australia/Sydney')::date as week_starting,
  count(*) as started,
  count(*) filter (where s.status <> 'active') as finished,
  count(*) filter (where s.status = 'resolved') as resolved,
  count(*) filter (where s.status = 'walked_out') as walked_out,
  count(*) filter (where s.status = 'breach') as breach,
  count(*) filter (where (s.result ->> 'passed')::boolean) as passed
from public.live_guest_sessions s
group by 1
order by 1 desc;


-- Still to add, in the phase that builds it:
--   7. Venue content items added per venue per month (Phase 11).
