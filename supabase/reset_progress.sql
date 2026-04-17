-- ─────────────────────────────────────────────────────────────
-- reset_progress.sql
-- Reset all training progress data (scenario_mastery, level progress)
-- Run this in the Supabase SQL editor to clear stale test data.
-- ─────────────────────────────────────────────────────────────

-- Clear all scenario mastery records (Stage 4 progress)
DELETE FROM public.scenario_mastery;

-- Clear all level progress records (Stage 1-3 progress)
DELETE FROM public.user_level_progress;

-- Clear any training session stamps if the table exists
DELETE FROM public.user_training_progress;
