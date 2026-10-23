-- scripts/mockup-seed.sql, run on 2026-10-24 against the live project. Recent
-- activity for the demo venues' staff and a training history for the QA
-- account, so the console Overview and the staff progress screens can be
-- captured for public/shots/ (docs/MARKETING_IMAGERY_PLAN.md section 4).
-- The demo-venue part can be run again before a retake; the QA part only adds
-- rows that are missing.

-- ── Demo venues: last active spread by progress rank ─────────────────────────
with ranked as (
  select s.id, s.staff_user_id,
         row_number() over (partition by s.venue_id order by s.progress desc, s.id) as rk,
         ('x' || substr(md5(s.id::text), 1, 8))::bit(32)::int as h
  from venue_staff s
  where s.venue_id in ('1301bbe1-4ca6-4568-a7c1-1e4aa3927342','f0727021-c394-4775-b687-44b1f03843c1','20263445-2496-415a-94ea-8410766119a9')
), days as (
  select id, staff_user_id, h,
    case
      when rk <= 5  then 0                          -- today
      when rk <= 16 then 1 + abs(h) % 6             -- earlier this week
      when rk <= 21 then 7 + abs(h) % 7             -- 7 to 13 days
      when rk <= 23 then 15 + abs(h) % 9            -- needs attention
      else 34 + abs(h) % 12                          -- lapsed
    end as ago
  from ranked
)
update venue_staff v
set last_active_at = case when d.ago = 0 then now() - make_interval(mins => 15 + abs(d.h) % 100)
                          else now() - make_interval(days => d.ago, mins => abs(d.h) % 600) end
from days d where v.id = d.id;

-- ── Demo venues: daily training for the last 14 Sydney days ──────────────────
insert into training_activity_daily (user_id, day, quiz_answers, quizzes_passed, scenarios, ai_scenarios, updated_at)
select s.staff_user_id, g.day,
  6 + abs(('x' || substr(md5(s.id::text || g.day), 1, 8))::bit(32)::int) % 22,
  case when abs(('x' || substr(md5(s.id::text || g.day), 9, 8))::bit(32)::int) % 4 = 0 then 1 else 0 end,
  abs(('x' || substr(md5(s.id::text || g.day), 17, 8))::bit(32)::int) % 4,
  case when abs(('x' || substr(md5(s.id::text || g.day), 25, 8))::bit(32)::int) % 5 = 0 then 1 else 0 end,
  now()
from venue_staff s
cross join lateral (
  select (s.last_active_at at time zone 'Australia/Sydney')::date - n as day, n
  from generate_series(0, 13) n
) g
where s.venue_id in ('1301bbe1-4ca6-4568-a7c1-1e4aa3927342','f0727021-c394-4775-b687-44b1f03843c1','20263445-2496-415a-94ea-8410766119a9')
  and s.staff_user_id is not null
  and g.day > (now() at time zone 'Australia/Sydney')::date - 14
  and (g.n = 0 or abs(('x' || substr(md5(s.id::text || g.day || 'on'), 1, 8))::bit(32)::int) % 100 < 45)
on conflict (user_id, day) do update set
  quiz_answers = excluded.quiz_answers, quizzes_passed = excluded.quizzes_passed,
  scenarios = excluded.scenarios, ai_scenarios = excluded.ai_scenarios, updated_at = now();

-- ── QA account ───────────────────────────────────────────────────────────────
-- Mastered modules (verify quiz passed), oldest first.
insert into scenario_mastery (user_id, module, module_id, scenario_type, scenario_index, mastery_level, is_mastered,
  consecutive_correct, total_attempts, total_score_points, best_score, last_score, last_attempt_at, next_review_at)
select 'dcc77ffa-604a-4107-8fec-8113582e9358', 'module_' || m.id, m.id, 'quiz', 0, 3, true,
  5, m.tries, 25 * m.tries, 25, 25, now() - make_interval(days => m.ago, hours => 2), now() + interval '5 days'
from (values (6,24,1),(1,23,2),(24,22,1),(21,20,1),(8,18,2),(15,16,1),(3,13,2),(12,11,1),
             (16,9,2),(26,8,1),(11,6,1),(5,4,1),(40,2,2),(23,1,1)) as m(id, ago, tries)
