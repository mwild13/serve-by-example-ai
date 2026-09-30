-- ROLLBACK for supabase/migrations/20260930_rls_lockdown.sql
--
-- Restores the exact pre-lockdown policies and client grants, as captured
-- from the live project (gpfwjplqpdehtmtliktf) on 2026-09-30. Only for an
-- emergency: running this RE-OPENS the C1–C3 audit vulnerabilities (direct
-- client writes to mastery, profiles, orgs and rosters). Kept outside
-- supabase/migrations/ on purpose so it is never applied by accident.

-- ── 1. Drop the SELECT-only replacements the lockdown added ────────────────
DROP POLICY IF EXISTS "legacy_progress_select_own" ON public._legacy_user_training_progress;
DROP POLICY IF EXISTS "level_progress_select_own" ON public.user_level_progress;
DROP POLICY IF EXISTS "org_members_manager_read" ON public.organization_members;
DROP POLICY IF EXISTS "venue_staff_manager_read" ON public.venue_staff;
DROP POLICY IF EXISTS "venues_owner_read" ON public.venues;
DROP POLICY IF EXISTS "inventory_manager_read" ON public.venue_inventory_items;
DROP POLICY IF EXISTS "training_programs_manager_read" ON public.training_programs;
DROP POLICY IF EXISTS "coach_sessions_manager_read" ON public.manager_coach_sessions;
DROP POLICY IF EXISTS "recognitions_manager_read" ON public.staff_recognitions;
DROP POLICY IF EXISTS "custom_certs_manager_read" ON public.venue_staff_certifications;

-- ── 2. Recreate the original policies (definitions as captured live) ───────
CREATE POLICY "Users can insert own scenario_mastery" ON public.scenario_mastery
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scenario_mastery" ON public.scenario_mastery
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own training progress" ON public._legacy_user_training_progress
  FOR ALL TO public USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own level progress" ON public.user_level_progress
  FOR ALL TO public USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can insert own diagnostic results" ON public.module_elo_baseline
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own diagnostic results" ON public.module_elo_baseline
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can insert their own challenges" ON public.user_challenges
  FOR INSERT TO public WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "orgs_owner_all" ON public.organizations
  FOR ALL TO authenticated USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);
CREATE POLICY "org_members_manager_crud" ON public.organization_members
  FOR ALL TO public USING (manager_id = auth.uid()) WITH CHECK (manager_id = auth.uid());
CREATE POLICY "Managers can manage venue staff" ON public.venue_staff
  FOR ALL TO public USING (auth.uid() = manager_user_id) WITH CHECK (auth.uid() = manager_user_id);
CREATE POLICY "Managers can manage their venues" ON public.venues
  FOR ALL TO public USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);
CREATE POLICY "Managers can manage inventory items" ON public.venue_inventory_items
  FOR ALL TO public USING (auth.uid() = manager_user_id) WITH CHECK (auth.uid() = manager_user_id);
CREATE POLICY "Managers can manage training programs" ON public.training_programs
  FOR ALL TO public USING (auth.uid() = manager_user_id) WITH CHECK (auth.uid() = manager_user_id);
CREATE POLICY "Managers manage their pending invites" ON public.pending_invites
  FOR ALL TO public USING (auth.uid() = manager_user_id) WITH CHECK (auth.uid() = manager_user_id);
CREATE POLICY "manager_access_own_coach_sessions" ON public.manager_coach_sessions
  FOR ALL TO public USING (manager_user_id = auth.uid()) WITH CHECK (manager_user_id = auth.uid());
CREATE POLICY "manager_manage_recognitions" ON public.staff_recognitions
  FOR ALL TO public USING (from_manager_id = auth.uid()) WITH CHECK (from_manager_id = auth.uid());
CREATE POLICY "manager_access_custom_certs" ON public.venue_staff_certifications
  FOR ALL TO public
  USING (venue_staff_id IN (SELECT venue_staff.id FROM public.venue_staff WHERE venue_staff.manager_user_id = auth.uid()))
  WITH CHECK (venue_staff_id IN (SELECT venue_staff.id FROM public.venue_staff WHERE venue_staff.manager_user_id = auth.uid()));

-- ── 3. Restore client table privileges (live state was full privileges) ────
GRANT INSERT, UPDATE, DELETE, TRUNCATE, TRIGGER, REFERENCES ON TABLE
  public.scenario_mastery,
  public._legacy_user_training_progress,
  public.user_level_progress,
  public.module_elo_baseline,
  public.user_challenges,
  public.profiles,
  public.organizations,
  public.organization_members,
  public.venue_staff,
  public.venues,
  public.venue_inventory_items,
  public.training_programs,
  public.pending_invites,
  public.manager_coach_sessions,
  public.staff_recognitions,
  public.venue_staff_certifications,
  public.billing_events,
  public.user_access_allowlist,
  public.modules,
  public.scenarios,
  public.diagnostic_questions
TO anon, authenticated;
