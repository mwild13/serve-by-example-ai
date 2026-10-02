-- To-do 2026-10-02 (Phase 1): make account deletion a single, atomic
-- auth.admin.deleteUser() call instead of a hard-coded table list in
-- app/api/profile/delete/route.ts.
--
-- Safe to apply BEFORE the new route ships (expand-only: one FK loosened,
-- one trigger added). Nothing in the app deletes profiles today, so the
-- trigger is dormant until the route goes live.
--
-- Why the old route broke: the FK graph on auth.users already cascades every
-- per-user training table (profiles, scenario_mastery, training_attempts,
-- verify_attempts, user_challenges, module_elo_baseline). Deleting the auth
-- user is enough. The two things the cascade does NOT do correctly:
--
--   1. venue_staff.staff_user_id -> auth.users is NO ACTION, so deleteUser()
--      fails for any staff member linked to a roster. The roster row belongs
--      to the manager (Privacy Policy 5.1: manager data is kept for the venue
--      subscription), so it is unlinked and marked inactive, not deleted.
--   2. organization_members.user_id -> profiles is SET NULL, which would leave
--      the row 'active' and still counting against the manager's seat limit.
--      It is marked 'removed', the same soft-delete the manager's own
--      "Remove" action uses.
--
-- Owners are NOT handled here: organizations.owner_user_id is RESTRICT and
-- venues.owner_user_id is CASCADE (would wipe a whole roster). The route
-- refuses self-service deletion for anyone who owns a venue or organization.
--
-- Rollback: supabase/rollbacks/20261004_account_deletion_cascade_rollback.sql

alter table public.venue_staff
  drop constraint venue_staff_staff_user_id_fkey,
  add constraint venue_staff_staff_user_id_fkey
    foreign key (staff_user_id) references auth.users(id) on delete set null;

create or replace function public.release_memberships_on_profile_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.organization_members
     set status = 'removed', updated_at = now()
   where user_id = old.id
     and status <> 'removed';

  update public.venue_staff
     set staff_user_id = null, status = 'inactive', updated_at = now()
   where staff_user_id = old.id;

  return old;
end;
$$;

revoke all on function public.release_memberships_on_profile_delete() from public, anon, authenticated;

drop trigger if exists release_memberships_on_profile_delete on public.profiles;
create trigger release_memberships_on_profile_delete
  before delete on public.profiles
  for each row execute function public.release_memberships_on_profile_delete();

-- Verify:
--   SELECT pg_get_constraintdef(oid) FROM pg_constraint
--    WHERE conname = 'venue_staff_staff_user_id_fkey';   -- ... ON DELETE SET NULL
--   SELECT tgname FROM pg_trigger
--    WHERE tgrelid = 'public.profiles'::regclass AND NOT tgisinternal;
