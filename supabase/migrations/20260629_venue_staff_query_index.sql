-- Stage 4: Performance Index for venue_staff Dashboard Queries
-- Purpose: Optimize venue_staff filtering by venue_id in manager dashboard
-- Date: 2026-06-29

-- ============================================================
-- Add index on venue_id for fast staff filtering
-- ============================================================
-- The manager dashboard queries venue_staff.in("venue_id", venueIds)
-- for every manager session. This index accelerates that critical path.

CREATE INDEX IF NOT EXISTS idx_venue_staff_venue_id
  ON public.venue_staff(venue_id);

COMMENT ON INDEX idx_venue_staff_venue_id IS 'Fast lookup for manager dashboard staff filtering by venue';

-- ============================================================
-- Verify index was created
-- ============================================================

SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'venue_staff'
  AND indexname = 'idx_venue_staff_venue_id';
