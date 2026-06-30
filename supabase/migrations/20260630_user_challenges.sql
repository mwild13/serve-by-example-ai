-- Phase 1: User Challenge Completion Tracking
-- Purpose: Persist challenge completions to server instead of localStorage
-- Date: 2026-06-30
-- Replaces: localStorage "sbe_challenges_completed" key

-- ============================================================
-- Create user_challenges table for persisting completions
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_index INTEGER NOT NULL CHECK (challenge_index >= 0 AND challenge_index <= 4),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, challenge_index)
);

COMMENT ON TABLE public.user_challenges IS 'Tracks user completion of 5 interactive challenge formats (0-4)';
COMMENT ON COLUMN public.user_challenges.challenge_index IS '0=SequenceSort, 1=FillBlank, 2=MatchPair, 3=SpotError, 4=MultipleChoice';
COMMENT ON COLUMN public.user_challenges.completed_at IS 'When the user completed this challenge';

-- ============================================================
-- Create indexes for fast lookups
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id
  ON public.user_challenges(user_id);

CREATE INDEX IF NOT EXISTS idx_user_challenges_completed_at
  ON public.user_challenges(user_id, completed_at DESC);

COMMENT ON INDEX idx_user_challenges_user_id IS 'Fast lookup of all completed challenges for a user';
COMMENT ON INDEX idx_user_challenges_completed_at IS 'Fast lookup of most recent challenge completions';

-- ============================================================
-- Enable RLS (Row Level Security)
-- ============================================================

ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;

-- Users can only see/write their own challenges
CREATE POLICY "Users can view their own challenges"
  ON public.user_challenges
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own challenges"
  ON public.user_challenges
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

COMMENT ON POLICY "Users can view their own challenges" ON public.user_challenges IS 'RLS: users can only see their own challenge records';
COMMENT ON POLICY "Users can insert their own challenges" ON public.user_challenges IS 'RLS: users can only create challenge records for themselves';

-- ============================================================
-- Verify schema is in place
-- ============================================================

SELECT
  tablename,
  schemaname
FROM pg_tables
WHERE tablename = 'user_challenges'
LIMIT 1;
