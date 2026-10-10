-- Rollback for 20261010_prelaunch_function_grants_and_rls_tuning.sql.
-- Restores the grants and policies exactly as they were on 2026-10-10. No data
-- is involved, so this is safe at any time.

begin;

grant execute on function public.handle_new_user() to public, anon, authenticated;
grant execute on function public.handle_user_email_updated() to public, anon, authenticated;
grant execute on function public.apply_allowlist_role_on_signup() to public, anon, authenticated;
grant execute on function public.check_org_seat_limit() to public, anon, authenticated;
grant execute on function public.get_user_org_id() to public, anon;

alter policy "coach_sessions_manager_read" on public.manager_coach_sessions
  using (manager_user_id = auth.uid());
alter policy "Users can read own diagnostic results" on public.module_elo_baseline
  using (auth.uid() = user_id);
alter policy "orgs_member_read" on public.organizations
  using ((auth.uid() = owner_user_id) or (id = public.get_user_org_id()));
alter policy "profiles_select_own" on public.profiles
  using (auth.uid() = id);
alter policy "Users can read own scenario_mastery" on public.scenario_mastery
  using (auth.uid() = user_id);
alter policy "training_programs_manager_read" on public.training_programs
  using (manager_user_id = auth.uid());
alter policy "Users can view their own challenges" on public.user_challenges
  using (auth.uid() = user_id);
alter policy "inventory_manager_read" on public.venue_inventory_items
  using (manager_user_id = auth.uid());
alter policy "venue_staff_manager_read" on public.venue_staff
  using (manager_user_id = auth.uid());
alter policy "custom_certs_manager_read" on public.venue_staff_certifications
  using (venue_staff_id in (
    select vs.id from public.venue_staff vs where vs.manager_user_id = auth.uid()
  ));
alter policy "venues_owner_read" on public.venues
  using (owner_user_id = auth.uid());

alter policy "org_members_manager_read" on public.organization_members
  using (manager_id = auth.uid());
create policy "org_members_staff_read" on public.organization_members
  for select to public using (user_id = auth.uid());

alter policy "Anyone can read active modules" on public.modules to public;

drop index if exists public.idx_training_programs_manager_user_id;
drop index if exists public.idx_venue_inventory_items_manager_user_id;

commit;
