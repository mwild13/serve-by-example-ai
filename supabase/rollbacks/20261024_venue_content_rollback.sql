-- Rolls back supabase/migrations/20261024_venue_content.sql.
-- Deletes every venue's added items and their questions. Drill answers
-- already counted in training_activity_daily stay counted.

BEGIN;

DROP TABLE IF EXISTS public.venue_content_questions;
DROP TABLE IF EXISTS public.venue_content_items;

COMMIT;
