-- Rollback for 20261004_account_deletion_cascade.sql.
-- Take app/api/profile/delete back to returning 410 first: without the
-- trigger, deleteUser() fails for any staff member linked to a roster.

drop trigger if exists release_memberships_on_profile_delete on public.profiles;
drop function if exists public.release_memberships_on_profile_delete();

alter table public.venue_staff
  drop constraint venue_staff_staff_user_id_fkey,
  add constraint venue_staff_staff_user_id_fkey
    foreign key (staff_user_id) references auth.users(id);
