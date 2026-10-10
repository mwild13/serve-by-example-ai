-- Pre-launch tidy-up from the Supabase advisors (2026-10-10). No app code
-- depends on the order: this is safe to run at any time, before or after the
-- chore/pre-launch-cleanup branch is live. Nothing here changes who can read
-- which rows. See docs/handoff/2026-10-pre-launch-handoff.md.

begin;

-- 1. Function grants ---------------------------------------------------------
-- Four SECURITY DEFINER trigger functions were executable by everyone through
-- /rest/v1/rpc/. Postgres refuses to run a trigger function outside a trigger,
-- so they could not be abused, but there is no reason to expose them. Triggers
-- keep firing: EXECUTE is checked when a trigger is created, not when it runs.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.handle_user_email_updated() from public, anon, authenticated;
revoke execute on function public.apply_allowlist_role_on_signup() from public, anon, authenticated;
revoke execute on function public.check_org_seat_limit() from public, anon, authenticated;

-- get_user_org_id() returns the caller's own org id. The orgs_member_read
-- policy calls it as a signed-in user, so `authenticated` keeps EXECUTE.
revoke execute on function public.get_user_org_id() from public, anon;
grant execute on function public.get_user_org_id() to authenticated, service_role;

-- 2. RLS: evaluate auth.uid() once per query, not once per row ---------------
-- Same conditions as before, with auth.uid() wrapped in a sub-select so the
-- planner caches it. ALTER POLICY keeps each policy's command and roles.
alter policy "coach_sessions_manager_read" on public.manager_coach_sessions
  using (manager_user_id = (select auth.uid()));
alter policy "Users can read own diagnostic results" on public.module_elo_baseline
  using ((select auth.uid()) = user_id);
alter policy "orgs_member_read" on public.organizations
  using (((select auth.uid()) = owner_user_id) or (id = (select public.get_user_org_id())));
alter policy "profiles_select_own" on public.profiles
  using ((select auth.uid()) = id);
alter policy "Users can read own scenario_mastery" on public.scenario_mastery
  using ((select auth.uid()) = user_id);
alter policy "training_programs_manager_read" on public.training_programs
  using (manager_user_id = (select auth.uid()));
alter policy "Users can view their own challenges" on public.user_challenges
  using ((select auth.uid()) = user_id);
alter policy "inventory_manager_read" on public.venue_inventory_items
  using (manager_user_id = (select auth.uid()));
alter policy "venue_staff_manager_read" on public.venue_staff
  using (manager_user_id = (select auth.uid()));
alter policy "custom_certs_manager_read" on public.venue_staff_certifications
  using (venue_staff_id in (
    select vs.id from public.venue_staff vs where vs.manager_user_id = (select auth.uid())
  ));
alter policy "venues_owner_read" on public.venues
  using (owner_user_id = (select auth.uid()));

-- 3. RLS: one SELECT policy per role -----------------------------------------
-- organization_members had a manager policy (authenticated) and a staff policy
-- (public). Signed-out callers have no auth.uid() and matched neither, so one
-- policy for signed-in users with both conditions returns the same rows.
alter policy "org_members_manager_read" on public.organization_members
  using (manager_id = (select auth.uid()) or user_id = (select auth.uid()));
drop policy "org_members_staff_read" on public.organization_members;

-- modules: signed-in users already read every module through "Anyone can read
-- modules", so the active-only policy only ever mattered for signed-out
-- callers. Scope it to them.
alter policy "Anyone can read active modules" on public.modules to anon;

-- 4. Indexes for foreign keys ------------------------------------------------
-- Both columns are also the filter in the RLS policies above.
create index if not exists idx_training_programs_manager_user_id
  on public.training_programs (manager_user_id);
create index if not exists idx_venue_inventory_items_manager_user_id
  on public.venue_inventory_items (manager_user_id);

commit;
