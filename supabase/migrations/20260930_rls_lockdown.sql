-- RLS lockdown: clients are read-only on every application table.
-- Audit 2026-09-30 (C1, C2, C3) — see
-- docs/handoff/security/2026-09-30-audit-remediation-todo.md, Phase 2.
--
-- Before this, authenticated users could write directly through PostgREST
-- (public anon key + their own JWT), bypassing every server-side check:
--   * scenario_mastery          — forge is_mastered/mastery_level for all 40 modules
--   * profiles (all 34 columns) — set tier/platform_role/subscription_status
--   * organizations / organization_members — self-provision a trial, self-sponsor
--   * venue_staff / venues      — inject staff into another org's venue
-- plus the other manager tables below.
--
-- After this migration every write goes through a server route using the
-- service-role client (which bypasses RLS and table grants), behind
-- requireManager() or an explicit ownership check. Clients keep SELECT on
-- their own rows only.
--
-- PREREQUISITE: the app code from branch audit-remediation must be deployed
-- first. It moves the remaining client/user-client writes server-side
-- (lib/management/service.ts callers, DashboardShell notification prefs,
-- signup profile upserts, auth/callback). Applying this before that deploy
-- breaks manager inventory/program/venue/staff writes.
--
-- Rollback: supabase/rollbacks/20260930_rls_lockdown_rollback.sql restores
-- the pre-migration policies and grants exactly.
--
-- Not changed here (deliberately):
--   * check_org_seat_limit(): NULL/0 seat_limit still means "no limit". Three
--     live venue owners have no organizations row, so treating NULL as zero
--     seats would stop staff joining their venues. The exploit (clients
--     writing organizations.seat_limit) is closed by the REVOKEs below; real
--     per-tier seat caps come in Phase 3.
--   * Supabase's default privileges still grant new public tables to anon /
--     authenticated. Any new table needs its own REVOKE until that's changed.
--
-- No explicit BEGIN/COMMIT: apply_migration and the Supabase CLI each run a
-- migration in a single transaction, so this applies all-or-nothing.

-- ── 1. Drop every client write policy ──────────────────────────────────────

-- Mastery / training progress (C1)
DROP POLICY IF EXISTS "Users can insert own scenario_mastery" ON public.scenario_mastery;
DROP POLICY IF EXISTS "Users can update own scenario_mastery" ON public.scenario_mastery;
DROP POLICY IF EXISTS "Users can manage own training progress" ON public._legacy_user_training_progress;
DROP POLICY IF EXISTS "Users can manage own level progress" ON public.user_level_progress;
DROP POLICY IF EXISTS "Users can insert own diagnostic results" ON public.module_elo_baseline;
DROP POLICY IF EXISTS "Users can update own diagnostic results" ON public.module_elo_baseline;
DROP POLICY IF EXISTS "Users can insert their own challenges" ON public.user_challenges;

-- Profile (C2)
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- Org / billing / roster (C3)
DROP POLICY IF EXISTS "orgs_owner_all" ON public.organizations;
DROP POLICY IF EXISTS "org_members_manager_crud" ON public.organization_members;
DROP POLICY IF EXISTS "Managers can manage venue staff" ON public.venue_staff;
DROP POLICY IF EXISTS "Managers can manage their venues" ON public.venues;
DROP POLICY IF EXISTS "Managers can manage inventory items" ON public.venue_inventory_items;
DROP POLICY IF EXISTS "Managers can manage training programs" ON public.training_programs;
DROP POLICY IF EXISTS "Managers manage their pending invites" ON public.pending_invites;
DROP POLICY IF EXISTS "manager_access_own_coach_sessions" ON public.manager_coach_sessions;
DROP POLICY IF EXISTS "manager_manage_recognitions" ON public.staff_recognitions;
DROP POLICY IF EXISTS "manager_access_custom_certs" ON public.venue_staff_certifications;

-- ── 2. SELECT-only replacements (same row scoping as the dropped ALL policies) ─
-- scenario_mastery, profiles, module_elo_baseline, user_challenges and
-- organizations already have their own SELECT policies, kept as-is.

CREATE POLICY "legacy_progress_select_own" ON public._legacy_user_training_progress
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "level_progress_select_own" ON public.user_level_progress
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "org_members_manager_read" ON public.organization_members
  FOR SELECT TO authenticated USING (manager_id = auth.uid());

CREATE POLICY "venue_staff_manager_read" ON public.venue_staff
  FOR SELECT TO authenticated USING (manager_user_id = auth.uid());

CREATE POLICY "venues_owner_read" ON public.venues
  FOR SELECT TO authenticated USING (owner_user_id = auth.uid());

CREATE POLICY "inventory_manager_read" ON public.venue_inventory_items
  FOR SELECT TO authenticated USING (manager_user_id = auth.uid());

CREATE POLICY "training_programs_manager_read" ON public.training_programs
  FOR SELECT TO authenticated USING (manager_user_id = auth.uid());

CREATE POLICY "coach_sessions_manager_read" ON public.manager_coach_sessions
  FOR SELECT TO authenticated USING (manager_user_id = auth.uid());

CREATE POLICY "recognitions_manager_read" ON public.staff_recognitions
  FOR SELECT TO authenticated USING (from_manager_id = auth.uid());

CREATE POLICY "custom_certs_manager_read" ON public.venue_staff_certifications
  FOR SELECT TO authenticated
  USING (venue_staff_id IN (SELECT id FROM public.venue_staff WHERE manager_user_id = auth.uid()));

-- pending_invites: no client read policy at all. Only server routes read it,
-- and it historically stored Supabase invite action links (audit H1).

-- ── 3. Revoke table write privileges from client roles ─────────────────────
-- Belt and braces: even if a permissive policy is added later by mistake,
-- clients hold no INSERT/UPDATE/DELETE privilege on these tables.

REVOKE INSERT, UPDATE, DELETE, TRUNCATE, TRIGGER, REFERENCES ON TABLE
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
FROM anon, authenticated;


-- ── Verification (run after applying; expect zero rows from each) ─────────
-- Client write privileges left on public tables:
--   SELECT table_name, grantee, privilege_type FROM information_schema.role_table_grants
--   WHERE table_schema = 'public' AND grantee IN ('anon','authenticated')
--     AND privilege_type IN ('INSERT','UPDATE','DELETE','TRUNCATE');
-- Client write policies left:
--   SELECT tablename, policyname, cmd FROM pg_policies
--   WHERE schemaname = 'public' AND cmd <> 'SELECT'
--     AND NOT (qual = 'false' OR with_check = 'false');
