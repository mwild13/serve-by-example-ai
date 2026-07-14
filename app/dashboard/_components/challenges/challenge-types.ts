export type ChallengeGameProps = {
  onComplete?: () => void;
  onIncorrect?: () => void;
};

export const STEP_LABELS = ["Sequence Sort", "Fill the Blank", "Match Pair", "Spot the Error", "Multiple Choice"];
