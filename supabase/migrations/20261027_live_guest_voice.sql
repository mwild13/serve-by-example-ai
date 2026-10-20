-- Live Guest voice (Rich update, Phase 14).
--
-- voice_usage_daily + bump_voice_usage(): one row per account per Sydney
--   day, counting voice clips (each recording written out, and each guest
--   line read aloud). lib/ai-usage.ts bumps it before every voice call to
--   OpenAI; a recording is at most 30 seconds, so the clip cap is a cap on
--   minutes. No audio is ever stored, only this count.
--
-- Additive only, and safe to run more than once. The code tolerates this not
-- being run yet: the cap fails open, like the AI daily cap.
-- Rollback: supabase/rollbacks/20261027_live_guest_voice_rollback.sql

create table if not exists public.voice_usage_daily (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_day date not null,
  clip_count integer not null default 0,
  primary key (user_id, usage_day)
);

-- RLS on with no policy, on purpose: only the service role reads or writes it.
alter table public.voice_usage_daily enable row level security;
revoke all on public.voice_usage_daily from anon, authenticated;

-- True while the account is within p_limit clips today (Sydney time).
create or replace function public.bump_voice_usage(p_user_id uuid, p_limit integer)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_count integer;
begin
  insert into public.voice_usage_daily (user_id, usage_day, clip_count)
  values (p_user_id, (now() at time zone 'Australia/Sydney')::date, 1)
  on conflict (user_id, usage_day)
  do update set clip_count = public.voice_usage_daily.clip_count + 1
  returning clip_count into v_count;

  return v_count <= p_limit;
end;
$$;

revoke execute on function public.bump_voice_usage(uuid, integer) from public, anon, authenticated;
grant execute on function public.bump_voice_usage(uuid, integer) to service_role;

-- Check after running:
--   select grantee from information_schema.role_table_grants
--   where table_name = 'voice_usage_daily' and grantee in ('anon', 'authenticated');
--     -- no rows
