Master Supabase Database Blueprint & Scaling RoadmapGenerated from: live_schema_lite.sql + Supabase Table Scan Statistics + Scale ArchitectureTarget Scale: 10k - 100k Concurrent UsersDate: 2026-07-191. Critical Architecture Bugs (Immediate Fixes)Before any new features or major schema refactors are built, these two issues require immediate attention to prevent silent revenue loss and data drift:Bug 1 — Broken seat-limit trigger: check_org_seat_limit() queries FROM organization_members WHERE org_id = NEW.org_id, but that table does not exist in the schema. The actual table is venue_memberships. This trigger is silently failing, meaning seat limits are not enforced in production.Bug 2 — Duplicate billing columns in profiles: plan (text, default 'free') and tier (text, default 'free') are the exact same concept. Every read touches both; every write must stay in sync manually. One must be dropped to prevent data drift.2. Ideal public.profiles TableDesign Principles AppliedEmail Sync: Add email column synced from auth.users via trigger, eliminating cross-schema joins in RLS policies and application queries.Billing Consolidation: Drop plan (consolidate onto tier). Drop subscription_active (derive from subscription_status).Auditability: Add missing created_at / updated_at timestamps.Clarity: Rename avatar to avatar_url.Billing Logic: B2C solo users carry Stripe data directly on profiles; B2B org members derive billing from organizations.The DDL Target StateSQLCREATE TABLE public.profiles (

  -- ── IDENTITY ─────────────────────────────────────────────────────────────
  id                        uuid          PRIMARY KEY
                                          REFERENCES auth.users(id) ON DELETE CASCADE,
  email                     text          NOT NULL,
  -- Synced from auth.users via trigger (see Section 3).
  -- Eliminates the SELECT auth.users sub-query pattern used throughout RLS.

  -- ── DISPLAY ──────────────────────────────────────────────────────────────
  display_name              text,
  avatar_url                text,
  -- Renamed from 'avatar'. Stores Supabase Storage path or external URL.

  -- ── ROLE & ACCESS ────────────────────────────────────────────────────────
  platform_role             text          NOT NULL DEFAULT 'staff'
                                          CHECK (platform_role IN (
                                            'staff',
                                            'venue_manager',
                                            'multi_venue_manager',
                                            'admin'
                                          )),
  management_unlocked       boolean       NOT NULL DEFAULT false,
  is_founders_user          boolean       NOT NULL DEFAULT false,

  -- ── ORG / B2B MEMBERSHIP ─────────────────────────────────────────────────
  org_id                    uuid          REFERENCES public.organizations(id) ON DELETE SET NULL,
  manager_id                uuid          REFERENCES auth.users(id) ON DELETE SET NULL,
  -- manager_id: the auth.users ID of this staff member's direct manager.
  -- For venue_managers this will be NULL (they own the org).

  -- ── BILLING — B2C SOLO PATH ──────────────────────────────────────────────
  -- B2B billing lives on organizations, not here.
  -- These columns are only populated for solo (non-org) subscribers.
  stripe_customer_id        text          UNIQUE,
  tier                      text          NOT NULL DEFAULT 'free',
  -- DROPPED: plan — was a duplicate of tier.
  -- DROPPED: subscription_active — derive: (subscription_status = 'active').
  subscription_status       text,
  subscription_period_end   timestamptz,

  -- ── PLATFORM STATE ────────────────────────────────────────────────────────
  platform_version          integer       NOT NULL DEFAULT 2,
  -- 1 = legacy 3-module system, 2 = current 20-module system.
  onboarding_completed      boolean       NOT NULL DEFAULT false,
  diagnostic_completed      boolean       NOT NULL DEFAULT false,
  diagnostic_completed_at   timestamptz,

  -- ── LEARNING PROGRESS COUNTERS ────────────────────────────────────────────
  current_correct_streak    integer       NOT NULL DEFAULT 0,
  best_correct_streak       integer       NOT NULL DEFAULT 0,
  all_modules_completed     boolean       NOT NULL DEFAULT false,
  sbe_elite_number          integer       NOT NULL DEFAULT 0,

  -- ── STAFF SELF-PROFILE ────────────────────────────────────────────────────
  role                      text,
  venue_type                text,
  experience_level          text,

  -- ── NOTIFICATION PREFERENCES ─────────────────────────────────────────────
  notif_reminders           boolean       NOT NULL DEFAULT true,
  notif_weekly_digest       boolean       NOT NULL DEFAULT true,
  notif_achievement_alerts  boolean       NOT NULL DEFAULT true,

  -- ── UI STATE ─────────────────────────────────────────────────────────────
  current_session_id        uuid,
  trial_grace_modal_shown   boolean       NOT NULL DEFAULT false,

  -- ── TIMESTAMPS ───────────────────────────────────────────────────────────
  created_at                timestamptz   NOT NULL DEFAULT now(),
  updated_at                timestamptz   NOT NULL DEFAULT now()
);

