/**
 * blueprint.ts – what an applicant test is made of (docs/APPLICANT_TESTING.md §3).
 *
 * Five sections, in order: a core hospitality quiz every track sits, a quiz on
 * the role, two order-of-operations tasks, three written scenarios and one
 * Live Guest conversation. drawTest() deals one test from a track's sources
 * (lib/applicant/content.ts), so no two applicants see the same set.
 *
 * Every item has a key that never changes meaning, stored in
 * applicant_tests.run_state.queue and on each applicant_answers row:
 *   core:<source>:<question id>    role:<source>:<question id>
 *   order:<source>:<question id>   written:<prompt id>   guest:<guest id>
 * A source is a module id ("15") or a bank name ("kitchen").
 *
 * Pure: no database, no AI, no randomness of its own.
 */

import type { Question } from "@/lib/question-bank";
import { shuffle, type Random } from "@/lib/verify-quiz";

export type Track = "bar" | "floor" | "kitchen" | "management";

export const TRACKS: { id: Track; label: string }[] = [
  { id: "bar", label: "Bar" },
  { id: "floor", label: "Floor and front of house" },
  { id: "kitchen", label: "Kitchen" },
  { id: "management", label: "Management" },
];

export function isTrack(value: unknown): value is Track {
  return TRACKS.some((t) => t.id === value);
}

export type SectionId = "core" | "role" | "order" | "written" | "guest";

/** Items per section, and each section's share of the overall score (adds to 100). */
export const SECTIONS: { id: SectionId; label: string; count: number; weight: number }[] = [
  { id: "core", label: "Hospitality basics", count: 10, weight: 25 },
  { id: "role", label: "Knowledge for the role", count: 8, weight: 20 },
  { id: "order", label: "First things first", count: 2, weight: 10 },
  { id: "written", label: "What would you do?", count: 3, weight: 30 },
  { id: "guest", label: "Live Guest", count: 1, weight: 15 },
];

/** The role quiz must mix at least this many sources, so it isn't one topic. */
export const MIN_ROLE_SOURCES = 3;

/** A written scenario. The rubric and red flags never reach the applicant. */
export type WrittenPrompt = {
  /** Stable. Never reuse one for a different prompt. */
  id: string;
  tracks: Track[];
  /** What it tests. Two prompts on one concept are never in the same test. */
  concept: string;
  /** Shown: where, when, what's going on. */
  setting: string;
  /** Shown: the question. */
  prompt: string;
  /** Hidden: what a strong answer covers, for the AI marker. */
  rubric: string[];
  /** Hidden: things that should cost marks. */
  redFlags: string[];
  /** Owner has checked it. Unreviewed prompts are never used. */
  reviewed: boolean;
};

export type QuizSource = { source: string; questions: Question[] };

/** Everything one track can draw from. Only reviewed, live content belongs here. */
export type TrackSources = {
  core: QuizSource[];
  role: QuizSource[];
  /** order_steps questions are taken from these. Role sources are used first. */
  order: QuizSource[];
  written: WrittenPrompt[];
  /** Live Guest brief ids. */
  guests: string[];
};

export type TestPlan = { queue: string[] };

export type Shortfall = { section: SectionId; have: number; need: number };

export type DrawResult = { ok: true; plan: TestPlan } | { ok: false; shortfall: Shortfall[] };

export type ItemRef =
  | { section: "core" | "role" | "order"; source: string; questionId: string }
  | { section: "written"; promptId: string }
  | { section: "guest"; guestId: string };

export function itemKey(ref: ItemRef): string {
  switch (ref.section) {
    case "written":
      return `written:${ref.promptId}`;
    case "guest":
      return `guest:${ref.guestId}`;
    default:
      return `${ref.section}:${ref.source}:${ref.questionId}`;
  }
}

export function parseItemKey(key: string): ItemRef | null {
  const [section, ...rest] = key.split(":");
  if (section === "written" || section === "guest") {
    const id = rest.join(":");
    if (rest.length !== 1 || id === "") return null;
    return section === "written" ? { section, promptId: id } : { section, guestId: id };
  }
  if (section === "core" || section === "role" || section === "order") {
    const [source, ...idParts] = rest;
    const questionId = idParts.join(":");
    if (!source || questionId === "") return null;
    return { section, source, questionId };
  }
  return null;
}

/** Quiz questions: no True/False (a coin toss), and ordering has its own section. */
function isQuizQuestion(q: Question): boolean {
  return q.format !== "true_false" && q.format !== "order_steps";
}

/** One question per fact per source, shuffled. */
function quizPool(source: QuizSource, random: Random): Question[] {
  const seen = new Set<string>();
  return shuffle(source.questions.filter(isQuizQuestion), random).filter((q) => {
    if (seen.has(q.concept)) return false;
    seen.add(q.concept);
    return true;
  });
}

