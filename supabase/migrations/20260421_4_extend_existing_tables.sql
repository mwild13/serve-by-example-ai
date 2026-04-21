-- Phase 1: Extend existing tables for module-based system
-- Non-breaking changes to support 20-module platform_version = 2

-- ===== Extend scenario_mastery table =====
ALTER TABLE IF EXISTS scenario_mastery
  ADD COLUMN IF NOT EXISTS module_id INT REFERENCES modules(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_scenario_mastery_module_id
  ON scenario_mastery(module_id) WHERE module_id IS NOT NULL;

COMMENT ON COLUMN scenario_mastery.module_id IS 'Links scenario mastery records to specific modules (1-20)';

-- ===== Extend profiles table =====
ALTER TABLE IF EXISTS profiles
  ADD COLUMN IF NOT EXISTS platform_version INT DEFAULT 1;

ALTER TABLE IF EXISTS profiles
  ADD COLUMN IF NOT EXISTS diagnostic_completed BOOLEAN DEFAULT FALSE;

ALTER TABLE IF EXISTS profiles
  ADD COLUMN IF NOT EXISTS diagnostic_completed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_profiles_platform_version ON profiles(platform_version);
CREATE INDEX IF NOT EXISTS idx_profiles_diagnostic_completed ON profiles(diagnostic_completed);

COMMENT ON COLUMN profiles.platform_version IS 'v1=legacy 3-module, v2=new 20-module system';
COMMENT ON COLUMN profiles.diagnostic_completed IS 'B2B venue staff must complete diagnostic before accessing modules';
COMMENT ON COLUMN profiles.diagnostic_completed_at IS 'Timestamp when diagnostic was completed';

-- ===== Extend venues table =====
ALTER TABLE IF EXISTS venues
  ADD COLUMN IF NOT EXISTS enabled_module_ids INT[];

ALTER TABLE IF EXISTS venues
  ADD COLUMN IF NOT EXISTS force_diagnostic_on_join BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_venues_enabled_modules ON venues USING GIN(enabled_module_ids);

COMMENT ON COLUMN venues.enabled_module_ids IS 'NULL = all modules available; array of IDs to restrict specific modules';
COMMENT ON COLUMN venues.force_diagnostic_on_join IS 'If true, B2B staff must complete diagnostic before first module access';

-- ===== Extend venue_staff table =====
ALTER TABLE IF EXISTS venue_staff
  ADD COLUMN IF NOT EXISTS module_completion_pct REAL DEFAULT 0;

ALTER TABLE IF EXISTS venue_staff
  ADD COLUMN IF NOT EXISTS module_mastery_pct REAL DEFAULT 0;

ALTER TABLE IF EXISTS venue_staff
  ADD COLUMN IF NOT EXISTS avg_module_elo INT DEFAULT 1200;

CREATE INDEX IF NOT EXISTS idx_venue_staff_module_completion ON venue_staff(module_completion_pct);

COMMENT ON COLUMN venue_staff.module_completion_pct IS 'Percentage of scenarios attempted across all 20 modules';
COMMENT ON COLUMN venue_staff.module_mastery_pct IS 'Percentage of scenarios at mastery level (3) across all modules';
COMMENT ON COLUMN venue_staff.avg_module_elo IS 'Average Elo rating across all modules for this staff member';

-- ===== Backfill scenario_mastery module_id for existing 3-module system =====
-- Maps old hardcoded modules to new module IDs (1=Bartending, 2=Sales, 3=Management)
UPDATE scenario_mastery
  SET module_id = CASE
    WHEN module = 'bartending' THEN 1
    WHEN module = 'sales' THEN 2
    WHEN module = 'management' THEN 3
    ELSE NULL
  END
  WHERE module_id IS NULL AND module IN ('bartending', 'sales', 'management');

-- ===== Add RLS policy for scenarios table =====
-- Ensure all authenticated users can read scenario content
CREATE POLICY "Anyone can read scenarios" ON scenarios
  FOR SELECT TO authenticated
  USING (true);

-- ===== Add RLS policy for modules table =====
-- Ensure all authenticated users can read module metadata
CREATE POLICY "Anyone can read modules" ON modules
  FOR SELECT TO authenticated
  USING (true);

-- ===== Add RLS policy for diagnostic_questions table =====
-- Ensure all authenticated users can read diagnostic questions
CREATE POLICY "Anyone can read diagnostic questions" ON diagnostic_questions
  FOR SELECT TO authenticated
  USING (is_active = true);

-- ===== Add RLS policy for module_elo_baseline table =====
-- Users can only read their own diagnostic results
CREATE POLICY "Users can read own diagnostic results" ON module_elo_baseline
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Authenticated users can insert their own diagnostic results
CREATE POLICY "Users can insert own diagnostic results" ON module_elo_baseline
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own diagnostic results
CREATE POLICY "Users can update own diagnostic results" ON module_elo_baseline
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Verify updated tables
SELECT 'scenario_mastery columns' as table_name, COUNT(column_name) FROM information_schema.columns WHERE table_name = 'scenario_mastery';
SELECT 'profiles columns' as table_name, COUNT(column_name) FROM information_schema.columns WHERE table_name = 'profiles';
SELECT 'venues columns' as table_name, COUNT(column_name) FROM information_schema.columns WHERE table_name = 'venues';
SELECT 'venue_staff columns' as table_name, COUNT(column_name) FROM information_schema.columns WHERE table_name = 'venue_staff';

-- Final verification of all new tables
SELECT COUNT(*) as total_modules FROM modules;
SELECT COUNT(*) as total_scenarios FROM scenarios;
SELECT COUNT(*) as total_diagnostic_questions FROM diagnostic_questions;
SELECT COUNT(*) as total_backedouts_scenarios FROM scenario_mastery WHERE module_id IS NOT NULL;
