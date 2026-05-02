/**
 * mastery.ts — Mastery Engine service layer
 *
 * Handles: mastery level progression, spaced repetition scheduling,
 * Elo rating updates, confidence-accuracy tracking, bridge logic,
 * and 60-minute spam guard.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

// ── Constants ────────────────────────────────────────────────
export const SCENARIO_COUNTS: Record<string, number> = {
  bartending: 10,
  sales: 10,
  management: 20,
};

/**
 * V3: Total modules in the platform. Drives the binary mastery
 * percentage shown on the manager dashboard (mastered / TOTAL_MODULES).
 */
export const V3_TOTAL_MODULES = 20;

/**
 * V3: Module category mapping. Mirrors supabase/migrations/20260421_1_create_modules.sql.
 * Used by the Manager dashboard StaffBadges to compute category mastery.
 */
export const V3_MODULE_CATEGORIES: Record<number, "technical" | "service" | "compliance"> = {
  1: "technical", 2: "technical", 3: "technical", 4: "technical",
  5: "technical", 6: "technical", 7: "technical",
  8: "service", 9: "service", 10: "service", 11: "service",
  12: "service", 13: "service", 14: "service",
  15: "compliance", 16: "compliance", 17: "compliance",
  18: "compliance", 19: "compliance", 20: "compliance",
};

const MASTERY_THRESHOLD = 3; // consecutive correct for mastery
const SPAM_GUARD_MINUTES = 60; // min gap between mastery-advancing attempts on same scenario
const ELO_K = 32; // Elo sensitivity factor
const PASS_SCORE = 15; // out of 25 — threshold for "correct"

export type ConfidenceLevel = "low" | "medium" | "high";

export type MasteryRow = {
  id: string;
  user_id: string;
  module: string;
  scenario_index: number;
  mastery_level: number;
  consecutive_correct: number;
  total_attempts: number;
  total_score_points: number;
  best_score: number;
  last_score: number;
  last_attempt_at: string | null;
  next_review_at: string | null;
  elo_rating: number;
  last_confidence: ConfidenceLevel | null;
  high_confidence_incorrect: number;
  low_confidence_correct: number;
  consecutive_fails: number;
};

export type MasteryProgress = {
  /** Completion % — distinct scenarios at mastery_level >= 1 / total */
  completion: number;
  /** Mastery % — distinct scenarios at mastery_level == 3 / total */
  mastery: number;
  /** Total unique scenarios attempted */
  scenariosAttempted: number;
  /** Total unique scenarios mastered (level 3) */
  scenariosMastered: number;
  /** Average Elo across all attempted scenarios in this module */
  avgElo: number;
  /** Average score across all attempts */
  avgScore: number;
  /** Total attempts (includes repeats) */
  totalAttempts: number;
};

export type SpacedRepetitionItem = {
  module: string;
  scenarioIndex: number;
  masteryLevel: number;
  nextReviewAt: string;
  lastScore: number;
  consecutiveFails: number;
};

export type RecordAttemptInput = {
  userId: string;
  module: string;
  moduleId?: number; // numeric module id for new 20-module system
  scenarioIndex: number;
  overallScore: number;
  confidence: ConfidenceLevel;
};

// Map numeric moduleId to legacy string for modules 1-3 (backward compat)
const LEGACY_MODULE_NAMES: Record<number, string> = {
  1: "bartending",
  2: "sales",
  3: "management",
};

export function moduleIdToString(moduleId: number): string {
  return LEGACY_MODULE_NAMES[moduleId] ?? `module_${moduleId}`;
}

export type RecordAttemptResult = {
  masteryLevel: number;
  previousLevel: number;
  levelChanged: boolean;
  spamGuarded: boolean;
  eloRating: number;
  eloDelta: number;
  nextReviewAt: string;
  isBridge: boolean; // should next scenario be easier?
  consecutiveFails: number;
  confidenceAccuracy: "expert" | "lucky-guesser" | "student" | "liability";
};

// ── Elo calculation ──────────────────────────────────────────

function expectedScore(playerRating: number, scenarioDifficulty: number): number {
  return 1 / (1 + Math.pow(10, (scenarioDifficulty - playerRating) / 400));
}

function newElo(current: number, actual: number, expected: number): number {
  return Math.round(current + ELO_K * (actual - expected));
}

// ── Spaced repetition interval ───────────────────────────────
// Uses exponential backoff: 1, 4, 9, 16 days based on mastery level

