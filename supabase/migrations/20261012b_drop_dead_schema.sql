-- Drops schema that no code has read or written since 2026-10-06:
-- the pending_invites table (0 rows, never recorded an insert) and eight
-- profiles columns. Checked against production on 2026-10-12: no view,
-- policy, trigger or other function depends on any of them.
--
-- Safe to run now. Lost for good: profiles.role (4 rows, all 'manager';
-- platform_role is what the app uses) and profiles.notif_achievement_alerts.

begin;

-- award_sbe_elite() was the last writer of all_modules_completed. Same
-- function as before, without that column.
create or replace function public.award_sbe_elite(p_user_id uuid)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_number integer;
begin
  -- The row lock taken by UPDATE makes this assign at most once, and
  -- nextval() only runs for a row that matches.
  update public.profiles
  set sbe_elite_number = nextval('public.sbe_elite_number_seq')
  where id = p_user_id and coalesce(sbe_elite_number, 0) = 0
  returning sbe_elite_number into v_number;

  if v_number is null then
    select sbe_elite_number into v_number from public.profiles where id = p_user_id;
  end if;
  return v_number;
end;
$function$;

drop table if exists public.pending_invites;

-- The two indexes (idx_profiles_platform_version, idx_profiles_manager_id)
-- and the manager_id foreign key go with their columns.
alter table public.profiles
  drop column if exists avatar,
  drop column if exists role,
  drop column if exists manager_id,
  drop column if exists notif_achievement_alerts,
  drop column if exists platform_version,
  drop column if exists diagnostic_completed_at,
  drop column if exists is_founders_user,
  drop column if exists all_modules_completed;

commit;
