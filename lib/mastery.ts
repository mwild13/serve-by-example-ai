/**
 * mastery.ts – Mastery Engine service layer
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
 * Fallback only — syncMasteryToVenueStaff() prefers the live count from
 * the modules table. Platform has 40 modules (see lib/verify-questions.ts).
 */
const V3_TOTAL_MODULES = 40;

/**
 * V3: Module category mapping. Mirrors supabase/migrations/20260421_1_create_modules.sql
 * plus the modules 21-40 added in lib/module-navigator.ts's default catalog.
 * Used by the Manager dashboard StaffBadges to compute category mastery.
 * Fallback only — syncMasteryToVenueStaff() prefers live categories from the modules table.
 */
const V3_MODULE_CATEGORIES: Record<number, "technical" | "service" | "compliance"> = {
  1: "technical", 2: "technical", 3: "technical", 4: "technical",
  5: "technical", 6: "technical", 7: "technical",
  8: "service", 9: "service", 10: "service", 11: "service",
  12: "service", 13: "service", 14: "service",
  15: "compliance", 16: "compliance", 17: "compliance",
  18: "compliance", 19: "compliance", 20: "compliance",
  21: "compliance", 22: "compliance", 23: "service", 24: "compliance",
  25: "compliance", 26: "technical", 27: "technical", 28: "technical",
  29: "service", 30: "service", 31: "compliance", 32: "technical",
  33: "technical", 34: "technical", 35: "compliance", 36: "service",
  37: "service", 38: "service", 39: "technical", 40: "service",
};

const MASTERY_THRESHOLD = 3; // consecutive correct for mastery
const SPAM_GUARD_MINUTES = 60; // min gap between mastery-advancing attempts on same scenario
const ELO_K = 32; // Elo sensitivity factor
const PASS_SCORE = 15; // out of 25 – threshold for "correct"

export type ConfidenceLevel = "low" | "medium" | "high";

/**
 * scenario_mastery's real key is (user_id, module, scenario_type, scenario_index) —
 * see supabase/migrations/20260820_scenario_mastery_scenario_type.sql. Quiz
 * (markModuleMastered) always writes scenario_index=0; Arena roleplay
 * (recordAttempt) always writes scenario_index=40; Scenario Training
 * (recordAttempt, descriptor) writes the real trainer-data.ts content index.
 * Without scenario_type, Quiz and the first Scenario Training scenario for
 * modules 1-3 collide on the same (user, module, 0) row.
 */
export type ScenarioType = "quiz" | "descriptor" | "roleplay";

