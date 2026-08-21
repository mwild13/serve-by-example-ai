"use client";

import { useCallback, useEffect, useState } from "react";
import { useMobileSession } from "./mobile-session-context";
import type { ScenarioType } from "@/lib/mastery";

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
  /**
   * Which write path produced this row — Quiz, Scenario Training
   * (descriptor), or Arena (roleplay). GET /api/training/progress has
   * always returned this (getReviewQueue() in lib/mastery.ts selects
   * scenario_type), it just wasn't in this type yet. ProgressScreen's
   * "Up Next For Review" list (Phase 5) branches its label on it.
   */
  scenarioType: ScenarioType;
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
  /**
   * True when this user's own staff role (Manager/Supervisor at a linked
   * venue) auto-unlocked the Management category — distinct from paying
   * for it directly. API already computes and returns this (server-side
   * write happens in the same request); Phase 3 (v4-migration-plan/00,
   * item 9) is the first mobile consumer, used to tell "management is
   * paywalled" apart from "management needs a Manager/Supervisor role" on
   * ScenarioTrainingScreen's category cards.
   */
  autoUnlockManagement: boolean;
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
