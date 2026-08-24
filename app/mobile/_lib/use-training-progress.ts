"use client";

import { useTrainingProgressContext } from "./training-progress-context";
import type { ScenarioType } from "@/lib/mastery";

// Phase C file 02 — Mastery Engine Harvest. Single mobile-facing read path
// wrapping GET /api/training/progress, the canonical aggregate read defined
// in lib/mastery.ts. ProgressScreen, LearnHubScreen, HomeScreen,
// ChallengesScreen, and BadgesGalleryScreen all read through this hook
// instead of each independently re-deriving mastery state from raw attempt
// rows. See v4-migration-plan/02-mastery-engine-harvest.md.
//
// Field names below are canonical per CLAUDE.md: `elo_rating`, `mastery`.
//
// Perf fix (Phase 1a, mobile bug-fix plan, 2026-08-24): this hook used to own
// its own fetch effect, independently re-run on every mount of every
// consuming screen — meaning navigating Home -> Learn -> Home re-fetched
// from zero each time. It now just reads the single shared fetch result from
// TrainingProgressProvider (mounted once in app/mobile/layout.tsx, see
// training-progress-context.tsx). The public shape below
// ({status, data, error, refetch}) is unchanged, so no consumer needed to
// change its import or usage.

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

/** Phase 3c (mobile bug-fix plan) — Modules (quiz) / Scenarios (Category
 * Simulations, descriptor) / AI Scenarios (Live Arena, roleplay) mastery %,
 * per legacy category label. See moduleMasteryByType() in lib/mastery.ts. */
export type CategoryTypeBreakdown = { modules: number; scenarios: number; aiScenarios: number };

export type TrainingProgress = {
  // Legacy 3-category breakdown (bartending/sales/management ~= technical/service/compliance)
  mastery: { bartending: number; sales: number; management: number };
  categoryBreakdown: { bartending: CategoryTypeBreakdown; sales: CategoryTypeBreakdown; management: CategoryTypeBreakdown };
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

export function useTrainingProgress() {
  return useTrainingProgressContext();
}