export type MasteryRow = {
  id: string;
  user_id: string;
  module: string;
  scenario_type: ScenarioType;
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
  /** Completion % – distinct scenarios at mastery_level >= 1 / total */
  completion: number;
  /** Mastery % – distinct scenarios at mastery_level == 3 / total */
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
  scenarioType: ScenarioType;
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
  /**
   * "quiz" never goes through recordAttempt() — that write path is
   * markModuleMastered() only. recordAttempt() callers are Scenario
   * Training (descriptor) and AI Arena (roleplay).
   */
  scenarioType: Exclude<ScenarioType, "quiz">;
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

// Reverse of moduleIdToString() — resolves a scenario_mastery `module`
// string back to its numeric catalog id. Used by consumers (Phase 5,
// v4-migration-plan/00-bug-batch-plan.md item 11) that need to look up real
// module metadata (title, category) from the `modules` table/allModules for
// Quiz and Arena roleplay rows, where the numeric id genuinely identifies
// matching catalog content. NOT safe to use for resolving a title for
// "descriptor" (Scenario Training) rows on modules 1-3 — LEGACY_MODULE_NAMES
// only exists so those legacy string rows can reuse the numeric catalog's
// access-gate plumbing (see LEGACY_MODULE_ID in training/save/route.ts); the
// catalog content actually sitting at ids 1/2/3 ("Beer Pouring",
// "Wine Service", "Cocktail Fundamentals") is unrelated to the
// Scenario Training content shown under the "sales"/"management" labels.
const LEGACY_MODULE_IDS: Record<string, number> = { bartending: 1, sales: 2, management: 3 };

export function moduleStringToId(moduleStr: string): number | null {
  if (moduleStr in LEGACY_MODULE_IDS) return LEGACY_MODULE_IDS[moduleStr];
  const match = /^module_(\d+)$/.exec(moduleStr);
  return match ? Number(match[1]) : null;
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
  const { userId, scenarioType, scenarioIndex, overallScore, confidence } = input;

  // Resolve module string – if moduleId is provided, derive from it
  const moduleName = input.moduleId
    ? moduleIdToString(input.moduleId)
    : input.module;
  const moduleId = input.moduleId ?? null;

  const isCorrect = overallScore >= PASS_SCORE;
  const now = new Date();

  // Fetch existing mastery row — scoped to scenario_type so a Scenario
  // Training (descriptor) attempt at index 0 never reads/overwrites the
  // Quiz-mastery row that also lives at (user, module, index 0).
  // archived_at IS NULL — an archived row (soft-deleted by "reset progress")
  // is treated as not existing, so a fresh attempt starts clean instead of
  // resuming stale mastery_level/elo/streak state. The upsert below still
  // resurrects the same physical row via its unique key, but with
  // archived_at reset to NULL and every value overwritten fresh.
  const { data: existing } = await admin
    .from("scenario_mastery")
    .select("*")
    .eq("user_id", userId)
    .eq("module", moduleName)
    .eq("scenario_type", scenarioType)
    .eq("scenario_index", scenarioIndex)
    .is("archived_at", null)
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

  const upsertPayload: Record<string, unknown> = {
    user_id: userId,
    module: moduleName,
    module_id: moduleId,
    scenario_type: scenarioType,
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
    // Reactivate — see the archived_at note on the `existing` read above.
    archived_at: null,
  };

  // Roleplay (Arena) mirrors the Quiz gate: a pass sets is_mastered=true as
  // a sticky flag that a later fail never reverses — same one-directional
  // semantics as markModuleMastered(). syncMasteryToVenueStaff() reads this
  // on scenario_index=40 rows for the 20% Arena slice of service_score.
  // On a fail we omit the key entirely (not set it false) so upsert leaves
  // any existing true value untouched, rather than clobbering a past pass.
  if (scenarioType === "roleplay" && isCorrect) {
    upsertPayload.is_mastered = true;
  }

  await admin.from("scenario_mastery").upsert(upsertPayload, {
    onConflict: "user_id,module,scenario_type,scenario_index",
  });

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

  // archived_at IS NULL — see the same note in recordAttempt() above.
  const { data: existing } = await admin
    .from("scenario_mastery")
    .select("is_mastered, total_attempts")
    .eq("user_id", userId)
    .eq("module", moduleName)
    .eq("scenario_type", "quiz")
    .eq("scenario_index", 0)
    .is("archived_at", null)
    .maybeSingle();

  const alreadyMastered = Boolean(existing?.is_mastered);
  const totalAttempts = (existing?.total_attempts ?? 0) + 1;
  const overallScore = Math.min(consecutiveCorrect * 5, 25);

  await admin.from("scenario_mastery").upsert(
    {
      user_id: userId,
      module: moduleName,
      module_id: moduleId,
      scenario_type: "quiz",
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
      // Reactivate — see the archived_at note on the `existing` read above.
      archived_at: null,
    },
    { onConflict: "user_id,module,scenario_type,scenario_index" },
  );

  return { isMastered: true, alreadyMastered };
}

// ── Get mastery progress for a module ────────────────────────

export async function getMasteryProgress(
  admin: SupabaseClient,
  userId: string,
  module: string,
  scenarioType: ScenarioType,
): Promise<MasteryProgress> {
  const { data: rows } = await admin
    .from("scenario_mastery")
    .select("mastery_level, total_attempts, total_score_points, elo_rating")
    .eq("user_id", userId)
    .eq("module", module)
    .eq("scenario_type", scenarioType)
    .is("archived_at", null);

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

  // Not filtered by scenario_type — a review row can be Quiz, Scenario
  // Training, or Arena content; scenario_type is returned so callers (e.g.
  // ProgressScreen's "Up Next For Review" labels, Phase 5) can branch the
  // display text per type instead of assuming every row is descriptor
  // content.
  let query = admin
    .from("scenario_mastery")
    .select("module, scenario_type, scenario_index, mastery_level, next_review_at, last_score, consecutive_fails")
    .eq("user_id", userId)
    .is("archived_at", null)
    .lte("next_review_at", now)
    .order("next_review_at", { ascending: true })
    .limit(20);

  if (module) {
    query = query.eq("module", module);
  }

  const { data: rows } = await query;

  return (rows ?? []).map((r) => ({
    module: r.module as string,
    scenarioType: r.scenario_type as ScenarioType,
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
    .is("archived_at", null)
    .order("scenario_index", { ascending: true });

  return (data ?? []) as MasteryRow[];
}

// ── Category-average mastery rollup ──────────────────────────
//
// Phase 4 (v4-migration-plan/00-bug-batch-plan.md, item 10). Averages
// moduleProgress[m.id].mastery across every module in `allModules` matching
// `category`, defaulting to 0 when the category has no modules. This was
// hand-duplicated 3x on desktop (ProgressOverview.tsx::catAvg(),
// PreShiftHome.tsx::getCategoryMastery(), BadgesView.tsx::catAvg()) and NOT
// implemented server-side at all — GET /api/training/progress's legacy
// `mastery: {bartending, sales, management}` field was actually
// getMasteryProgress() run per legacy-string-module, a different and
// unrelated calculation that happened to share a field name. New callers
// (mobile or desktop) should read this helper — or the `mastery` field on
// GET /api/training/progress, which now calls it — rather than
// re-deriving the average locally a 4th time.
export function categoryMasteryAverage(
  allModules: { id: number; category: string }[],
  moduleProgress: Record<number, { mastery: number }>,
  category: string,
): number {
  const mods = allModules.filter((m) => m.category === category);
  if (mods.length === 0) return 0;
  const avg = mods.reduce((sum, m) => sum + (moduleProgress[m.id]?.mastery ?? 0), 0) / mods.length;
  return Math.round(avg);
}

// ── Per-scenario_type module mastery (Phase 3c, mobile bug-fix plan) ────
//
// GET /api/training/progress's own `moduleProgress[mod.id].mastery` blends
// every scenario_type recorded against a module_id together — a module's
// quiz row (scenario_index=0) and its Arena roleplay row (scenario_index=40)
// both land in the same module_id bucket and get averaged as one number.
// That's the right shape for the single top-level ring per category, but
// not precise enough for the Me page's "Modules"/"AI Scenarios" sub-bars,
// which need quiz and roleplay told apart. This isolates one scenario_type
// at a time, in the same shape categoryMasteryAverage() already expects, so
// callers compose it the same way: categoryMasteryAverage(allModules,
// moduleMasteryByType(rows, allModules, counts, "quiz"), category).
//
// The third sub-bar, "Scenarios" (Category Simulations), isn't computed
// here — it's legacy-string-keyed (trainer-data.ts's 3-module bank, not
// module_id), already covered by the existing per-legacy-module
// getMasteryProgress(admin, userId, module, "descriptor") call every caller
// of GET /api/training/progress already makes for masteryByModule.
export function moduleMasteryByType(
  rows: Array<{ module_id: number | null; scenario_type?: ScenarioType | null; mastery_level: number; is_mastered?: boolean | null }>,
  allModules: { id: number }[],
  scenarioCounts: Record<string, number>,
  type: ScenarioType,
): Record<number, { mastery: number }> {
  const byModuleId: Record<number, typeof rows> = {};
  for (const row of rows) {
    if (row.module_id == null || row.scenario_type !== type) continue;
    (byModuleId[row.module_id] ??= []).push(row);
  }

  const result: Record<number, { mastery: number }> = {};
  for (const mod of allModules) {
    const modRows = byModuleId[mod.id] ?? [];
    const mastered = modRows.filter((r) => r.mastery_level >= 3).length;
    const hasVerified = modRows.some((r) => r.is_mastered === true);
    const scenarioTotal = scenarioCounts[`module_${mod.id}`] ?? 10;
    result[mod.id] = {
      mastery: hasVerified ? 100 : modRows.length > 0 ? Math.round((mastered / scenarioTotal) * 100) : 0,
    };
  }
  return result;
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

  // V3 binary mastery aggregation.
  // scenario_index=0 rows: set is_mastered=true by ModuleVerify (quiz gate).
  // scenario_index=40 rows: set is_mastered=true by Arena roleplay (service gate).
  // service_score = 80% quiz mastery + 20% roleplay mastery.
  const { data: allMastery } = await admin
    .from("scenario_mastery")
    .select("module, module_id, scenario_index, is_mastered, elo_rating, high_confidence_incorrect, low_confidence_correct")
    .eq("user_id", userId)
    .is("archived_at", null);

  const rows = (allMastery ?? []) as Array<{
    module: string;
    module_id: number | null;
    scenario_index: number;
    is_mastered: boolean;
    elo_rating: number;
    high_confidence_incorrect: number | null;
    low_confidence_correct: number | null;
  }>;

  const attemptedIds = new Set<number>();
  const masteredIds = new Set<number>();       // quiz mastered (scenario_index = 0)
  const roleplayMasteredIds = new Set<number>(); // Arena passed (scenario_index = 40)
  let totalHighConfidenceIncorrect = 0;
  let totalLowConfidenceCorrect = 0;
  for (const r of rows) {
    if (r.module_id == null) continue;
    attemptedIds.add(r.module_id);
    if (r.scenario_index === 0 && r.is_mastered) masteredIds.add(r.module_id);
    if (r.scenario_index === 40 && r.is_mastered) roleplayMasteredIds.add(r.module_id);
    totalHighConfidenceIncorrect += r.high_confidence_incorrect ?? 0;
    totalLowConfidenceCorrect += r.low_confidence_correct ?? 0;
  }

  // "Confidence Mismatch" signal for the manager console (Overview KPI tile,
  // Predictive/Skill-Gaps panels): what fraction of confidence-tagged
  // attempts were a high-confidence wrong answer vs. a low-confidence right
  // one. Only high_confidence_incorrect/low_confidence_correct are counted
  // (matches recordAttempt()'s own confidence-accuracy buckets, see
  // classifyConfidenceAccuracy above) — undefined when the user has no
  // confidence-tagged attempts yet, rather than a misleading 0.
  const confidenceMismatchTotal = totalHighConfidenceIncorrect + totalLowConfidenceCorrect;
  const highConfidenceIncorrectRatio = confidenceMismatchTotal > 0
    ? totalHighConfidenceIncorrect / confidenceMismatchTotal
    : undefined;

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
  const roleplayProgress = Math.round((roleplayMasteredIds.size / totalModules) * 100);
  // Weighted service score: 80% from quiz mastery, 20% from Arena roleplay completion
  const computedServiceScore = Math.round(overallProgress * 0.8 + roleplayProgress * 0.2);

  let masteryStatus = "not-started";
  if (totalMastered >= totalModules) {
    masteryStatus = "mastered";
  } else if (totalAttempted > 0) {
    masteryStatus = "in-progress";
  }

  // Completion percentage: scenarios attempted / (total modules * estimated scenarios per module)
  const estimatedTotalScenarios = totalModules * 10; // ~10 scenarios per module on average
  const completionPct = estimatedTotalScenarios > 0
    ? Math.round((totalAttempted / estimatedTotalScenarios) * 100)
    : 0;

  const updatePayload = {
    progress: overallProgress,
    elo_rating: avgElo,
    mastery_status: masteryStatus,
    scenarios_mastered: totalMastered,
    scenarios_attempted: totalAttempted,
    product_score: productScore,
    service_score: computedServiceScore,
    module_completion_pct: completionPct,
    module_mastery_pct: overallProgress,
    avg_module_elo: avgElo,
    last_active_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...(highConfidenceIncorrectRatio !== undefined ? { high_confidence_incorrect_ratio: highConfidenceIncorrectRatio } : {}),
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