-- Keep existing RLS policies:
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
Required Index Additions (To fix sequential scans)SQL-- Scan stats show 7,129 seq_scans vs 8 idx_scans on profiles.
-- Add these immediately to prevent CPU max-out at 10k+ users.
CREATE INDEX idx_profiles_manager_id   ON public.profiles (manager_id);
CREATE INDEX idx_profiles_platform_role ON public.profiles (platform_role);
3. Email Sync TriggersThese ensure profiles.email stays perfectly synced with auth.users, removing the need for slow sub-queries during RLS evaluations.SQL-- ── FUNCTION 1: Create profile on new user signup ─────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''           -- prevents search_path hijacking
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ── FUNCTION 2: Keep email in sync when user changes it ───────────────────
CREATE OR REPLACE FUNCTION public.handle_user_email_updated()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.profiles
  SET
    email      = NEW.email,
    updated_at = now()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_email_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION public.handle_user_email_updated();
4. Full Table Relationship BlueprintPlaintextauth.users  (Supabase-managed)
│
├──► public.profiles                  1:1  — core user record, email synced via trigger
│       ├── org_id      ──────────► public.organizations             N:1
│       └── manager_id  ──────────► auth.users                      N:1
│
public.organizations                  — B2B account/billing unit
│   ├── owner_user_id  ────────────► auth.users                     N:1
│   └── (trial + Stripe fields)
│       └──► public.venues           1:N  — via venues.owner_user_id → auth.users
│
public.venues                         — individual venue locations
│   ├── owner_user_id  ────────────► auth.users
│   ├──► public.venue_staff          1:N  — staff roster per venue
│   │       ├── staff_user_id ──────► auth.users (nullable, set on signup)
│   │       └──► venue_staff_certifications   1:N
│   ├──► public.venue_memberships    1:N  — invite lifecycle
│   ├──► public.venue_inventory_items 1:N
│   ├──► public.training_programs    1:N
│   └──► public.manager_coach_sessions 1:N
│
public.modules                        — reference table, 20 modules
│   ├──► public.scenarios            1:N  — scenario content per module
│   └──► public.scenario_mastery     1:N  — via module_id (user progress)
│
── USER LEARNING DATA ─────────────────────────────────────────────────────
public.scenario_mastery               — primary learning progress table (v2)
public.module_elo_baseline            — diagnostic assessment results
public.user_challenges                — 5 interactive challenge completions
public.user_level_progress            — level gating per module (v1 legacy)
public.diagnostic_questions           — question bank (no user FK)

── SOCIAL / RECOGNITION ───────────────────────────────────────────────────
public.staff_recognitions             — staff_id → venue_staff

── INVITE / ACCESS CONTROL ────────────────────────────────────────────────
public.pending_invites                — manager_user_id → auth.users
public.user_access_allowlist          — email → platform_role pre-auth

── BILLING & MARKETING ────────────────────────────────────────────────────
public.billing_events                 — Stripe webhook event log
public.toolkit_leads                  — pre-signup lead capture (Dead)
public.waitlist                       — pre-launch waitlist (Dead)
5. Dead & Legacy Tables (The Purge)Based on exact read/write scan statistics.TableStatusAction RequiredsubscriptionsDead (0 writes)Billing state is duplicated in profiles. Drop completely.waitlistDead (0 writes)Pre-launch artifact. Drop completely.toolkit_leadsDead (0 writes)RLS blocks all auth access anyway. Drop completely.user_training_progressLegacy (v1)Only used by platform_version = 1. Rename to _legacy_user_training_progress.user_level_progressLegacy (v1)Audit v2 usage; archive when v1 users finish migrating.6. The Membership Fragmentation ProblemStaff-venue relationships are currently tracked in three overlapping places (venue_memberships, venue_staff, profiles.org_id). This creates the broken trigger issue and massive technical debt.The Target State:Plaintextorganization_members   — canonical membership table (CREATE this, fix the trigger)
    id uuid PK
    org_id   → organizations
    user_id  → auth.users (nullable until invite accepted)
    venue_id → venues (nullable for org-level members)
    role     text CHECK (...)
    status   text CHECK ('invited','active','removed')
    seat_counted boolean  -- for seat limit enforcement

venue_staff            — Retain for domain-specific compliance (RSA state, ELO). 
                         Must FK to organization_members.id as source of truth.
7. Infrastructure Scaling (100k+ Users)Code optimization is only half the battle. Hardware configuration is required for high scale.Supavisor Connection Pooling: Change the application environment connection strings to use Supabase Port 6543 instead of 5432. This pools transactions and prevents database connection limit exhaustion during traffic spikes.Read Replicas: Do not attempt geo-sharding. Because the app is highly read-biased (viewing modules, leaderboards), deploy a Supabase Read Replica from the dashboard when traffic spikes. Route heavy SELECT queries to the replica to leave the primary database free for INSERT/UPDATE mutations.8. The Master Execution Roadmap (Step-by-Step)Do not run these all at once. Execute sequentially via Supabase CLI migrations.Phase 1: Foundation Patches (Stop the bleeding)Update check_org_seat_limit() to point to venue_memberships.Add idx_profiles_manager_id and idx_profiles_platform_role indexes.Add created_at and updated_at to profiles.Phase 2: Profile Purge & Email Sync (Optimize RLS)Deploy the handle_new_user and handle_user_email_updated triggers.Backfill current emails from auth.users to profiles.Drop profiles.plan and profiles.subscription_active.Phase 3: Unifying the Membership ModelCreate organization_members table.Migrate venue_memberships data into the new table.Repurpose venue_staff to link to organization_members.Phase 4: Dead Weight PurgeRename legacy tables to _legacy_*.Drop subscriptions, waitlist, and toolkit_leads.Phase 5: Infrastructure Scale-UpUpdate .env files to route traffic through Supavisor (Port 6543).