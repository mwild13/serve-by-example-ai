-- ROLLBACK for supabase/migrations/20261002_atomic_attempts_and_verify_quiz.sql
--
-- Revert the app code first: once the functions are gone, Scenario Training,
-- Arena and the verify quiz can no longer record anything. Dropping the two
-- tables discards the attempt ledger and any in-progress quiz runs; mastery
-- itself (scenario_mastery) is untouched.

BEGIN;

DROP FUNCTION IF EXISTS public.advance_verify_attempt(uuid, uuid, integer, boolean, integer, text);
DROP FUNCTION IF EXISTS public.mark_module_mastered(uuid, text, integer, integer);
DROP FUNCTION IF EXISTS public.record_attempt(uuid, uuid, text, integer, text, integer, numeric, boolean, text, jsonb);

DROP TABLE IF EXISTS public.verify_attempts;
DROP TABLE IF EXISTS public.training_attempts;

COMMIT;
