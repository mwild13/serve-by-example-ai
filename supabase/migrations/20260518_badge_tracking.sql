-- Badge tracking columns on profiles
-- best_correct_streak: highest consecutive-correct streak ever achieved (for Pro badge)
-- sbe_elite_number:    full platform completion cycle count (for SBE Elite badge)
-- all_modules_completed: guard flag — flips TRUE when all 20 modules hit >=80% mastery;
--                        prevents infinite re-increment on every subsequent correct answer

-- current_correct_streak: running tally reset to 0 on any wrong answer
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS current_correct_streak INTEGER NOT NULL DEFAULT 0;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS best_correct_streak INTEGER NOT NULL DEFAULT 0;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS sbe_elite_number INTEGER NOT NULL DEFAULT 0;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS all_modules_completed BOOLEAN NOT NULL DEFAULT FALSE;
