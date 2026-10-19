/**
 * verify-quiz.ts – Server-graded module quiz (the question engine).
 *
 *   POST /api/training/verify/start  → plans a run (planRun) and stores it on
 *     a verify_attempts row; the client gets the first question only.
 *   POST /api/training/verify/answer → grades one answer against the bank
 *     (lib/question-bank.ts), works out the run's next state (advanceRun) and
 *     saves it with advance_quiz_run(), which re-checks the position under a
 *     row lock. The reply carries the next question.
 *
 * The mastery rule (Rich update, Phase 2): PASS_CORRECT right answers, in at
 * least PASS_FORMATS different formats, with no wrong answer left unanswered
 * in another form. A question answered right never comes back in the run; a
 * wrong one comes back REQUEUE_GAP questions later as a variant of the same
 * fact, when the bank has one. MAX_MISSES wrong answers end the run.
 *
 * A test-out (Rich update, Phase 5) is a short, hard run for people who
 * already know a module: no True/False, harder questions first, and
 * TEST_OUT_CORRECT right with fewer than TEST_OUT_MAX_MISSES wrong. A miss
 * brings nothing back; the run just has less room. Passing masters the
 * module, exactly like a normal run.
 *
 * Runs expire after VERIFY_ATTEMPT_TTL_MINUTES (server clock only), and each
 * answer is accepted once, at the position the server expects.
 */

