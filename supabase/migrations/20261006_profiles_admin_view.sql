-- 2026-10-06: public.profiles_admin, a short read-only view of profiles for
-- browsing accounts in the Supabase dashboard.
--
-- profiles has 34 columns in the order they were added, and Postgres can't
-- reorder columns without rebuilding the table. This view shows the six that
-- matter when looking someone up, name first, newest account first. id is
-- last so a row can be traced back to profiles.
--
-- A view, not a copy table: it reads profiles live, so it never goes stale
-- and there is nothing to keep in sync.
--
-- Access: dashboard / service role only. New objects in public are granted to
-- anon and authenticated by default, and a plain view runs as its owner and
-- so skips RLS on profiles; left alone, this view would expose every
-- account's email through PostgREST. security_invoker makes it obey the
-- caller's RLS, and the revokes remove the grants outright.
--
-- No app code reads this view.
--
-- Rollback: supabase/rollbacks/20261006_profiles_admin_view_rollback.sql

create or replace view public.profiles_admin
with (security_invoker = true) as
select
  display_name  as name,
  email,
  platform_role as role,
  tier,
  subscription_status,
  created_at,
  id
from public.profiles
order by created_at desc;

revoke all on public.profiles_admin from anon, authenticated;
