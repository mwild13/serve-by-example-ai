-- The four funnel numbers. Definitions and how to read them: docs/FUNNEL_METRICS.md.
--
-- Read-only. Run one query at a time in the Supabase SQL editor.
--
-- "Account" below means an account that has signed in at least once. Seeded
-- demo staff and invited people who never arrived are left out of everything.
-- Weeks start on Monday, Sydney time.


-- 1. Sign-ups per week, by where they came from.
--    Divide by that week's visits in Cloudflare Web Analytics for visit to sign-up.
select
  date_trunc('week', p.created_at at time zone 'Australia/Sydney')::date as week_starting,
  coalesce(p.acquisition->>'utm_source', '(none)')   as utm_source,
  coalesce(p.acquisition->>'utm_campaign', '(none)') as utm_campaign,
  count(*) as sign_ups
from public.profiles p
join auth.users u on u.id = p.id
where u.last_sign_in_at is not null
group by 1, 2, 3
order by 1 desc, 4 desc;


-- 2. Sign-up to first scenario: accounts that completed a scenario within
--    7 days of signing up. Weeks younger than 7 days are still filling.
select
  date_trunc('week', p.created_at at time zone 'Australia/Sydney')::date as week_starting,
  count(*) as sign_ups,
  count(first_attempt.at) as trained_within_7_days,
  round(100.0 * count(first_attempt.at) / count(*), 1) as percent
from public.profiles p
join auth.users u on u.id = p.id
left join lateral (
  select min(t.created_at) as at
  from public.training_attempts t
  where t.user_id = p.id
    and t.created_at < p.created_at + interval '7 days'
) first_attempt on true
where u.last_sign_in_at is not null
group by 1
order by 1 desc;


-- 3. Trial to paid, by the week the trial started. A trial runs 14 days, so
--    the last two weeks are still open.
select
  date_trunc('week', o.trial_started_at at time zone 'Australia/Sydney')::date as week_starting,
  count(*) as trials_started,
  count(*) filter (where o.trial_converted) as converted,
  count(*) filter (where not coalesce(o.trial_converted, false) and o.trial_ends_at > now()) as still_in_trial,
  round(100.0 * count(*) filter (where o.trial_converted) / count(*), 1) as percent_converted
from public.organizations o
where o.trial_started_at is not null
group by 1
order by 1 desc;


-- 4. Paying venues, by the campaign that first brought their owner.
--    Cost per paying venue = that campaign's spend / paying_venues.
select
  coalesce(p.acquisition->>'utm_source', '(none)')   as utm_source,
  coalesce(p.acquisition->>'utm_campaign', '(none)') as utm_campaign,
  count(*) as paying_venues,
  count(*) filter (where o.trial_converted) as came_through_a_trial
from public.organizations o
join public.profiles p on p.id = o.owner_user_id
where o.subscription_tier in ('boutique', 'commercial', 'enterprise')
  and o.stripe_customer_id is not null
  and p.subscription_status in ('active', 'trialing', 'past_due')
group by 1, 2
order by 3 desc;
