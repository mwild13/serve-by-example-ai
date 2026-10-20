/**
 * drill.ts – Mixed drills (Rich update, Phase 10).
 *
 * A drill is DRILL_LENGTH questions mixed from the modules a person has
 * started or mastered, at full difficulty: no True/False where a module has
 * other questions, and the hardest variant of each fact first. Questions are
 * dealt in turns across up to MAX_DRILL_MODULES modules, so two in a row
 * never come from the same module, and none repeats from the previous drill
 * while there are others to ask.
 *
 * A drill asks every question and never masters a module: it's practice.
 *
 * Venue content (Rich update, Phase 11): questions a venue's manager has
 * approved come in as one more source, VENUE_MODULE_ID, newest first. It is
 * always in the drill when it has questions, so an item added in the evening
 * reaches staff in their next drill.
 *
 *   POST /api/training/drill/start  → plans a drill (planDrill) and stores it
 *     on a drill_runs row; the client gets the first question only.
 *   POST /api/training/drill/answer → grades one answer with the module quiz's
 *     grader (lib/verify-quiz.ts) and saves the drill's next state
 *     (advanceDrill). The last reply carries the summary (drillSummary).
 */

import "server-only";
import type { Question } from "@/lib/question-bank";
import { secureRandom, shuffle, type Random } from "@/lib/verify-quiz";
import type { DrillSummary, QuizGoal, QuizProgress } from "@/lib/verify-quiz-client";

/** Questions in a drill. */
export const DRILL_LENGTH = 10;
/** A drill needs questions from at least this many modules. */
export const MIN_DRILL_MODULES = 3;
/** Most modules one drill mixes, so each gets two or more questions. */
const MAX_DRILL_MODULES = 5;
export const DRILL_TTL_MINUTES = 20;
/** Drills allowed per user in DRILL_START_WINDOW_MINUTES. */
export const MAX_DRILL_STARTS_PER_WINDOW = 5;
export const DRILL_START_WINDOW_MINUTES = 15;

/** The "module" id venue content questions are filed under in a drill. */
export const VENUE_MODULE_ID = 0;

/**
 * One source's live questions. `priority` puts it in every drill and keeps
 * its questions in the order given (venue content, newest first).
 */
export type DrillModule = { moduleId: number; questions: Question[]; priority?: boolean };

/** Stored in drill_runs.run_state. */
export type DrillState = {
  /** "<module id>:<question id>", in the order they're asked. */
  queue: string[];
  /** Module titles by id, for the questions and the summary. */
  titles: Record<string, string>;
  /** One entry per answer, in order. */
  results: { module: number; correct: boolean }[];
};

export type DrillStatus = "active" | "finished";

export function drillQuestionId(moduleId: number, questionId: string): string {
  return `${moduleId}:${questionId}`;
}

export function parseDrillQuestionId(id: string): { moduleId: number; questionId: string } | null {
  const at = id.indexOf(":");
  if (at < 1) return null;
  const moduleId = Number(id.slice(0, at));
  const questionId = id.slice(at + 1);
  if (!Number.isInteger(moduleId) || moduleId < VENUE_MODULE_ID || questionId === "") return null;
  return { moduleId, questionId };
}

/**
 * What one module can give a drill: one question per fact, none from
 * `exclude`, the hardest first (or in the given order, for a priority
 * source). True/False only when nothing else is left.
 */
function drillPool(module: DrillModule, exclude: ReadonlySet<string>, random: Random): Question[] {
  const fresh = module.questions.filter((q) => !exclude.has(drillQuestionId(module.moduleId, q.id)));
  const harder = fresh.filter((q) => q.format !== "true_false");
  const source = harder.length > 0 ? harder : fresh;
  const ordered = module.priority ? source : shuffle(source, random).sort((a, b) => b.difficulty - a.difficulty);
  const seen = new Set<string>();
  return ordered
    .filter((q) => {
      if (seen.has(q.concept)) return false;
      seen.add(q.concept);
      return true;
    });
}

/**
 * Plans one drill. Null when fewer than MIN_DRILL_MODULES modules have a
 * question to give once `exclude` (the previous drill's questions) is left
 * out; the caller can then try again without it.
 */
export function planDrill(
  modules: DrillModule[],
  exclude: ReadonlySet<string> = new Set(),
  random: Random = secureRandom,
): string[] | null {
  const pools = modules
    .map((m) => ({ moduleId: m.moduleId, pool: drillPool(m, exclude, random) }))
    .filter((p) => p.pool.length > 0);
  if (pools.length < MIN_DRILL_MODULES) return null;

  const priority = pools.filter((p) => modules.find((m) => m.moduleId === p.moduleId)?.priority);
  const others = shuffle(pools.filter((p) => !priority.includes(p)), random);
  const chosen = [...priority, ...others].slice(0, MAX_DRILL_MODULES);
  const queue: string[] = [];
  let last: number | null = null;
  for (let round = 0; queue.length < DRILL_LENGTH; round++) {
    const order = shuffle(chosen.filter((p) => p.pool.length > round), random);
    if (order.length === 0) break;
    // The new round mustn't start with the module that ended the last one.
    if (order.length > 1 && order[0].moduleId === last) [order[0], order[1]] = [order[1], order[0]];
    for (const p of order) {
      if (queue.length >= DRILL_LENGTH) break;
      if (p.moduleId === last) continue;
      queue.push(drillQuestionId(p.moduleId, p.pool[round].id));
      last = p.moduleId;
    }
  }
  return queue;
}

/** The drill after one graded answer at `position`. Pure: the caller saves it. */
export function advanceDrill(
  state: DrillState,
  position: number,
  moduleId: number,
  correct: boolean,
): { state: DrillState; status: DrillStatus } {
  const next: DrillState = { ...state, results: [...state.results, { module: moduleId, correct }] };
  return { state: next, status: position + 1 >= state.queue.length ? "finished" : "active" };
}

/** A drill's goal, shaped like a quiz run's so QuizRun can show it. */
export function drillGoal(state: DrillState): QuizGoal {
  return { correct: state.queue.length, formats: 0, maxMisses: state.queue.length + 1, drill: true };
}

export function drillProgress(state: DrillState): QuizProgress {
  const correct = state.results.filter((r) => r.correct).length;
  return { correct, formats: 0, misses: state.results.length - correct, owed: 0 };
}

export function drillSummary(state: DrillState): DrillSummary {
  const byModule = new Map<number, { correct: number; total: number }>();
  for (const id of state.queue) {
    const parsed = parseDrillQuestionId(id);
    if (parsed && !byModule.has(parsed.moduleId)) byModule.set(parsed.moduleId, { correct: 0, total: 0 });
  }
  for (const r of state.results) {
    const entry = byModule.get(r.module);
    if (!entry) continue;
    entry.total += 1;
    if (r.correct) entry.correct += 1;
  }
  return {
    correct: state.results.filter((r) => r.correct).length,
    total: state.results.length,
    modules: [...byModule].map(([moduleId, counts]) => ({
      moduleId,
      title: state.titles[String(moduleId)] ?? `Module ${moduleId}`,
      ...counts,
    })),
  };
}
