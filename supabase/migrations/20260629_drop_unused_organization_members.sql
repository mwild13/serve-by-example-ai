-- Stage 4 Cleanup: Drop unused organization_members table
-- Purpose: Remove junction table that has zero app code references
-- Date: 2026-06-29
-- Safety: Confirmed via codebase scan that this table is never used in any app logic

DROP TABLE IF EXISTS organization_members;
