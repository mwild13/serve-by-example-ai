-- Phase 3 Cleanup: Remove legacy public-role RLS policies
-- Purpose: Eliminate duplicate/conflicting policies that expose data via public role
-- Date: 2026-06-28

-- ============================================================
-- Drop legacy public-role policies on scenario_mastery
-- ============================================================
-- These policies allowed public (unauthenticated) access via legacy auth
-- New authenticated-only policies provide proper isolation

DROP POLICY IF EXISTS "Users can manage own scenario mastery" ON scenario_mastery;

-- ============================================================
-- Drop legacy public-role policies on profiles
-- ============================================================
-- These allowed public access; profiles_select_own and profiles_update_own
-- (authenticated role) are the correct replacement policies

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- ============================================================
-- Verify no public-role policies remain on security-critical tables
-- ============================================================

SELECT
  schemaname,
  tablename,
  policyname,
  roles
FROM pg_policies
WHERE tablename IN ('scenario_mastery', 'profiles', 'scenario_mastery')
  AND roles::text LIKE '%public%'
ORDER BY tablename, policyname;
