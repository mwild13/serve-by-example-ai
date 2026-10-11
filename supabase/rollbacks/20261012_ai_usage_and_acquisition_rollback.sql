-- Rollback for 20261012_ai_usage_and_acquisition.sql.
-- The AI daily cap fails open once the function is gone, so the app keeps
-- working with only the in-memory limiter. Usage counts and stored
-- acquisition data are lost.

drop function if exists public.bump_ai_usage(uuid, integer);
drop table if exists public.ai_usage_daily;
alter table public.profiles drop column if exists acquisition;
