// Single source of truth for how many "Challenges" mini-games exist and
// their valid index range. Referenced by the save/progress API routes and
// the desktop/mobile UIs so the count only needs to change in one place.
//
// This does NOT cover the DB layer — user_challenges.challenge_index has its
// own CHECK (challenge_index >= 0 AND challenge_index <= 4) constraint
// (supabase/migrations/20260630_user_challenges.sql) that must be widened
// via a new migration when TOTAL_CHALLENGES changes. See docs/CHALLENGES.md
// §5 for the full "adding a new challenge" checklist — this file is step 3
// of that checklist, not a replacement for the rest of it.

export const TOTAL_CHALLENGES = 5;
export const MIN_CHALLENGE_INDEX = 0;
export const MAX_CHALLENGE_INDEX = TOTAL_CHALLENGES - 1;

/** Bounds-checks a challenge index against the current valid range. */
export function isValidChallengeIndex(index: number): boolean {
  return Number.isFinite(index) && index >= MIN_CHALLENGE_INDEX && index <= MAX_CHALLENGE_INDEX;
}
