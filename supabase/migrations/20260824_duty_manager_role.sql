-- Adds "duty_manager": delegated Mission Control access (Staff, Teams,
-- Compliance, Ask AI Coach, Leaderboards, Analytics/Reports) without Stripe
-- subscription ownership and without Billing/Settings access. Only the
-- venue owner (venue_manager/multi_venue_manager/admin) can grant this role
-- via Invite Staff — see app/api/management/memberships/route.ts.
--
-- See v4-migration-plan/11-final-qa-and-launch-readiness.md "Backlog" section
-- for the product rationale (raised 2026-08-24).

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_platform_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_platform_role_check
  CHECK (platform_role = ANY (ARRAY['staff','duty_manager','venue_manager','multi_venue_manager','admin']));

-- organization_members.role has been unconstrained free text in production
-- since the original 20260621 migration's CHECK ('owner','admin','member')
-- never matched what the app actually writes ('staff') and was never
-- actually applied live (confirmed via live pg_constraint query,
-- 2026-08-24). Formalizing it here against real usage instead of the stale
-- original.
ALTER TABLE organization_members DROP CONSTRAINT IF EXISTS organization_members_role_check;
ALTER TABLE organization_members ADD CONSTRAINT organization_members_role_check
  CHECK (role = ANY (ARRAY['staff','duty_manager']));
