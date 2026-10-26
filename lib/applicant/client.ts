// What the browser sees of an applicant test, and the calls it makes. Safe
// for client components: no answer keys, rubrics or briefs. The applicant's
// pages are app/apply/[token]; the console's tab is Phase 6.
import type { QuizAnswer, QuizQuestionView } from "@/lib/verify-quiz-client";

/** Longest written answer. About two paragraphs. */
export const WRITTEN_MAX_CHARS = 2_000;
/** Shortest written answer the test accepts, so a stray tap can't send one. */
export const WRITTEN_MIN_CHARS = 10;

export type ApplicantItemView =
  | { kind: "quiz"; question: QuizQuestionView }
  | { kind: "written"; setting: string; prompt: string };

type ApplicantProgressView = {
  sectionLabel: string;
  sectionNumber: number;
  sectionCount: number;
  itemNumber: number;
  itemsInSection: number;
};

/** The item after the one on screen, sent ahead so it shows the moment an answer is given. */
export type UpcomingItem = { position: number; progress: ApplicantProgressView; item: ApplicantItemView };

export type ApplicantState =
  | { stage: "item"; position: number; progress: ApplicantProgressView; item: ApplicantItemView; upcoming: UpcomingItem | null }
  | { stage: "finished" }
  | { stage: "closed"; reason: "expired" | "withdrawn" };

/** What the browser measured while one item was on screen (lib/applicant/integrity.ts). */
export type SignalsPayload = {
  activeMs: number;
  awayMs: number;
  awayCount: number;
  pasteCount: number;
  pastedChars: number;
  typingMs: number;
};

export type ApplicantAnswer = QuizAnswer;

export class ApplicantTestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = "ApplicantTestError";
  }
}

async function post(token: string, path: string, body: Record<string, unknown>): Promise<ApplicantState> {
  const res = await fetch(`/api/applicant/${encodeURIComponent(token)}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as { state?: ApplicantState; error?: string; code?: string };
  if (!res.ok || !data.state) {
    throw new ApplicantTestError(data.error ?? "Something went wrong. Try again.", res.status, data.code ?? "UNKNOWN");
  }
  return data.state;
}

/** Agrees to the collection notice and gets the first item. */
export function startApplicantTest(token: string): Promise<ApplicantState> {
  return post(token, "start", { consent: true });
}

/** The item to answer now, for a return visit. */
export function currentApplicantItem(token: string): Promise<ApplicantState> {
  return post(token, "next", {});
}

export function submitApplicantAnswer(
  token: string,
  position: number,
  answer: ApplicantAnswer,
  signals: SignalsPayload,
): Promise<ApplicantState> {
  return post(token, "answer", { position, answer, signals });
}