/**
 * Deals `count` questions in turns across the sources, so the quiz covers
 * every topic before any topic gets a second question. Easier questions come
 * first, which settles a nervous applicant in.
 */
function dealQuiz(section: "core" | "role", sources: QuizSource[], count: number, random: Random): string[] {
  const pools = shuffle(
    sources.map((s) => ({ source: s.source, pool: quizPool(s, random) })).filter((p) => p.pool.length > 0),
    random,
  );
  const picked: { key: string; difficulty: number }[] = [];
  for (let round = 0; picked.length < count; round++) {
    const inRound = pools.filter((p) => p.pool.length > round);
    if (inRound.length === 0) break;
    for (const p of inRound) {
      if (picked.length >= count) break;
      const q = p.pool[round];
      picked.push({ key: itemKey({ section, source: p.source, questionId: q.id }), difficulty: q.difficulty });
    }
  }
  return picked.sort((a, b) => a.difficulty - b.difficulty).map((p) => p.key);
}

/** One ordering task per source, role sources first. */
function dealOrder(sources: TrackSources, count: number, random: Random): string[] {
  const roleNames = new Set(sources.role.map((s) => s.source));
  const withTasks = sources.order
    .map((s) => ({ source: s.source, tasks: shuffle(s.questions.filter((q) => q.format === "order_steps"), random) }))
    .filter((s) => s.tasks.length > 0);
  const ordered = [
    ...shuffle(withTasks.filter((s) => roleNames.has(s.source)), random),
    ...shuffle(withTasks.filter((s) => !roleNames.has(s.source)), random),
  ];
  return ordered.slice(0, count).map((s) => itemKey({ section: "order", source: s.source, questionId: s.tasks[0].id }));
}

function dealWritten(prompts: WrittenPrompt[], count: number, random: Random): string[] {
  const seen = new Set<string>();
  return shuffle(prompts.filter((p) => p.reviewed), random)
    .filter((p) => {
      if (seen.has(p.concept)) return false;
      seen.add(p.concept);
      return true;
    })
    .slice(0, count)
    .map((p) => itemKey({ section: "written", promptId: p.id }));
}

function needOf(section: SectionId): number {
  return SECTIONS.find((s) => s.id === section)?.count ?? 0;
}

/** Deals one test, or says which sections can't be filled yet. */
export function drawTest(sources: TrackSources, random: Random): DrawResult {
  const parts: Record<SectionId, string[]> = {
    core: dealQuiz("core", sources.core, needOf("core"), random),
    role: dealQuiz("role", sources.role, needOf("role"), random),
    order: dealOrder(sources, needOf("order"), random),
    written: dealWritten(sources.written, needOf("written"), random),
    guest: shuffle(sources.guests, random).slice(0, 1).map((guestId) => itemKey({ section: "guest", guestId })),
  };

  const shortfall: Shortfall[] = SECTIONS.filter((s) => parts[s.id].length < s.count).map((s) => ({
    section: s.id,
    have: parts[s.id].length,
    need: s.count,
  }));
  const roleSources = sources.role.filter((s) => s.questions.some(isQuizQuestion)).length;
  if (roleSources < MIN_ROLE_SOURCES && !shortfall.some((s) => s.section === "role")) {
    shortfall.push({ section: "role", have: parts.role.length, need: needOf("role") });
  }
  if (shortfall.length > 0) return { ok: false, shortfall };

  return { ok: true, plan: { queue: SECTIONS.flatMap((s) => parts[s.id]) } };
}

export type TestProgress = {
  section: SectionId;
  sectionLabel: string;
  /** 1 based. */
  sectionNumber: number;
  sectionCount: number;
  /** 1 based, within the section. */
  itemNumber: number;
  itemsInSection: number;
};

/** Where the applicant is, for the progress line. Null once every item is answered. */
export function progressAt(queue: string[], position: number): TestProgress | null {
  const ref = position >= 0 && position < queue.length ? parseItemKey(queue[position]) : null;
  if (!ref) return null;
  const present = SECTIONS.filter((s) => queue.some((key) => key.startsWith(`${s.id}:`)));
  const index = present.findIndex((s) => s.id === ref.section);
  const inSection = queue.filter((key) => key.startsWith(`${ref.section}:`));
  const before = queue.slice(0, position).filter((key) => key.startsWith(`${ref.section}:`)).length;
  return {
    section: ref.section,
    sectionLabel: present[index].label,
    sectionNumber: index + 1,
    sectionCount: present.length,
    itemNumber: before + 1,
    itemsInSection: inSection.length,
  };
}
