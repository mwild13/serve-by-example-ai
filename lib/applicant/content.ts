// What each applicant test track draws from (docs/APPLICANT_TESTING.md §3).
// Lists ids only: the questions themselves stay in the training
// bank. Only content that holds in every venue belongs here: no brands, no
// Venue Content, nothing that depends on one venue's way of doing things.
// Server-only, like the answer keys it reaches.
import "server-only";
import type { Track, TrackSources, QuizSource } from "@/lib/applicant/blueprint";
import { KITCHEN_QUESTIONS } from "@/lib/applicant/questions/kitchen";
import { MANAGEMENT_QUESTIONS } from "@/lib/applicant/questions/management";
import { WRITTEN_PROMPTS } from "@/lib/applicant/questions/written";
import { isLive, liveQuestions, type Question } from "@/lib/question-bank";

/**
 * The core quiz: greeting, complaints, RSA, food safety, conflict,
 * emergencies, "Behind!", glass in the well, ice, allergies.
 */
export const CORE_MODULES = [8, 11, 15, 16, 17, 18, 21, 22, 24, 25];

/**
 * The kitchen's core quiz leaves out what a chef doesn't do: serving alcohol
 * (RSA), the bar's ice well and ice scoop, and greeting guests. What's left
 * holds in every kitchen.
 */
const KITCHEN_CORE_MODULES = [11, 16, 17, 18, 21, 25];

export function coreModulesFor(track: Track): number[] {
  return track === "kitchen" ? KITCHEN_CORE_MODULES : CORE_MODULES;
}

/** Modules for the role quiz, per track. Banks are added in BANKS. */
export const ROLE_MODULES: Record<Track, number[]> = {
  bar: [1, 3, 26, 31, 33],
  floor: [9, 10, 23, 29, 36, 38],
  kitchen: [6, 29],
  management: [19, 20],
};

/** Question banks written for applicant tests, per track. */
const BANKS: Partial<Record<Track, { source: string; questions: Question[] }>> = {
  kitchen: { source: "kitchen", questions: KITCHEN_QUESTIONS },
  management: { source: "management", questions: MANAGEMENT_QUESTIONS },
};

function moduleSource(moduleId: number): QuizSource {
  return { source: String(moduleId), questions: liveQuestions(moduleId) };
}

/** The source's questions, for grading. Null for an unknown source or question. */
export function findSourceQuestion(source: string, questionId: string): Question | null {
  const bank = Object.values(BANKS).find((b) => b?.source === source);
  const questions = bank ? bank.questions.filter((q) => isLive(q)) : /^\d+$/.test(source) ? liveQuestions(Number(source)) : [];
  return questions.find((q) => q.id === questionId) ?? null;
}

export function trackSources(track: Track): TrackSources {
  const role = ROLE_MODULES[track].map(moduleSource);
  const bank = BANKS[track];
  if (bank) role.push({ source: bank.source, questions: bank.questions.filter((q) => isLive(q)) });
  const core = coreModulesFor(track).map(moduleSource);
  return {
    core,
    role,
    order: [...role, ...core],
    written: WRITTEN_PROMPTS.filter((p) => p.reviewed && p.tracks.includes(track)),
  };
}
