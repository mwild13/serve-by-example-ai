-- ============================================================
-- Step 1a: organizations table (B2B billing entity)
-- ============================================================
CREATE TABLE IF NOT EXISTS organizations (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name               TEXT NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  subscription_tier  TEXT NOT NULL DEFAULT 'free',
  seat_limit         INTEGER NOT NULL DEFAULT 0,
  owner_user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_organizations_stripe_customer_id ON organizations(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_organizations_owner_user_id      ON organizations(owner_user_id);

-- ============================================================
-- Step 1b: organization_members junction table
-- ============================================================
CREATE TABLE IF NOT EXISTS organization_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  staff_email TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner','admin','member')),
  status      TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited','active','removed')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, staff_email)
);
CREATE INDEX IF NOT EXISTS idx_org_members_org_id      ON organization_members(org_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id     ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_staff_email ON organization_members(staff_email);

-- ============================================================
-- Step 1c: Add org_id to profiles (nullable — B2C users have NULL)
-- ============================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_org_id ON profiles(org_id);

-- ============================================================
-- Step 1d: billing_events (webhook idempotency)
-- ============================================================
CREATE TABLE IF NOT EXISTS billing_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type      TEXT NOT NULL,
  processed_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_billing_events_stripe_event_id ON billing_events(stripe_event_id);

-- ============================================================
-- Step 1e: RLS Policies
-- ============================================================

-- Helper function: reads profiles.org_id for auth.uid() with SECURITY DEFINER
-- so it bypasses RLS on profiles and breaks mutual recursion between
-- organizations ↔ organization_members policies.
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
  SELECT org_id FROM public.profiles WHERE id = auth.uid();
$$;

-- profiles: users can only read/update their own row
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- organizations: owner has full control; members can read via helper (no cross-table subquery)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orgs_owner_all" ON organizations
  FOR ALL TO authenticated
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);
CREATE POLICY "orgs_member_read" ON organizations
  FOR SELECT TO authenticated
  USING (auth.uid() = owner_user_id OR id = get_user_org_id());

-- organization_members: owner manages all rows; members can read peer list via helper
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_members_owner_all" ON organization_members
  FOR ALL TO authenticated
  USING (
    org_id IN (SELECT id FROM organizations WHERE owner_user_id = auth.uid())
  )
  WITH CHECK (
    org_id IN (SELECT id FROM organizations WHERE owner_user_id = auth.uid())
  );
CREATE POLICY "org_members_self_read" ON organization_members
  FOR SELECT TO authenticated
  USING (
    org_id = get_user_org_id()
    OR org_id IN (SELECT id FROM organizations WHERE owner_user_id = auth.uid())
  );

-- billing_events: no direct client access — admin client only
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Step 1f: Legacy data backfill
-- Idempotent: WHERE org_id IS NULL prevents double-inserts on re-run.
-- Creates an organization for each existing B2B profile, then links
-- their venue_memberships into organization_members.
-- ============================================================
WITH b2b_profiles AS (
  SELECT p.id, p.stripe_customer_id, p.tier
  FROM profiles p
  WHERE p.tier IN ('venue_single','venue_multi','single-venue','multi-venue')
    AND p.org_id IS NULL
),
inserted_orgs AS (
  INSERT INTO organizations (name, stripe_customer_id, subscription_tier, seat_limit, owner_user_id)
  SELECT
    COALESCE(NULLIF(split_part(u.email, '@', 2), ''), 'My Organisation'),
    p.stripe_customer_id,
    CASE p.tier
      WHEN 'venue_single' THEN 'boutique'
      WHEN 'single-venue' THEN 'boutique'
      WHEN 'venue_multi'  THEN 'commercial'
      WHEN 'multi-venue'  THEN 'commercial'
      ELSE 'free'
    END,
    CASE p.tier
      WHEN 'venue_single' THEN 25
      WHEN 'single-venue' THEN 25
      WHEN 'venue_multi'  THEN 125
      WHEN 'multi-venue'  THEN 125
      ELSE 0
    END,
    p.id
  FROM b2b_profiles p
  JOIN auth.users u ON u.id = p.id
  ON CONFLICT DO NOTHING
  RETURNING id, owner_user_id
)
UPDATE profiles
SET org_id = io.id
FROM inserted_orgs io
WHERE profiles.id = io.owner_user_id;

-- Migrate active/invited venue_memberships into organization_members.
-- LEFT JOIN profiles sp resolves the staff member's existing user_id so active staff
-- aren't locked out at login (NULL user_id would break RLS and dashboard auth checks).
INSERT INTO organization_members (org_id, user_id, staff_email, role, status, created_at, updated_at)
SELECT
  p.org_id,
  su.id,
  vm.staff_email,
  'member',
  vm.status,
  vm.created_at,
  vm.updated_at
FROM venue_memberships vm
JOIN profiles p  ON p.id = vm.manager_id
LEFT JOIN auth.users su ON su.email = vm.staff_email
WHERE p.org_id IS NOT NULL
  AND vm.status IN ('invited', 'active')
ON CONFLICT (org_id, staff_email) DO NOTHING;
