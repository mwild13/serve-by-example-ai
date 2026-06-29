-- Phase 3: Clean RLS Policies and Add Critical Performance Indexes
-- Purpose: Fix security gaps and optimize manager dashboard performance
-- Date: 2026-06-28

-- ============================================================
-- PART 1: Secure scenario_mastery table with RLS
-- ============================================================
-- Issue: scenario_mastery had no RLS policies, allowing potential data leakage
-- Fix: Add policies so users can only see their own training records

ALTER TABLE scenario_mastery ENABLE ROW LEVEL SECURITY;

-- Users can read only their own scenario mastery records
CREATE POLICY "Users can read own scenario_mastery" ON scenario_mastery
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own scenario mastery records (admin client used for writes)
CREATE POLICY "Users can insert own scenario_mastery" ON scenario_mastery
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own scenario mastery records (spaced repetition, ELO updates)
CREATE POLICY "Users can update own scenario_mastery" ON scenario_mastery
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- PART 2: Clean up profiles table RLS policies
-- ============================================================
-- Issue: profiles had duplicate SELECT/UPDATE policies with conflicting naming
-- Note: The 20260621_organizations_and_billing migration already added the correct policies
-- This section ensures no conflicts exist and uses authenticated role exclusively

-- Verify profiles has RLS enabled (should be from previous migration)
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY; (already done in 20260621)

-- Drop any legacy public-role policies if they exist (defensive cleanup)
DROP POLICY IF EXISTS "Public select profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Verify the correct authenticated-only policies exist
-- (These were created in 20260621_organizations_and_billing.sql)
-- profiles_select_own: FOR SELECT TO authenticated, users see only their own row
-- profiles_update_own: FOR UPDATE TO authenticated, users update only their own row

-- ============================================================
-- PART 3: Performance index for manager dashboard queries
-- ============================================================
-- Issue: Manager dashboard queries venue_staff.manager_user_id on every RLS check
-- This column is evaluated without an index, causing slow dashboard loads
-- Fix: Add index for fast manager filtering

CREATE INDEX IF NOT EXISTS idx_venue_staff_manager_user_id
  ON public.venue_staff(manager_user_id);

COMMENT ON INDEX idx_venue_staff_manager_user_id IS 'Fast lookup for manager dashboard RLS checks on venue_staff filtering';

-- ============================================================
-- PART 4: Verify critical RLS and indexes are in place
-- ============================================================

-- Verify scenario_mastery RLS is enabled
SELECT
  tablename,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'scenario_mastery') as policy_count
FROM pg_tables
WHERE tablename = 'scenario_mastery';

-- Verify profiles RLS is enabled
SELECT
  tablename,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profiles') as policy_count
FROM pg_tables
WHERE tablename = 'profiles';

-- Verify manager_user_id index exists
SELECT
  indexname,
  tablename,
  indexdef
FROM pg_indexes
WHERE tablename = 'venue_staff'
AND indexname LIKE '%manager_user_id%';

-- List all RLS policies on critical tables
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('scenario_mastery', 'profiles', 'venue_staff')
ORDER BY tablename, policyname;
