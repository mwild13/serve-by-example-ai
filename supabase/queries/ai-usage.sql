-- How hard accounts push against the daily AI limit (lib/ai-usage.ts):
-- 30 requests a day on the free tier, 300 on a paid one, shared across
-- scenario grading, Arena and both coaches.
--
-- Read-only. Run one query at a time in the Supabase SQL editor. A request
-- over the limit is still counted, so request_count can exceed the limit.


-- 1. Each day: accounts that used AI, the busiest account, and how many
--    reached their limit.
select
  d.usage_day,
  count(*) as accounts,
  sum(d.request_count) as requests,
  max(d.request_count) as busiest_account,
  count(*) filter (where p.tier = 'free' and d.request_count >= 30)  as free_at_limit,
  count(*) filter (where p.tier <> 'free' and d.request_count >= 300) as paid_at_limit
from public.ai_usage_daily d
join public.profiles p on p.id = d.user_id
group by 1
order by 1 desc
limit 60;


-- 2. The spread over the last 30 days, by tier. If the 90th percentile sits
--    near the limit, the limit is too low for ordinary use.
select
  case when p.tier = 'free' then 'free' else 'paid' end as plan,
  count(*) as account_days,
  percentile_cont(0.5) within group (order by d.request_count) as median,
  percentile_cont(0.9) within group (order by d.request_count) as p90,
  max(d.request_count) as highest
from public.ai_usage_daily d
join public.profiles p on p.id = d.user_id
where d.usage_day > current_date - 30
group by 1;
