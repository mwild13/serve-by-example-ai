"use client";

import { useEffect, useState } from "react";
import { useMobileSession } from "./mobile-session-context";

// Shared completion-sync hook for the 5 mobile Challenge games. Factored out
// of MatchPairsScreen.tsx's own inline effect (file 05) so the other 4 games
// built this pass (Sequence Sort, Fill the Blank, Spot the Error, Multiple
// Choice) don't each duplicate the same localStorage + API sync boilerplate.
// MatchPairsScreen.tsx itself is left as-is (already shipped, working,
// out of scope to refactor here) — same behavior, just not re-plumbed onto
// this hook to avoid touching a file that didn't need changing.
//
// On isComplete flipping true (once per mount): writes challengeIndex into
// the same "sbe_challenges_completed" localStorage key V3 desktop uses
// (device-level completion, not per-surface — see v4-migration-plan/05), then
// fires POST /api/training/challenges/save fire-and-forget, exactly matching
// ChallengesPage.tsx's own markComplete() pattern.
export function useMarkChallengeComplete(challengeIndex: number, isComplete: boolean) {
  const session = useMobileSession();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isComplete || saved) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaved(true);

    try {
      const stored = localStorage.getItem("sbe_challenges_completed");
      const existing: number[] = stored ? (JSON.parse(stored) as number[]) : [];
      if (!existing.includes(challengeIndex)) {
        localStorage.setItem("sbe_challenges_completed", JSON.stringify([...existing, challengeIndex]));
      }
    } catch {
      /* ignore */
    }

    void fetch("/api/training/challenges/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
      },
      body: JSON.stringify({ challengeIndex }),
    }).catch((err) => console.error("[useMarkChallengeComplete] Failed to sync challenge:", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete, saved, challengeIndex]);
}
