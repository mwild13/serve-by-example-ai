-- Phase 4: Compliance Tracking for Australian Hospitality
-- Purpose: Add RSA, FSS, and operational compliance columns to venue_staff table
-- Date: 2026-06-29
-- Supports: StaffComplianceRecord type in lib/management/types.ts

-- ============================================================
-- Create constraint types for compliance states
-- ============================================================

-- RSA state constraint (Responsible Service of Alcohol)
-- valid: RSA current and valid
-- warning_30d: RSA expires within 30 days
-- warning_7d: RSA expires within 7 days
-- expired: RSA has passed expiry date
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'rsa_state'
  ) THEN
    CREATE TYPE rsa_state AS ENUM ('valid', 'warning_30d', 'warning_7d', 'expired');
  END IF;
END $$;

-- Australian state constraint
-- Valid states: NSW, VIC, QLD, WA, SA, TAS, NT, ACT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'australian_state'
  ) THEN
    CREATE TYPE australian_state AS ENUM ('NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'NT', 'ACT');
  END IF;
END $$;

-- ============================================================
-- Add compliance columns to venue_staff table
-- ============================================================

ALTER TABLE venue_staff
  ADD COLUMN IF NOT EXISTS rsa_state rsa_state DEFAULT 'expired',
  ADD COLUMN IF NOT EXISTS rsa_jurisdiction australian_state DEFAULT 'NSW',
  ADD COLUMN IF NOT EXISTS rsa_expiry_date TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS fss_expiry_date TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS fss_on_site_copy BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS shift_confirmed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_junior BOOLEAN NOT NULL DEFAULT false;

-- ============================================================
-- Create indexes for compliance filtering in manager dashboard
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_venue_staff_rsa_state
  ON public.venue_staff(rsa_state)
  WHERE rsa_state IN ('warning_30d', 'warning_7d', 'expired');

COMMENT ON INDEX idx_venue_staff_rsa_state IS 'Fast lookup for RSA compliance warnings on manager dashboard';

CREATE INDEX IF NOT EXISTS idx_venue_staff_fss_expiry
  ON public.venue_staff(fss_expiry_date)
  WHERE fss_expiry_date IS NOT NULL;

COMMENT ON INDEX idx_venue_staff_fss_expiry IS 'Fast lookup for FSS expiry dates';

CREATE INDEX IF NOT EXISTS idx_venue_staff_is_junior
  ON public.venue_staff(is_junior)
  WHERE is_junior = true;

COMMENT ON INDEX idx_venue_staff_is_junior IS 'Fast lookup for junior staff filtering';

-- ============================================================
-- Add comments to compliance columns
-- ============================================================

COMMENT ON COLUMN venue_staff.rsa_state IS 'RSA certification state: valid, warning_30d, warning_7d, or expired';
COMMENT ON COLUMN venue_staff.rsa_jurisdiction IS 'Australian state for RSA certification validity';
COMMENT ON COLUMN venue_staff.rsa_expiry_date IS 'Date when RSA certification expires (null if not recorded)';
COMMENT ON COLUMN venue_staff.fss_expiry_date IS 'Date when Food Safety Supervisor certification expires (null if N/A)';
COMMENT ON COLUMN venue_staff.fss_on_site_copy IS 'Whether venue has on-site copy of FSS certificate verified';
COMMENT ON COLUMN venue_staff.shift_confirmed IS 'Manager confirmation that shift allocation has been verified';
COMMENT ON COLUMN venue_staff.is_junior IS 'Whether staff member is under 18 or requires supervised service (NSW 28-day rule)';

-- ============================================================
-- Verify compliance schema is in place
-- ============================================================

SELECT
  tablename,
  attname as column_name,
  typname as column_type
FROM pg_tables
JOIN pg_class ON pg_class.relname = pg_tables.tablename
JOIN pg_attribute ON pg_attribute.attrelid = pg_class.oid
JOIN pg_type ON pg_type.oid = pg_attribute.atttypid
WHERE tablename = 'venue_staff'
  AND attname IN ('rsa_state', 'rsa_jurisdiction', 'rsa_expiry_date', 'fss_expiry_date', 'fss_on_site_copy', 'shift_confirmed', 'is_junior')
ORDER BY attnum;
