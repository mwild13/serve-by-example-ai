/**
 * scoring.ts – applicant test scores (docs/APPLICANT_TESTING.md §4).
 *
 * Every item scores 0 to 100. Quiz questions are right or wrong; an ordering
 * task gets part marks for steps near their place; written scenarios and the
 * Live Guest bring their own score. A section is the average of its items,
 * and the overall score weighs the sections by SECTIONS[].weight, leaving out
 * any section with nothing scored yet.
 *
 * Pure.
 */

import { SECTIONS, type SectionId } from "@/lib/applicant/blueprint";
import type { Question } from "@/lib/question-bank";
import { gradeAnswer } from "@/lib/verify-quiz";
import type { QuizAnswer } from "@/lib/verify-quiz-client";

/**
 * 100 for the right order, 0 for the furthest from it. Each step loses marks
 * for how far it sits from its place, so swapping two neighbours costs little.
 * Anything that isn't a full set of the steps scores 0.
 */
export function orderScore(correctIds: string[], given: unknown): number {
  const n = correctIds.length;
  if (!Array.isArray(given) || given.length !== n || n === 0) return 0;
  if (new Set(given).size !== n || !given.every((id) => typeof id === "string" && correctIds.includes(id))) return 0;
  if (n === 1) return 100;
  const distance = correctIds.reduce((sum, id, i) => sum + Math.abs(given.indexOf(id) - i), 0);
  // The most a set of n steps can be out: the full reverse.
  const worst = Math.floor((n * n) / 2);
  return Math.round(100 * (1 - distance / worst));
}

export type QuizItemScore = { score: number; correct: boolean };

export function scoreQuizItem(question: Question, answer: QuizAnswer): QuizItemScore {
  if (question.format === "order_steps") {
    const score = orderScore(question.steps.map((s) => s.id), answer);
    return { score, correct: score === 100 };
  }
  const { correct } = gradeAnswer(question, answer);
  return { score: correct ? 100 : 0, correct };
}

export type ScoredItem = { section: SectionId; score: number | null };

export type SectionScores = Record<SectionId, number | null>;

export function sectionScores(items: ScoredItem[]): SectionScores {
  const out = {} as SectionScores;
  for (const { id } of SECTIONS) {
    const scores = items.filter((i) => i.section === id && i.score !== null).map((i) => i.score as number);
    out[id] = scores.length === 0 ? null : Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }
  return out;
}

export function overallScore(sections: SectionScores): number | null {
  let weighted = 0;
  let weights = 0;
  for (const { id, weight } of SECTIONS) {
    const score = sections[id];
    if (score === null) continue;
    weighted += score * weight;
    weights += weight;
  }
  return weights === 0 ? null : Math.round(weighted / weights);
}

export type Band = "Strong" | "Solid" | "Developing" | "Not yet";

export const BAND_FLOORS: { band: Band; min: number }[] = [
  { band: "Strong", min: 80 },
  { band: "Solid", min: 65 },
  { band: "Developing", min: 50 },
  { band: "Not yet", min: 0 },
];

export function bandFor(score: number): Band {
  return (BAND_FLOORS.find((b) => score >= b.min) ?? BAND_FLOORS[BAND_FLOORS.length - 1]).band;
}