import "server-only";
import type { VerifiedUser } from "@/lib/supabase-server";
import type { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { ChoiceOption, Question, QuestionFormat } from "@/lib/question-bank";
import { syncMasteryToVenueStaff } from "@/lib/mastery";
import { maybeMarkTrialActivated } from "@/lib/training-attempt";
import type { QuizAnswer, QuizCorrectAnswer, QuizGoal, QuizProgress, QuizQuestionView } from "@/lib/verify-quiz-client";

type AdminClient = ReturnType<typeof createSupabaseAdminClient>;

export const VERIFY_ATTEMPT_TTL_MINUTES = 20;
/** Starts allowed per user per module in START_WINDOW_MINUTES. */
export const MAX_STARTS_PER_WINDOW = 5;
export const START_WINDOW_MINUTES = 15;

/** Right answers needed to master a module. */
export const PASS_CORRECT = 6;
/** Different formats those answers must cover, when the module has that many. */
const PASS_FORMATS = 3;
/** The run ends on this many wrong answers. */
export const MAX_MISSES = 3;
/** Questions planned for a run, before any wrong answers bring variants back. */
const RUN_LENGTH = 12;
/** A module needs this many different facts to run a quiz. */
const MIN_CONCEPTS = 5;
/** Questions between a wrong answer and its variant coming back. */
const REQUEUE_GAP = 2;
/** A test-out asks this many questions at most. */
const TEST_OUT_LENGTH = 8;
/** Right answers a test-out needs. */
export const TEST_OUT_CORRECT = 6;
/** A test-out ends on this many wrong answers, so it allows one. */
const TEST_OUT_MAX_MISSES = 2;

/** Stored in verify_attempts.run_state. */
export type RunState = {
  /** Question ids in the order they're asked. `position` indexes into it. */
  queue: string[];
  correct: number;
  misses: number;
  /** Formats answered right at least once. */
  formats: QuestionFormat[];
  /** Concepts answered wrong whose variant hasn't been answered right yet. */
  owed: string[];
  goal: QuizGoal;
};

export type RunStatus = "active" | "passed" | "exhausted";

export type Random = () => number;

export function secureRandom(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;
}

export function shuffle<T>(items: T[], random: Random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** What a module's bank lets a run ask for. Null when it has too few questions. */
export function goalFor(questions: Question[]): QuizGoal | null {
  const concepts = new Set(questions.map((q) => q.concept)).size;
  if (concepts < MIN_CONCEPTS) return null;
  const formats = new Set(questions.map((q) => q.format)).size;
  return {
    correct: Math.min(PASS_CORRECT, concepts),
    formats: Math.min(PASS_FORMATS, formats),
    maxMisses: MAX_MISSES,
  };
}

/**
 * Picks up to `length` questions: one in each format first, then one per
 * fact. With `fill`, unused variants top the run up once every fact is in.
 */
function pickSpread(questions: Question[], length: number, fill: boolean, random: Random): Question[] {
  const byConcept = new Map<string, Question[]>();
  for (const q of shuffle(questions, random)) {
    byConcept.set(q.concept, [...(byConcept.get(q.concept) ?? []), q]);
  }

  const picked: Question[] = [];
  const usedConcepts = new Set<string>();
  const pick = (q: Question) => {
    picked.push(q);
    usedConcepts.add(q.concept);
  };

  // One question in each format first, so the format goal is reachable.
  const formats = shuffle([...new Set(questions.map((q) => q.format))], random);
  for (const format of formats) {
    const q = [...byConcept.values()].flat().find((c) => c.format === format && !usedConcepts.has(c.concept));
    if (q) pick(q);
  }
  for (const [concept, variants] of byConcept) {
    if (picked.length >= length) break;
    if (!usedConcepts.has(concept)) pick(variants[0]);
  }
  if (fill) {
    const taken = new Set(picked.map((q) => q.id));
    for (const q of [...byConcept.values()].flat()) {
      if (picked.length >= length) break;
      if (!taken.has(q.id)) pick(q);
    }
  }
  return picked.slice(0, length);
}

/** Question ids by difficulty, shuffled within each level. */
function byDifficulty(picked: Question[], hardFirst: boolean, random: Random): string[] {
  const sign = hardFirst ? -1 : 1;
  return picked
    .map((q) => ({ q, tiebreak: random() }))
    .sort((a, b) => sign * (a.q.difficulty - b.q.difficulty) || a.tiebreak - b.tiebreak)
    .map(({ q }) => q.id);
}

/**
 * Plans one run: one question per fact, so a fact is asked once unless it's
 * missed. The first picks cover as many formats as the goal needs; the rest
 * are random. Easier questions come first, shuffled within each difficulty,
 * unless the skill check showed the person knows this area (`hardFirst`).
 */
export function planRun(
  questions: Question[],
  random: Random = secureRandom,
  options: { hardFirst?: boolean } = {},
): RunState | null {
  const goal = goalFor(questions);
  if (!goal) return null;
  const queue = byDifficulty(pickSpread(questions, RUN_LENGTH, false, random), options.hardFirst === true, random);
  return { queue, correct: 0, misses: 0, formats: [], owed: [], goal };
}

/**
 * Plans a test-out: no True/False, as many different facts and formats as
 * TEST_OUT_LENGTH allows, hardest first. Null when the module doesn't have
 * enough other questions.
 */
export function planTestOut(questions: Question[], random: Random = secureRandom): RunState | null {
  if (!goalFor(questions)) return null;
  const pool = questions.filter((q) => q.format !== "true_false");
  const picked = pickSpread(pool, TEST_OUT_LENGTH, true, random);
  // Room for the one allowed miss.
  if (picked.length < TEST_OUT_CORRECT + 1) return null;
  const goal: QuizGoal = {
    correct: TEST_OUT_CORRECT,
    formats: Math.min(PASS_FORMATS, new Set(picked.map((q) => q.format)).size),
    maxMisses: TEST_OUT_MAX_MISSES,
    testOut: true,
  };
  return { queue: byDifficulty(picked, true, random), correct: 0, misses: 0, formats: [], owed: [], goal };
}

function isPassed(state: RunState): boolean {
  return state.correct >= state.goal.correct && state.formats.length >= state.goal.formats && state.owed.length === 0;
}

/**
 * The run after one graded answer at `position`. Pure: the caller saves it.
 * A wrong answer queues an unasked variant of the same fact, in a different
 * format when there is one.
 */
export function advanceRun(
  state: RunState,
  position: number,
  question: Question,
  correct: boolean,
  questions: Question[],
): { state: RunState; status: RunStatus } {
  const next: RunState = { ...state, queue: [...state.queue], formats: [...state.formats], owed: [...state.owed] };

  if (correct) {
    next.correct += 1;
    if (!next.formats.includes(question.format)) next.formats.push(question.format);
    next.owed = next.owed.filter((c) => c !== question.concept);
  } else if (state.goal.testOut) {
    next.misses += 1;
  } else {
    next.misses += 1;
    const queued = new Set(next.queue);
    const variants = questions.filter((q) => q.concept === question.concept && !queued.has(q.id));
    const variant = variants.find((q) => q.format !== question.format) ?? variants[0];
    if (variant) {
      next.queue.splice(Math.min(position + 1 + REQUEUE_GAP, next.queue.length), 0, variant.id);
      if (!next.owed.includes(question.concept)) next.owed.push(question.concept);
    }
  }

  let status: RunStatus = "active";
  if (isPassed(next)) status = "passed";
  else if (next.misses >= next.goal.maxMisses || position + 1 >= next.queue.length) status = "exhausted";
  return { state: next, status };
}

export function progressOf(state: RunState): QuizProgress {
  return {
    correct: state.correct,
    formats: state.formats.length,
    misses: state.misses,
    owed: state.owed.length,
  };
}

/** What the browser sees of a question: no answer, options shuffled. */
export function questionView(question: Question, position: number, random: Random = secureRandom): QuizQuestionView {
  const base = { position, format: question.format, prompt: question.prompt };
  switch (question.format) {
    case "true_false":
      return { ...base, options: [{ id: "true", text: "True" }, { id: "false", text: "False" }] };
    case "order_steps":
      return { ...base, steps: shuffleNotSolved(question.steps, random) };
    case "number":
      return { ...base, unit: question.unit };
    default:
      return { ...base, options: shuffle(question.options, random) };
  }
}

/** Shuffled steps that aren't already in the right order. */
function shuffleNotSolved(steps: ChoiceOption[], random: Random): ChoiceOption[] {
  if (steps.length < 2) return [...steps];
  let out = shuffle(steps, random);
  for (let tries = 0; tries < 5 && out.every((s, i) => s.id === steps[i].id); tries++) out = shuffle(steps, random);
  if (out.every((s, i) => s.id === steps[i].id)) out = [...steps.slice(1), steps[0]];
  return out;
}

/** An option id, up to 12 step ids, or a number. The question decides which is right. */
export function isAnswerShape(value: unknown): value is QuizAnswer {
  if (typeof value === "string") return value.length > 0 && value.length <= 32;
  if (typeof value === "number") return Number.isFinite(value) && Math.abs(value) < 1_000_000;
  return Array.isArray(value) && value.length > 0 && value.length <= 12
    && value.every((id) => typeof id === "string" && id.length > 0 && id.length <= 32);
}

/** True when the answer has the right shape for the question's format. */
export function answerFits(question: Question, answer: QuizAnswer): boolean {
  switch (question.format) {
    case "true_false":
      return answer === "true" || answer === "false";
    case "order_steps": {
      if (!Array.isArray(answer) || answer.length !== question.steps.length) return false;
      const ids = new Set(question.steps.map((s) => s.id));
      return new Set(answer).size === answer.length && answer.every((id) => ids.has(id));
    }
    case "number":
      return typeof answer === "number" && Number.isFinite(answer);
    default:
      return typeof answer === "string" && question.options.some((o) => o.id === answer);
  }
}

export type GradedAnswer = {
  correct: boolean;
  correctAnswer: QuizCorrectAnswer;
  explanation: string;
};

/** Grades an answer that fits the question (check answerFits first). */
export function gradeAnswer(question: Question, answer: QuizAnswer): GradedAnswer {
  const explanation = question.explanation;
  switch (question.format) {
    case "order_steps": {
      const ids = question.steps.map((s) => s.id);
      return { correct: Array.isArray(answer) && ids.every((id, i) => answer[i] === id), correctAnswer: ids, explanation };
    }
    case "number":
      return {
        correct: typeof answer === "number" && Math.abs(answer - question.answer) <= question.tolerance + 1e-9,
        correctAnswer: question.answer,
        explanation,
      };
    default:
      return { correct: answer === question.answer, correctAnswer: question.answer, explanation };
  }
}

/**
 * Follow-up after a quiz run masters a module: manager roster sync, trial
 * activation, and the one-time SBE Elite number.
 */
export async function afterModuleMastered(admin: AdminClient, user: VerifiedUser, alreadyMastered: boolean): Promise<void> {
  await syncMasteryToVenueStaff(admin, user.id);
  if (user.email) {
    await maybeMarkTrialActivated(admin, user.email);
  }

  // SBE Elite: same rule the badge itself shows (lib/badges.ts) — verify
  // quizzes passed for at least 80% of modules. Arena passes don't count.
  // Numbers are assigned once, in order, by award_sbe_elite(). This used to
  // fire at any 20 mastered rows (Arena included) and always store #1
  // (audit 2026-09-30, M5).
  if (alreadyMastered) return;

  const [{ count: quizMastered }, { count: totalModules }] = await Promise.all([
    admin
      .from("scenario_mastery")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("scenario_type", "quiz")
      .eq("is_mastered", true)
      .is("archived_at", null),
    admin.from("modules").select("id", { count: "exact", head: true }),
  ]);

  if ((quizMastered ?? 0) >= eliteThreshold(totalModules ?? 0)) {
    const { error } = await admin.rpc("award_sbe_elite", { p_user_id: user.id });
    if (error) console.error("award_sbe_elite failed:", error.message);
  }
}

/** Verify quizzes needed for SBE Elite: 80% of modules, rounded up (matches lib/badges.ts). */
export function eliteThreshold(totalModules: number): number {
  return Math.max(1, Math.ceil(totalModules * 0.8));
}

/**
 * One structured line per refused quiz request, so anyone scripting against
 * the quiz shows up in the Workers logs. Never logs answers.
 */
export function logVerifyRejection(event: "verify_start_rejected" | "verify_answer_rejected", reason: string, userId: string, moduleId: number | null, ip: string): void {
  console.warn(JSON.stringify({ event, reason, userId, moduleId, ip }));
}
