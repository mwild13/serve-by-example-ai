-- Rollback for 20261103_fk_indexes.sql.

DROP INDEX IF EXISTS public.quiz_modules_started_module_id_idx;
DROP INDEX IF EXISTS public.venue_content_items_created_by_idx;
DROP INDEX IF EXISTS public.venue_content_questions_reviewed_by_idx;
DROP INDEX IF EXISTS public.venue_weeks_updated_by_idx;
