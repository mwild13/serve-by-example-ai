/**
 * verify-quiz.ts – Server-graded module verification quiz.
 *
 * The quiz used to run entirely in the browser: the answer key shipped in the
 * bundle, and /api/training/save trusted the list of "correct" answers the
 * client posted (audit 2026-09-30, C4). Now:
 *
 *   POST /api/training/verify/start  → a verify_attempts row holding the
 *     question order; the client gets the prompts only.
 *   POST /api/training/verify/answer → grades one answer against the key
 *     below, and advance_verify_attempt() moves the streak on. The streak
 *     lives in the database, so the client can't claim one. Reaching
 *     VERIFY_STREAK_REQUIRED in a row masters the module, once per attempt.
 *
 * Attempts expire after VERIFY_ATTEMPT_TTL_MINUTES (server clock only), and
 * each answer is accepted once, at the position the server expects.
 */

import "server-only";
import type { User } from "@supabase/supabase-js";
import type { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { VERIFY_QUESTIONS } from "@/lib/verify-questions";
import { syncMasteryToVenueStaff } from "@/lib/mastery";
import { maybeMarkTrialActivated } from "@/lib/training-attempt";

type AdminClient = ReturnType<typeof createSupabaseAdminClient>;

/** Correct answers in a row needed to master a module (what both clients always asked for). */
export const VERIFY_STREAK_REQUIRED = 5;
export const VERIFY_ATTEMPT_TTL_MINUTES = 20;
/** Shuffled passes through the question bank per attempt. */
const ROUNDS = 3;
/** Starts allowed per user per module in START_WINDOW_MINUTES. */
export const MAX_STARTS_PER_WINDOW = 5;
export const START_WINDOW_MINUTES = 15;

export type VerifyAnswer = "true" | "false";

export function questionCount(moduleId: number): number {
  return VERIFY_QUESTIONS[moduleId]?.length ?? 0;
}

export function questionPrompt(moduleId: number, questionIndex: number): string | null {
  return VERIFY_QUESTIONS[moduleId]?.[questionIndex]?.prompt ?? null;
}

/**
 * Question indexes for one attempt: ROUNDS shuffled passes through the bank,
 * swapping so a question never appears twice in a row across a round
 * boundary (same as the old client-side RapidFireQuiz pool).
 */
export function buildQuestionOrder(count: number, random: () => number = secureRandom): number[] {
  if (count <= 0) return [];
  const order: number[] = [];
  for (let round = 0; round < ROUNDS; round++) {
    const pass = Array.from({ length: count }, (_, i) => i);
    for (let i = pass.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [pass[i], pass[j]] = [pass[j], pass[i]];
    }
    if (order.length > 0 && pass.length > 1 && pass[0] === order[order.length - 1]) {
      [pass[0], pass[1]] = [pass[1], pass[0]];
    }
    order.push(...pass);
  }
  return order;
}

function secureRandom(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;
}

export type GradedAnswer = {
  correct: boolean;
  correctAnswer: VerifyAnswer;
  explanation: string;
};

/** Null when the module or question doesn't exist. */
export function gradeAnswer(moduleId: number, questionIndex: number, answer: VerifyAnswer): GradedAnswer | null {
  const question = VERIFY_QUESTIONS[moduleId]?.[questionIndex];
  if (!question) return null;
  return {
    correct: question.answer === answer,
    correctAnswer: question.answer,
    explanation: question.explanation,
  };
}

/**
 * Follow-up after a quiz run masters a module: manager roster sync, trial
 * activation, and the one-time SBE Elite badge.
 */
export async function afterModuleMastered(admin: AdminClient, user: User, alreadyMastered: boolean): Promise<void> {
  await syncMasteryToVenueStaff(admin, user.id);
  if (user.email) {
    await maybeMarkTrialActivated(admin, user.email);
  }

  // SBE Elite badge: only on a fresh mastery, once per lifetime. The 20-row
  // threshold and fixed badge number are audit item M5 (Phase 5).
  if (alreadyMastered) return;
  const { data: profile } = await admin
    .from("profiles")
    .select("all_modules_completed")
    .eq("id", user.id)
    .single();
  if (!profile || profile.all_modules_completed) return;

  const { count } = await admin
    .from("scenario_mastery")
    .select("module_id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_mastered", true)
    .is("archived_at", null);

  if ((count ?? 0) >= 20) {
    await admin
      .from("profiles")
      .update({ sbe_elite_number: 1, all_modules_completed: true })
      .eq("id", user.id);
  }
}

/**
 * One structured line per refused quiz request, so anyone scripting against
 * the quiz shows up in the Workers logs. Never logs answers.
 */
export function logVerifyRejection(event: "verify_start_rejected" | "verify_answer_rejected", reason: string, userId: string, moduleId: number | null, ip: string): void {
  console.warn(JSON.stringify({ event, reason, userId, moduleId, ip }));
}
