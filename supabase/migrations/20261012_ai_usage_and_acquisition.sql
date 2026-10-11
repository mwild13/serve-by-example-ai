-- Pre-marketing blockers: a durable daily cap on AI requests, and a place to
-- keep where a new account came from.
--
-- 1. ai_usage_daily + bump_ai_usage(): one row per account per day, bumped
--    atomically by lib/ai-usage.ts before every signed-in OpenAI call. The
--    in-memory limiter (lib/rate-limit.ts) is per worker instance and does
--    not bound a day's spend; this does.
-- 2. profiles.acquisition: the first-touch campaign parameters (utm_*, gclid,
--    fbclid, landing path) copied from the sbe_attr cookie at first sign-in
--    (app/api/session/stamp/route.ts).
--
-- Additive only. The code tolerates this not being run yet: the cap fails
-- open and the acquisition write is skipped. Safe to run more than once.

create table if not exists public.ai_usage_daily (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_day date not null,
  request_count integer not null default 0,
  primary key (user_id, usage_day)
);

-- RLS on with no policy, on purpose: only the service role reads or writes it.
alter table public.ai_usage_daily enable row level security;

-- Returns true while the account is within p_limit for today (Sydney time).
-- Requests over the limit are still counted, so the row shows how hard an
-- account pushed against it.
create or replace function public.bump_ai_usage(p_user_id uuid, p_limit integer)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_count integer;
begin
  insert into public.ai_usage_daily (user_id, usage_day, request_count)
  values (p_user_id, (now() at time zone 'Australia/Sydney')::date, 1)
  on conflict (user_id, usage_day)
  do update set request_count = public.ai_usage_daily.request_count + 1
  returning request_count into v_count;

  return v_count <= p_limit;
end;
$$;

revoke execute on function public.bump_ai_usage(uuid, integer) from public, anon, authenticated;
grant execute on function public.bump_ai_usage(uuid, integer) to service_role;

alter table public.profiles add column if not exists acquisition jsonb;
