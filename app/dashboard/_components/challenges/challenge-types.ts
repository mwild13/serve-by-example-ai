export type ChallengeGameProps = {
  onComplete?: () => void;
  onIncorrect?: () => void;
};

// Keep this array's length in sync with TOTAL_CHALLENGES (@/lib/challenges) —
// see docs/CHALLENGES.md §5 for the full checklist when adding a new game.
export const STEP_LABELS = ["Sequence Sort", "Fill the Blank", "Match Pair", "Spot the Error", "Multiple Choice"];
