-- Performance indexes for Mission Control dashboard queries at Enterprise
-- scale (50+ venues / 1,000+ staff per org).
-- Date: 2026-09-01
--
-- getManagementSnapshot() (lib/management/service.ts) batches these two
-- queries with .in("venue_id", venueIds) on every dashboard load:
--   training_programs.select(...).in("venue_id", venueIds)
--   venue_inventory_items.select(...).in("venue_id", venueIds)
-- Neither venue_id column was indexed (only their primary keys were),
-- forcing a sequential scan on every load. venue_staff.venue_id and
-- venue_staff.manager_user_id are already indexed (see
-- 20260629_venue_staff_query_index.sql and 20260628_rls_security_and_indexes.sql).
--
-- NOTE: venues.owner_user_id — also read on every dashboard load via
-- getOwnedVenues() — was verified already indexed live (idx_venues_owner),
-- even though no tracked migration file created it. No action needed here;
-- documenting it so this isn't re-investigated as a gap later.

-- ============================================================
-- training_programs.venue_id — batched .in(venueIds) lookup
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_training_programs_venue_id
  ON public.training_programs(venue_id);

COMMENT ON INDEX idx_training_programs_venue_id IS 'Fast lookup for manager dashboard training-program queries by venue';

-- ============================================================
-- venue_inventory_items.venue_id — batched .in(venueIds) lookup
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_venue_inventory_items_venue_id
  ON public.venue_inventory_items(venue_id);

COMMENT ON INDEX idx_venue_inventory_items_venue_id IS 'Fast lookup for manager dashboard inventory queries by venue';

-- ============================================================
-- Verify indexes were created
-- ============================================================

SELECT indexname, tablename, indexdef
FROM pg_indexes
WHERE indexname IN (
  'idx_training_programs_venue_id',
  'idx_venue_inventory_items_venue_id'
);
