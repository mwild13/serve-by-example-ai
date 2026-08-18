"use client";

import { useCallback, useEffect, useState } from "react";
import { useMobileSession } from "./mobile-session-context";

// Phase C file 02 — Mastery Engine Harvest. Single mobile-facing read path
// wrapping GET /api/training/progress, the canonical aggregate read defined
// in lib/mastery.ts. ProgressScreen, LearnHubScreen, and HomeScreen all read
// through this hook instead of each independently re-deriving mastery state
// from raw attempt rows. See v4-migration-plan/02-mastery-engine-harvest.md.
//
// Field names below are canonical per CLAUDE.md: `elo_rating`, `mastery`.

export type TrainingModule = {
  id: number;
  title: string;
  category: "technical" | "service" | "compliance";
  description: string;
  difficulty_level: number;
};

export type ModuleProgress = {
  scenariosAttempted: number;
  scenariosMastered: number;
  avgElo: number;
  completion: number;
  mastery: number;
};

export type ReviewQueueItem = {
  module: string;
  scenarioIndex: number;
  masteryLevel: number;
  nextReviewAt: string;
  lastScore: number;
  consecutiveFails: number;
};

export type TrainingProgress = {
  // Legacy 3-category breakdown (bartending/sales/management ~= technical/service/compliance)
  mastery: { bartending: number; sales: number; management: number };
  skillLevel: number;
  masteredModuleCount: number;
  totalModuleCount: number;
  scenariosStartedCount: number;
  moduleProgress: Record<number, ModuleProgress>;
  allModules: TrainingModule[];
  scenarioCounts: Record<string, number>;
  reviewQueue: ReviewQueueItem[];
  lastAttemptAt: string | null;
  bestCorrectStreak: number;
  sbeEliteNumber: number;
  bestArenaScore: number;
  challengesCompleted: number;
  totalChallenges: number;
  access: { tier: string; allowedModules: number[]; isSponsored: boolean };
};

type State =
  | { status: "loading"; data: null; error: null }
  | { status: "error"; data: null; error: string }
  | { status: "ready"; data: TrainingProgress; error: null };

export function useTrainingProgress() {
  const { token } = useMobileSession();
  const [state, setState] = useState<State>({ status: "loading", data: null, error: null });
  const [refetchToken, setRefetchToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState((prev) => (prev.status === "ready" ? prev : { status: "loading", data: null, error: null }));
      try {
        const res = await fetch("/api/training/progress", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Failed to load training progress (${res.status})`);
        const data = (await res.json()) as TrainingProgress;
        if (!cancelled) setState({ status: "ready", data, error: null });
      } catch (err) {
        if (!cancelled) {
          setState({
            status: "error",
            data: null,
            error: err instanceof Error ? err.message : "Failed to load training progress.",
          });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token, refetchToken]);

  const refetch = useCallback(() => setRefetchToken((n) => n + 1), []);

  return { ...state, refetch };
}
