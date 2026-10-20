-- Rolls back supabase/migrations/20261027_live_guest_voice.sql.

begin;
drop function if exists public.bump_voice_usage(uuid, integer);
drop table if exists public.voice_usage_daily;
commit;