function nextReviewDate(masteryLevel: number): string {
  const days = Math.pow(Math.max(masteryLevel, 1), 2);
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

// ── Confidence-accuracy persona ──────────────────────────────

function classifyConfidenceAccuracy(
  confidence: ConfidenceLevel,
  isCorrect: boolean,
): "expert" | "lucky-guesser" | "student" | "liability" {
  if (confidence === "high" && isCorrect) return "expert";
  if (confidence === "low" && isCorrect) return "lucky-guesser";
  if (confidence === "low" && !isCorrect) return "student";
  // high or medium confidence + incorrect
  return confidence === "high" ? "liability" : "student";
}

// ── Scenario difficulty rating (static based on index position) ──

function scenarioDifficulty(module: string, scenarioIndex: number): number {
  const total = SCENARIO_COUNTS[module] ?? 10;
  // Linearly scale from 1000 (easiest) to 1400 (hardest) based on position
  return 1000 + Math.round((scenarioIndex / Math.max(total - 1, 1)) * 400);
}

// ── Core: Record an attempt ──────────────────────────────────

export async function recordAttempt(
  admin: SupabaseClient,
  input: RecordAttemptInput,
): Promise<RecordAttemptResult> {
  const { userId, scenarioIndex, overallScore, confidence } = input;

  // Resolve module string — if moduleId is provided, derive from it
  const moduleName = input.moduleId
    ? moduleIdToString(input.moduleId)
    : input.module;
  const moduleId = input.moduleId ?? null;

  const isCorrect = overallScore >= PASS_SCORE;
  const now = new Date();

  // Fetch existing mastery row
  const { data: existing } = await admin
    .from("scenario_mastery")
    .select("*")
    .eq("user_id", userId)
    .eq("module", moduleName)
    .eq("scenario_index", scenarioIndex)
    .maybeSingle();

  const row = existing as MasteryRow | null;
  const previousLevel = row?.mastery_level ?? 0;
  const currentElo = row?.elo_rating ?? 1200;

  // ── Spam guard: don't advance mastery within 60 minutes ────
  let spamGuarded = false;
  if (row?.last_attempt_at) {
    const lastAttempt = new Date(row.last_attempt_at);
    const minutesSince = (now.getTime() - lastAttempt.getTime()) / 60000;
    if (minutesSince < SPAM_GUARD_MINUTES) {
      spamGuarded = true;
    }
  }

  // ── Elo update ─────────────────────────────────────────────
  const difficulty = scenarioDifficulty(moduleName, scenarioIndex);
  const expected = expectedScore(currentElo, difficulty);
  // Normalize score: 0-25 → 0-1
  const actualNormalized = Math.min(overallScore / 25, 1);
  const updatedElo = newElo(currentElo, actualNormalized, expected);
  const eloDelta = updatedElo - currentElo;

  // ── Mastery level progression ──────────────────────────────
  let newConsecutiveCorrect = row?.consecutive_correct ?? 0;
  let newConsecutiveFails = row?.consecutive_fails ?? 0;
  let newMasteryLevel = previousLevel;

  if (!spamGuarded) {
    if (isCorrect) {
      newConsecutiveCorrect += 1;
      newConsecutiveFails = 0;
      // Advance mastery based on consecutive correct answers
      if (newConsecutiveCorrect >= MASTERY_THRESHOLD) {
        newMasteryLevel = 3; // mastered
      } else if (newConsecutiveCorrect >= 2) {
        newMasteryLevel = Math.max(newMasteryLevel, 2); // practiced
      } else {
        newMasteryLevel = Math.max(newMasteryLevel, 1); // seen/attempted
      }
    } else {
      newConsecutiveCorrect = 0;
      newConsecutiveFails += 1;
      // Drop mastery on failure, but never below 0
      newMasteryLevel = Math.max(newMasteryLevel - 1, 0);
    }
  }

  // ── Confidence-accuracy tracking ───────────────────────────
  const persona = classifyConfidenceAccuracy(confidence, isCorrect);
  const incHighConfIncorrect = confidence === "high" && !isCorrect ? 1 : 0;
  const incLowConfCorrect = confidence === "low" && isCorrect ? 1 : 0;

  // ── Next review date (spaced repetition) ───────────────────
  const review = isCorrect
    ? nextReviewDate(newMasteryLevel)
    : new Date().toISOString(); // failed → review immediately

  // ── Upsert ─────────────────────────────────────────────────
  const newTotalAttempts = (row?.total_attempts ?? 0) + 1;
  const newTotalScore = (row?.total_score_points ?? 0) + overallScore;
  const newBestScore = Math.max(row?.best_score ?? 0, overallScore);

  await admin.from("scenario_mastery").upsert(
    {
      user_id: userId,
      module: moduleName,
      module_id: moduleId,
      scenario_index: scenarioIndex,
      mastery_level: newMasteryLevel,
      consecutive_correct: newConsecutiveCorrect,
      consecutive_fails: newConsecutiveFails,
      total_attempts: newTotalAttempts,
      total_score_points: newTotalScore,
      best_score: newBestScore,
      last_score: overallScore,
      last_attempt_at: now.toISOString(),
      next_review_at: review,
      elo_rating: updatedElo,
      last_confidence: confidence,
      high_confidence_incorrect: (row?.high_confidence_incorrect ?? 0) + incHighConfIncorrect,
      low_confidence_correct: (row?.low_confidence_correct ?? 0) + incLowConfCorrect,
      updated_at: now.toISOString(),
    },
    { onConflict: "user_id,module,scenario_index" },
  );

  // ── Bridge logic ───────────────────────────────────────────
  const isBridge = newConsecutiveFails >= 2;

  return {
    masteryLevel: newMasteryLevel,
    previousLevel,
    levelChanged: newMasteryLevel !== previousLevel,
    spamGuarded,
    eloRating: updatedElo,
    eloDelta,
    nextReviewAt: review,
    isBridge,
    consecutiveFails: newConsecutiveFails,
    confidenceAccuracy: persona,
  };
}

// ── V3: Binary mastery write ─────────────────────────────────
//
// ModuleVerify calls this when a user passes the verification quiz.
// Single row per (user_id, module_id) at scenario_index = 0.
// Sets is_mastered = true and never reverses it within this function.

export type MarkMasteredInput = {
  userId: string;
  moduleId: number;
  consecutiveCorrect: number;
};

export type MarkMasteredResult = {
  isMastered: true;
  alreadyMastered: boolean;
};

export async function markModuleMastered(
  admin: SupabaseClient,
  input: MarkMasteredInput,
): Promise<MarkMasteredResult> {
  const { userId, moduleId, consecutiveCorrect } = input;
  const moduleName = moduleIdToString(moduleId);
  const now = new Date().toISOString();

  const { data: existing } = await admin
    .from("scenario_mastery")
    .select("is_mastered, total_attempts")
    .eq("user_id", userId)
    .eq("module", moduleName)
    .eq("scenario_index", 0)
    .maybeSingle();

  const alreadyMastered = Boolean(existing?.is_mastered);
  const totalAttempts = (existing?.total_attempts ?? 0) + 1;
  const overallScore = Math.min(consecutiveCorrect * 5, 25);

  await admin.from("scenario_mastery").upsert(
    {
      user_id: userId,
      module: moduleName,
      module_id: moduleId,
      scenario_index: 0,
      is_mastered: true,
      mastery_level: 3,
      consecutive_correct: consecutiveCorrect,
      consecutive_fails: 0,
      total_attempts: totalAttempts,
      total_score_points: overallScore * totalAttempts,
      best_score: overallScore,
      last_score: overallScore,
      last_attempt_at: now,
      next_review_at: now,
      updated_at: now,
    },
    { onConflict: "user_id,module,scenario_index" },
  );

  return { isMastered: true, alreadyMastered };
}

// ── Get mastery progress for a module ────────────────────────

export async function getMasteryProgress(
  admin: SupabaseClient,
  userId: string,
  module: string,
): Promise<MasteryProgress> {
  const { data: rows } = await admin
    .from("scenario_mastery")
    .select("mastery_level, total_attempts, total_score_points, elo_rating")
    .eq("user_id", userId)
    .eq("module", module);

  const total = SCENARIO_COUNTS[module] ?? 10;
  const masteryRows = (rows ?? []) as Pick<MasteryRow, "mastery_level" | "total_attempts" | "total_score_points" | "elo_rating">[];

  const attempted = masteryRows.length;
  const mastered = masteryRows.filter((r) => r.mastery_level >= 3).length;
  const passed = masteryRows.filter((r) => r.mastery_level >= 1).length;
  const totalAttempts = masteryRows.reduce((s, r) => s + r.total_attempts, 0);
  const totalScorePoints = masteryRows.reduce((s, r) => s + r.total_score_points, 0);
  const avgElo = attempted > 0
    ? Math.round(masteryRows.reduce((s, r) => s + r.elo_rating, 0) / attempted)
    : 1200;
  const avgScore = totalAttempts > 0
    ? Math.round((totalScorePoints / totalAttempts) * 10) / 10
    : 0;

  return {
    completion: Math.min(Math.round((passed / total) * 100), 100),
    mastery: Math.min(Math.round((mastered / total) * 100), 100),
    scenariosAttempted: attempted,
    scenariosMastered: mastered,
    avgElo,
    avgScore,
    totalAttempts,
  };
}

// ── Get spaced repetition queue (due for review) ─────────────

export async function getReviewQueue(
  admin: SupabaseClient,
  userId: string,
  module?: string,
): Promise<SpacedRepetitionItem[]> {
  const now = new Date().toISOString();

  let query = admin
    .from("scenario_mastery")
    .select("module, scenario_index, mastery_level, next_review_at, last_score, consecutive_fails")
    .eq("user_id", userId)
    .lte("next_review_at", now)
    .order("next_review_at", { ascending: true })
    .limit(20);

  if (module) {
    query = query.eq("module", module);
  }

  const { data: rows } = await query;

  return (rows ?? []).map((r) => ({
    module: r.module as string,
    scenarioIndex: r.scenario_index as number,
    masteryLevel: r.mastery_level as number,
    nextReviewAt: r.next_review_at as string,
    lastScore: r.last_score as number,
    consecutiveFails: r.consecutive_fails as number,
  }));
}

// ── Get all mastery rows for a user+module (for detail views) ──

export async function getScenarioMasteryDetails(
  admin: SupabaseClient,
  userId: string,
  module: string,
): Promise<MasteryRow[]> {
  const { data } = await admin
    .from("scenario_mastery")
    .select("*")
    .eq("user_id", userId)
    .eq("module", module)
    .order("scenario_index", { ascending: true });

  return (data ?? []) as MasteryRow[];
}

// ── Sync mastery data to venue_staff for management dashboard ──

export async function syncMasteryToVenueStaff(
  admin: SupabaseClient,
  userId: string,
  userEmail: string,
): Promise<void> {
  // Try to find staff row by email first, then fall back to staff_user_id
  let staffRows: Array<{ id: string }> | null = null;

  if (userEmail) {
    const { data } = await admin
      .from("venue_staff")
      .select("id")
      .ilike("email", userEmail);
    staffRows = data ?? null;
  }

  if (!staffRows || staffRows.length === 0) {
    const { data } = await admin
      .from("venue_staff")
      .select("id")
      .eq("staff_user_id", userId);
    staffRows = data ?? null;
  }

  if (!staffRows || staffRows.length === 0) return;

  // Dynamic module discovery: query the modules table for live totals and categories.
  // Falls back to V3 hardcoded constants if the table is empty (e.g. pre-migration).
  const { data: moduleRows } = await admin
    .from("modules")
    .select("id, category");

  const activeModules = (moduleRows ?? []) as Array<{ id: number; category: string }>;
  const totalModules = activeModules.length > 0 ? activeModules.length : V3_TOTAL_MODULES;

  const categoryMap = new Map<number, string>(activeModules.map((m) => [m.id, m.category]));
  const totalTechnical = activeModules.length > 0
    ? activeModules.filter((m) => m.category === "technical").length
    : Object.values(V3_MODULE_CATEGORIES).filter((c) => c === "technical").length;

  // V3 binary mastery aggregation. The Verify quiz sets is_mastered=true on a
  // single row per (user_id, module_id). product_score tracks technical mastery %.
  // service_score is Arena-driven and intentionally left untouched here.
  const { data: allMastery } = await admin
    .from("scenario_mastery")
    .select("module, module_id, is_mastered, elo_rating")
    .eq("user_id", userId);

  const rows = (allMastery ?? []) as Array<{
    module: string;
    module_id: number | null;
    is_mastered: boolean;
    elo_rating: number;
  }>;

  const attemptedIds = new Set<number>();
  const masteredIds = new Set<number>();
  for (const r of rows) {
    if (r.module_id == null) continue;
    attemptedIds.add(r.module_id);
    if (r.is_mastered) masteredIds.add(r.module_id);
  }

  const totalAttempted = attemptedIds.size;
  const totalMastered = masteredIds.size;

  const avgElo = rows.length > 0
    ? Math.round(rows.reduce((s, r) => s + (r.elo_rating ?? 1200), 0) / rows.length)
    : 1200;

  // product_score = % of technical-category modules mastered
  let technicalMastered = 0;
  for (const id of masteredIds) {
    const cat = categoryMap.get(id) ?? V3_MODULE_CATEGORIES[id];
    if (cat === "technical") technicalMastered++;
  }
  const productScore = totalTechnical > 0
    ? Math.round((technicalMastered / totalTechnical) * 100)
    : 0;

  const overallProgress = Math.round((totalMastered / totalModules) * 100);

  let masteryStatus = "not-started";
  if (totalMastered >= totalModules) {
    masteryStatus = "mastered";
  } else if (totalAttempted > 0) {
    masteryStatus = "in-progress";
  }

  const updatePayload = {
    progress: overallProgress,
    elo_rating: avgElo,
    mastery_status: masteryStatus,
    scenarios_mastered: totalMastered,
    scenarios_attempted: totalAttempted,
    product_score: productScore,
    last_active_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  for (const staffRow of staffRows) {
    await admin
      .from("venue_staff")
      .update(updatePayload)
      .eq("id", staffRow.id);
  }

  // Link staff_user_id if not already set
  await admin
    .from("venue_staff")
    .update({ staff_user_id: userId })
    .ilike("email", userEmail)
    .is("staff_user_id", null)
    .then();
}
