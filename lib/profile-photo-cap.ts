// Single source of truth for the AI portrait daily-generation cap — shared
// between app/api/profile-photo/generate/route.ts (which checks and
// increments it) and app/mobile/layout.tsx (which reads it, read-only, to
// seed the initial "Generate Portrait (N)" count before the user has
// generated anything this session). Keeping the "what day is it, how many
// are left" logic in one place avoids the two call sites silently drifting
// out of sync with each other.
export const DAILY_GENERATION_LIMIT = 2;

export function isSameUtcDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

/** Generations already used *as of right now* — 0 if it's a new UTC day
 *  since the stored reset timestamp (or none has ever been recorded). */
export function generationsUsedToday(generationsToday: number | null, resetAt: string | null): number {
  const resetDate = resetAt ? new Date(resetAt) : null;
  const isNewDay = !resetDate || !isSameUtcDay(resetDate, new Date());
  return isNewDay ? 0 : (generationsToday ?? 0);
}

export function remainingGenerations(generationsToday: number | null, resetAt: string | null): number {
  return Math.max(0, DAILY_GENERATION_LIMIT - generationsUsedToday(generationsToday, resetAt));
}
