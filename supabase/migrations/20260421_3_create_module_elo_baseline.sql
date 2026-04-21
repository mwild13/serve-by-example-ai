-- Phase 1: Create module_elo_baseline table
-- Stores diagnostic assessment results and baseline Elo seeding per user

CREATE TABLE IF NOT EXISTS module_elo_baseline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  diagnostic_completed_at TIMESTAMPTZ,
  answers JSONB NOT NULL,
  category_scores JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_module_elo_baseline_user ON module_elo_baseline(user_id);
CREATE INDEX IF NOT EXISTS idx_module_elo_baseline_completed ON module_elo_baseline(diagnostic_completed_at);

-- Comment documenting structure
COMMENT ON TABLE module_elo_baseline IS 'Stores diagnostic assessment results. answers: {questionId: selectedOption}, category_scores: {technical: 1350, service: 1250, ...}';
