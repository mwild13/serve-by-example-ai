// The module quiz question bank. Server-only, like the answer key it holds:
// graded by /api/training/verify/answer and never shipped to the browser.
// The build fails if a client component imports this file.
//
// Every module starts with its True/False statements from
// lib/verify-questions.ts, so no module is ever empty. Questions in the other
// formats are added per module in lib/questions/, and only go live once the
// owner has reviewed them (`reviewed: true`). See docs/MASTERY_ENGINE.md.
import "server-only";
import { VERIFY_QUESTIONS } from "@/lib/verify-questions";
import { MODULE_1_QUESTIONS } from "@/lib/questions/module-01";
import { MODULE_2_QUESTIONS } from "@/lib/questions/module-02";
import { MODULE_3_QUESTIONS } from "@/lib/questions/module-03";
import { MODULE_4_QUESTIONS } from "@/lib/questions/module-04";
import { MODULE_5_QUESTIONS } from "@/lib/questions/module-05";
import { MODULE_6_QUESTIONS } from "@/lib/questions/module-06";
import { MODULE_7_QUESTIONS } from "@/lib/questions/module-07";
import { MODULE_26_QUESTIONS } from "@/lib/questions/module-26";
import { MODULE_27_QUESTIONS } from "@/lib/questions/module-27";
import { MODULE_28_QUESTIONS } from "@/lib/questions/module-28";
import { MODULE_32_QUESTIONS } from "@/lib/questions/module-32";
import { MODULE_33_QUESTIONS } from "@/lib/questions/module-33";
import { MODULE_34_QUESTIONS } from "@/lib/questions/module-34";
import { MODULE_39_QUESTIONS } from "@/lib/questions/module-39";
import type { QuizFormat, QuizOption } from "@/lib/verify-quiz-client";

export type QuestionFormat = QuizFormat;

/** Picture questions stay off until the image library exists (Rich update, Phase 9). */
const PICTURE_QUESTIONS_ENABLED = false;

type QuestionBase = {
  /** Stable within a module. Runs store ids, so never reuse one for a different question. */
  id: string;
  /** The fact being tested. Questions on the same fact are variants of each other. */
  concept: string;
  /** 1 easiest to 3 hardest. Easier questions come first in a run. */
  difficulty: 1 | 2 | 3;
  explanation: string;
  /** Owner has checked it. Unreviewed questions are never asked. */
  reviewed: boolean;
  /** A short brief for the picture this question needs. Set means it's a picture question. */
  image?: string;
};

export type ChoiceOption = QuizOption;

type TrueFalseQuestion = QuestionBase & {
  format: "true_false";
  prompt: string;
  answer: "true" | "false";
};

export type ChoiceQuestion = QuestionBase & {
  format: "best_line" | "multiple_choice" | "spot_mistake" | "which_glass";
  prompt: string;
  options: ChoiceOption[];
  /** Id of the right option. */
  answer: string;
};

type OrderQuestion = QuestionBase & {
  format: "order_steps";
  prompt: string;
  /** In the right order. Shown shuffled. */
  steps: ChoiceOption[];
};

export type NumberQuestion = QuestionBase & {
  format: "number";
  prompt: string;
  unit: string;
  answer: number;
  /** How far off an answer can be and still count. 0 means exact. */
  tolerance: number;
};

export type Question = TrueFalseQuestion | ChoiceQuestion | OrderQuestion | NumberQuestion;

/** Questions in a format other than True/False, by module. */
const EXTRA_QUESTIONS: Record<number, Question[]> = {
  1: MODULE_1_QUESTIONS,
  2: MODULE_2_QUESTIONS,
  3: MODULE_3_QUESTIONS,
  4: MODULE_4_QUESTIONS,
  5: MODULE_5_QUESTIONS,
  6: MODULE_6_QUESTIONS,
  7: MODULE_7_QUESTIONS,
  26: MODULE_26_QUESTIONS,
  27: MODULE_27_QUESTIONS,
  28: MODULE_28_QUESTIONS,
  32: MODULE_32_QUESTIONS,
  33: MODULE_33_QUESTIONS,
  34: MODULE_34_QUESTIONS,
  39: MODULE_39_QUESTIONS,
};

function statementsFor(moduleId: number): TrueFalseQuestion[] {
  return (VERIFY_QUESTIONS[moduleId] ?? []).map((q, index) => ({
    id: `s${index}`,
    concept: `s${index}`,
    difficulty: 1,
    format: "true_false",
    prompt: q.prompt,
    answer: q.answer,
    explanation: q.explanation,
    reviewed: true,
  }));
}

const BANK = new Map<number, Question[]>();

/** Every question for a module, live or not. */
export function moduleQuestions(moduleId: number): Question[] {
  let questions = BANK.get(moduleId);
  if (!questions) {
    questions = [...statementsFor(moduleId), ...(EXTRA_QUESTIONS[moduleId] ?? [])];
    BANK.set(moduleId, questions);
  }
  return questions;
}

function isPictureQuestion(question: Question): boolean {
  return question.format === "which_glass" || question.image !== undefined;
}

export function isLive(question: Question, pictures: boolean = PICTURE_QUESTIONS_ENABLED): boolean {
  return question.reviewed && (pictures || !isPictureQuestion(question));
}

/** The questions a run can ask: reviewed, and no pictures until they're switched on. */
export function liveQuestions(moduleId: number): Question[] {
  return moduleQuestions(moduleId).filter((q) => isLive(q));
}

export function findQuestion(moduleId: number, id: string): Question | null {
  return moduleQuestions(moduleId).find((q) => q.id === id) ?? null;
}
