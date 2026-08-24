// Single source of truth for the client-only daily-login streak counter.
//
// This is NOT scenario_mastery's consecutive_correct / profiles
// .best_correct_streak (server-tracked, quiz-answer-accuracy streak,
// surfaced as TrainingProgress.bestCorrectStreak) — see
// BadgesGalleryScreen.tsx's own doc comment warning not to conflate the
// two. This streak lives only in localStorage, keyed by "sbe-streak-last"
// / "sbe-streak-count", and increments at most once per calendar day.
//
// Previously duplicated verbatim inside PreShiftHome.tsx (desktop). Phase 6
// of the V4 migration (v4-migration-plan/00-bug-batch-plan.md, item 13)
// needed the exact same increment-on-daily-visit logic for mobile, so this
// moved here as the one shared implementation both surfaces import, rather
// than letting mobile grow a second copy. Desktop and mobile share a
// browser + localStorage per logged-in account, so calling this from
// whichever surface the user opens first in a day naturally satisfies "don't
// double-increment if the user opens both surfaces the same day" — the
// lastDate === today check IS the dedupe; no separate cross-surface
// coordination is needed as long as both surfaces call this exact function.
//
// NOTE: app/dashboard/_components/MobileDashboardV3.tsx has its own,
// user-namespaced variant (`sbe-streak-last-${userId}` /
// `sbe-streak-count-${userId}`) that predates this file — a pre-existing,
// separate inconsistency in V3's legacy mobile-responsive shell. Out of
// scope for the V4 migration plan; not touched here.
export function computeStreak(): number {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const lastDate = localStorage.getItem("sbe-streak-last");
    const streakCount = parseInt(localStorage.getItem("sbe-streak-count") ?? "0", 10);
    if (!lastDate) {
      localStorage.setItem("sbe-streak-last", today);
      localStorage.setItem("sbe-streak-count", "1");
      return 1;
    }
    if (lastDate === today) return streakCount || 1;
    const daysDiff = Math.round((new Date(today).getTime() - new Date(lastDate).getTime()) / 86400000);
    if (daysDiff === 1) {
      const next = streakCount + 1;
      localStorage.setItem("sbe-streak-last", today);
      localStorage.setItem("sbe-streak-count", String(next));
      return next;
    }
    localStorage.setItem("sbe-streak-last", today);
    localStorage.setItem("sbe-streak-count", "1");
    return 1;
  } catch {
    return 0;
  }
}