on conflict (user_id, module, scenario_type, scenario_index) do nothing;

-- Modules on the go (Scenario Training, not mastered yet).
insert into scenario_mastery (user_id, module, module_id, scenario_type, scenario_index, mastery_level, is_mastered,
  consecutive_correct, total_attempts, total_score_points, best_score, last_score, last_attempt_at, next_review_at)
select 'dcc77ffa-604a-4107-8fec-8113582e9358', 'module_' || m.id, m.id, 'descriptor', i, m.lvl, false,
  1, 2, 30, 18, 15, now() - make_interval(days => m.ago, hours => 1 + i), now() + interval '2 days'
from (values (2,0,2),(10,1,1),(17,3,2),(25,5,1)) as m(id, ago, lvl)
cross join generate_series(0, 1) i
on conflict (user_id, module, scenario_type, scenario_index) do nothing;

-- Live Guest passes.
insert into scenario_mastery (user_id, module, module_id, scenario_type, scenario_index, mastery_level, is_mastered,
  total_attempts, total_score_points, best_score, last_score, last_attempt_at)
select 'dcc77ffa-604a-4107-8fec-8113582e9358', 'module_' || m.id, m.id, 'roleplay', 40, 3, true,
  m.tries, 21 * m.tries, m.best, m.best, now() - make_interval(days => m.ago, hours => 3)
from (values (8,17,2,22),(11,10,1,21),(12,7,2,23),(40,3,1,20),(17,1,2,19)) as m(id, ago, tries, best)
on conflict (user_id, module, scenario_type, scenario_index) do nothing;

insert into quiz_modules_started (user_id, module_id, started_at)
select 'dcc77ffa-604a-4107-8fec-8113582e9358', module_id, min(last_attempt_at) - interval '1 hour'
from scenario_mastery where user_id = 'dcc77ffa-604a-4107-8fec-8113582e9358' and module_id is not null
group by module_id
on conflict do nothing;

-- Challenges: 7 of 10.
insert into user_challenges (user_id, challenge_index, completed_at)
select 'dcc77ffa-604a-4107-8fec-8113582e9358', i, now() - make_interval(days => 20 - i * 2)
from generate_series(0, 6) i
on conflict (user_id, challenge_index) do nothing;

-- Shift streak: works Wednesday to Saturday, a pre-shift drill every shift for four weeks.
insert into shift_schedules (user_id, shift_days, reminder_time)
values ('dcc77ffa-604a-4107-8fec-8113582e9358', '{3,4,5,6}', null)
on conflict (user_id) do update set shift_days = excluded.shift_days;

insert into preshift_days (user_id, day)
select 'dcc77ffa-604a-4107-8fec-8113582e9358', d::date
from generate_series(date '2026-09-30', (now() at time zone 'Australia/Sydney')::date, interval '1 day') d
where extract(dow from d) in (3, 4, 5, 6)
on conflict do nothing;

-- Daily training on each shift day.
insert into training_activity_daily (user_id, day, quiz_answers, quizzes_passed, scenarios, ai_scenarios, updated_at)
select 'dcc77ffa-604a-4107-8fec-8113582e9358', day, 8 + abs(('x' || substr(md5(day::text), 1, 8))::bit(32)::int) % 14,
  case when extract(dow from day) = 4 then 1 else 0 end, 1, case when extract(dow from day) = 6 then 1 else 0 end, now()
from preshift_days where user_id = 'dcc77ffa-604a-4107-8fec-8113582e9358'
on conflict (user_id, day) do nothing;

update profiles set best_correct_streak = greatest(best_correct_streak, 14), current_correct_streak = 6
where id = 'dcc77ffa-604a-4107-8fec-8113582e9358';

-- Saturday Rush: three shifts, best 86. Only the score is read back.
insert into rush_runs (user_id, seed, moves, score, result, created_at)
select 'dcc77ffa-604a-4107-8fec-8113582e9358', r.seed, '[]'::jsonb, r.score, jsonb_build_object('score', r.score), now() - make_interval(days => r.ago)
from (values (918273645::bigint, 71, 15), (192837465::bigint, 79, 8), (564738291::bigint, 86, 1)) as r(seed, score, ago)
on conflict (user_id, seed) do nothing;
