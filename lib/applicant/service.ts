/**
 * service.ts – applicant tests in the database (docs/APPLICANT_TESTING.md §6, §7).
 *
 * Shared by the console's routes (app/api/management/applicants) and the
 * applicant's (app/api/applicant/[token]). Everything runs on the
 * service-role client, so the callers' checks are the security boundary: the
 * console's requireManager() and account_id filter, and the applicant's link
 * token, looked up by its hash.
 *
 * One item is on screen at a time. Serving an item stamps current_served_at;
 * the answer copies it, so the time an answer took is the server's. Each
 * answer is saved only if position hasn't moved, and (test, position) is
 * unique, so a retry can't be counted twice.
 *
 * Written answers are marked by AI after the response has gone (afterResponse),
 * one as each is saved; the last one and the summary run once the test is
 * finished. completeTest() does whatever is left, so if a background task
 * fails, opening the report finishes the job. Each AI call is taken from the
 * test's budget first (claim_applicant_ai_call, AI_CALL_CAP).
 */
import "server-only";
import { SECTIONS, TRACKS, parseItemKey, progressAt, type SectionId, type Track, type WrittenPrompt } from "@/lib/applicant/blueprint";
import type { ApplicantItemView, ApplicantState, UpcomingItem } from "@/lib/applicant/client";
import { WRITTEN_MAX_CHARS, WRITTEN_MIN_CHARS } from "@/lib/applicant/client";
import { findSourceQuestion } from "@/lib/applicant/content";
import { afterResponse } from "@/lib/applicant/after-response";
import { applicantFinishedEmail } from "@/lib/applicant/emails";
import { answerFlags, readSignals, summaryLine, type AnswerKind, type AnswerSignals, type SignalFlag, type SignalSummary } from "@/lib/applicant/integrity";
import { markWrittenAnswer, scoreFromMarks, type WrittenMark } from "@/lib/applicant/marking";
import { WRITTEN_PROMPTS } from "@/lib/applicant/questions/written";
import { bandFor, overallScore, scoreQuizItem, sectionScores, type Band, type SectionScores } from "@/lib/applicant/scoring";
import { summariseApplicant, type ApplicantSummary } from "@/lib/applicant/summary";
import { hashApplicantToken, isApplicantTokenShape } from "@/lib/applicant/token";
import { cleanUserText } from "@/lib/ai-guard";
import type { AdminClient } from "@/lib/management/auth";
import { sendTransactionalEmail } from "@/lib/notifications/brevo";
import type { Question } from "@/lib/question-bank";
import { answerFits, isAnswerShape, questionView } from "@/lib/verify-quiz";

/** How long an invite link works. A resend starts it again. */
const TEST_TTL_DAYS = 14;
/** Most AI calls one test can make: 4 marks and 1 summary, with room for retries. */
const AI_CALL_CAP = 10;
/** How often the server notes that the applicant is still there, when nothing else changes. */
const TOUCH_EVERY_MS = 60_000;
/** A return to the link after this long counts as a new visit. */
const NEW_VISIT_AFTER_MS = 15 * 60_000;

export type TestStatus = "invited" | "started" | "submitted" | "expired" | "withdrawn";

export type StoredReport = {
  sections: SectionScores;
  overall: number | null;
  band: Band | null;
  signals: SignalSummary;
  /** Items still waiting on an AI score (written scenarios). */
  pendingScores: number;
  /** The AI summary, once every written answer is marked. */
  summary: ApplicantSummary | null;
};

export type TestRow = {
  id: string;
  venue_id: string;
  account_id: string;
  created_by: string | null;
  applicant_name: string;
  applicant_email: string;
  track: Track;
  intro_message: string | null;
  status: TestStatus;
  run_state: { queue: string[] } | null;
  position: number;
  current_served_at: string | null;
  visits: number;
  consent_at: string | null;
  sent_at: string | null;
  started_at: string | null;
  last_seen_at: string | null;
  submitted_at: string | null;
  expires_at: string;
  report: StoredReport | null;
  manager_notified_at: string | null;
  created_at: string;
};

const TEST_COLUMNS =
  "id, venue_id, account_id, created_by, applicant_name, applicant_email, track, intro_message, status, run_state, position, current_served_at, visits, consent_at, sent_at, started_at, last_seen_at, submitted_at, expires_at, report, manager_notified_at, created_at";

export type AnswerRow = {
  position: number;
  item_key: string;
  section: SectionId;
  answer: unknown;
  correct: boolean | null;
  score: number | null;
  evaluation: unknown;
  served_at: string;
  answered_at: string;
  active_ms: number;
  away_ms: number;
  away_count: number;
  paste_count: number;
  pasted_chars: number;
  typing_ms: number;
  answer_chars: number;
};

const ANSWER_COLUMNS =
  "position, item_key, section, answer, correct, score, evaluation, served_at, answered_at, active_ms, away_ms, away_count, paste_count, pasted_chars, typing_ms, answer_chars";

/** The table isn't there yet: the migration hasn't been run. */
export function isMissingTable(error: { code?: string } | null): boolean {
  return error?.code === "42P01";
}

export function trackLabel(track: Track): string {
  return TRACKS.find((t) => t.id === track)?.label ?? track;
}

/** Status with expiry applied: an open test past its date is expired. */
export function effectiveStatus(row: Pick<TestRow, "status" | "expires_at">, now = Date.now()): TestStatus {
  if ((row.status === "invited" || row.status === "started") && new Date(row.expires_at).getTime() <= now) return "expired";
  return row.status;
}

export function expiryFrom(now: Date): string {
  return new Date(now.getTime() + TEST_TTL_DAYS * 86_400_000).toISOString();
}

export async function findTestByToken(admin: AdminClient, token: string): Promise<TestRow | null> {
  if (!isApplicantTokenShape(token)) return null;
  const { data, error } = await admin
    .from("applicant_tests")
    .select(TEST_COLUMNS)
    .eq("token_hash", await hashApplicantToken(token))
    .maybeSingle();
  if (error) throw error;
  return (data as TestRow | null) ?? null;
}

// ── Items ────────────────────────────────────────────────────

export type ResolvedItem =
  | { section: "core" | "role" | "order"; kind: "choice"; question: Question }
  | { section: "written"; kind: "written"; prompt: WrittenPrompt };

/**
 * The content behind an item key. Prompts are found whether or not they're
 * still offered, so a test under way keeps working; a quiz
 * question that has been withdrawn from the bank is null and gets skipped.
 */
export function resolveItem(key: string): ResolvedItem | null {
  const ref = parseItemKey(key);
  if (!ref) return null;
  if (ref.section === "written") {
    const prompt = WRITTEN_PROMPTS.find((p) => p.id === ref.promptId);
    return prompt ? { section: "written", kind: "written", prompt } : null;
  }
  const question = findSourceQuestion(ref.source, ref.questionId);
  return question ? { section: ref.section, kind: "choice", question } : null;
}

function itemView(item: ResolvedItem, position: number): ApplicantItemView {
  switch (item.kind) {
    case "choice":
      return { kind: "quiz", question: questionView(item.question, position) };
    case "written":
      return { kind: "written", setting: item.prompt.setting, prompt: item.prompt.prompt };
  }
}

function answerKind(section: SectionId): AnswerKind {
  return section === "written" ? "written" : "choice";
}

/** The state for a started test whose item at `position` resolves. */
function viewAt(queue: string[], position: number, item: ResolvedItem): UpcomingItem | null {
  const progress = progressAt(queue, position);
  if (!progress) return null;
  const { sectionLabel, sectionNumber, sectionCount, itemNumber, itemsInSection } = progress;
  return { position, progress: { sectionLabel, sectionNumber, sectionCount, itemNumber, itemsInSection }, item: itemView(item, position) };
}

/**
 * The item on screen, and the one after it. The next one is sent ahead so
 * the browser can show it the moment this one is answered, while the answer
 * saves; its clock starts when that answer reaches the server. It is only
 * the question: answer keys and marking guides never leave the server.
 */
function itemState(row: TestRow, item: ResolvedItem): ApplicantState {
  const queue = row.run_state?.queue ?? [];
  const current = viewAt(queue, row.position, item);
  if (!current) return { stage: "finished" };
  const nextKey = queue[row.position + 1];
  const nextItem = nextKey ? resolveItem(nextKey) : null;
  return { stage: "item", ...current, upcoming: nextItem ? viewAt(queue, row.position + 1, nextItem) : null };
}

function closedState(status: TestStatus): ApplicantState | null {
  if (status === "submitted") return { stage: "finished" };
  if (status === "expired" || status === "withdrawn") return { stage: "closed", reason: status };
  return null;
}

async function reload(admin: AdminClient, id: string): Promise<TestRow> {
  const { data, error } = await admin.from("applicant_tests").select(TEST_COLUMNS).eq("id", id).single();
  if (error) throw error;
  return data as TestRow;
}

/**
 * The item on screen now, for a started test. Stamps when it was served (once),
 * counts a return after a break as a visit, skips an item whose content is
 * gone, and finishes the test when nothing is left.
 */
export async function serveCurrent(admin: AdminClient, row: TestRow, origin: string): Promise<ApplicantState> {
  const closed = closedState(effectiveStatus(row));
  if (closed) return closed;
  if (row.status !== "started") return { stage: "closed", reason: "expired" };

  let current = row;
  const queue = current.run_state?.queue ?? [];
  for (let guard = 0; guard <= queue.length; guard++) {
    if (current.position >= queue.length) {
      await finishTest(admin, current, origin);
      return { stage: "finished" };
    }
    const item = resolveItem(queue[current.position]);
    const nowIso = new Date().toISOString();
    if (!item) {
      // Withdrawn from the bank since the test was dealt: move past it.
      await admin
        .from("applicant_tests")
        .update({ position: current.position + 1, current_served_at: null, updated_at: nowIso })
        .eq("id", current.id)
        .eq("position", current.position);
      current = await reload(admin, current.id);
      continue;
    }
    // One write at most, and none when the item is already stamped and the
    // applicant was seen in the last minute: the answer route has just done it.
    const sinceSeen = current.last_seen_at ? Date.now() - new Date(current.last_seen_at).getTime() : Infinity;
    if (!current.current_served_at || sinceSeen > TOUCH_EVERY_MS) {
      const update: Record<string, unknown> = { last_seen_at: nowIso, updated_at: nowIso };
      if (!current.current_served_at) update.current_served_at = nowIso;
      if (current.last_seen_at && sinceSeen > NEW_VISIT_AFTER_MS) update.visits = current.visits + 1;
      await admin.from("applicant_tests").update(update).eq("id", current.id).eq("position", current.position);
    }
    return itemState(current, item);
  }
  return { stage: "finished" };
}

/** Agrees to the notice and starts the clock on the first item. */
export async function startTest(admin: AdminClient, row: TestRow, origin: string): Promise<ApplicantState> {
  const closed = closedState(effectiveStatus(row));
  if (closed) return closed;
  if (row.status === "invited") {
    const nowIso = new Date().toISOString();
    const { error } = await admin
      .from("applicant_tests")
      .update({ status: "started", consent_at: nowIso, started_at: nowIso, last_seen_at: nowIso, current_served_at: nowIso, updated_at: nowIso })
      .eq("id", row.id)
      .eq("status", "invited");
    if (error) throw error;
  }
  return serveCurrent(admin, await reload(admin, row.id), origin);
}

export type AnswerResult = { ok: true; state: ApplicantState } | { ok: false; status: number; code: string; error: string };

function refuse(status: number, code: string, error: string): AnswerResult {
  return { ok: false, status, code, error };
}

/** Checks, scores and saves one answer, then serves the next item. */
export async function recordAnswer(
  admin: AdminClient,
  row: TestRow,
  body: Record<string, unknown>,
  origin: string,
): Promise<AnswerResult> {
  const closed = closedState(effectiveStatus(row));
  if (closed) return { ok: true, state: closed };
  if (row.status !== "started") return refuse(409, "NOT_STARTED", "Start the test first.");

  const position = body.position;
  if (!Number.isInteger(position) || (position as number) < 0) return refuse(400, "INVALID_REQUEST", "Invalid request.");
  // The same answer sent again after a dropped connection: carry on from where the test is.
  if ((position as number) < row.position) return { ok: true, state: await serveCurrent(admin, row, origin) };
  if (position !== row.position) return refuse(409, "OUT_OF_STEP", "That answer is out of step. Reload the page.");

  const queue = row.run_state?.queue ?? [];
  const key = queue[row.position];
  const item = key ? resolveItem(key) : null;
  if (!key || !item) return { ok: true, state: await serveCurrent(admin, row, origin) };

  let answer: unknown;
  let score: number | null = null;
  let correct: boolean | null = null;
  let answerChars = 0;
  switch (item.kind) {
    case "choice": {
      const given = body.answer;
      if (!isAnswerShape(given) || !answerFits(item.question, given)) return refuse(400, "INVALID_ANSWER", "Choose an answer first.");
      ({ score, correct } = scoreQuizItem(item.question, given));
      answer = given;
      break;
    }
    case "written": {
      const raw = body.answer;
      if (typeof raw !== "string" || raw.length > WRITTEN_MAX_CHARS) {
        return refuse(400, "INVALID_ANSWER", `Keep it under ${WRITTEN_MAX_CHARS} characters.`);
      }
      const text = cleanUserText(raw);
      if (text.length < WRITTEN_MIN_CHARS) return refuse(400, "TOO_SHORT", "Write a little more first.");
      answer = { text };
      answerChars = text.length;
      break;
    }
  }

  const now = new Date();
  const servedAt = row.current_served_at ?? row.last_seen_at ?? now.toISOString();
  const signals = readSignals(body.signals, now.getTime() - new Date(servedAt).getTime(), answerChars);
  const { error: insertError } = await admin.from("applicant_answers").insert({
    test_id: row.id,
    position: row.position,
    item_key: key,
    section: item.section,
    answer,
    correct,
    score,
    served_at: servedAt,
    answered_at: now.toISOString(),
    active_ms: signals.activeMs,
    away_ms: signals.awayMs,
    away_count: signals.awayCount,
    paste_count: signals.pasteCount,
    pasted_chars: signals.pastedChars,
    typing_ms: signals.typingMs,
    answer_chars: signals.answerChars,
  });
  // 23505: this position was already answered by a request that got here first.
  if (insertError && insertError.code !== "23505") throw insertError;
  let moved: TestRow | null = null;
  if (!insertError) {
    // Moving on starts the next item's clock, and returns the row, so there's no second read.
    const { data: movedRow, error: moveError } = await admin
      .from("applicant_tests")
      .update({ position: row.position + 1, current_served_at: now.toISOString(), last_seen_at: now.toISOString(), updated_at: now.toISOString() })
      .eq("id", row.id)
      .eq("position", row.position)
      .select(TEST_COLUMNS)
      .maybeSingle();
    if (moveError) throw moveError;
    moved = (movedRow as TestRow | null) ?? null;
    // Mark it while they carry on. The last answer is marked with the summary instead.
    if (item.kind === "written" && row.position + 1 < queue.length) {
      const testId = row.id;
      const at = row.position;
      await afterResponse("mark", () => markAnswer(admin, testId, at).then(() => undefined));
    }
  }
  return { ok: true, state: await serveCurrent(admin, moved ?? (await reload(admin, row.id)), origin) };
}

// ── Report ───────────────────────────────────────────────────

function signalsOf(answer: AnswerRow): AnswerSignals {
  return {
    elapsedMs: Math.max(0, new Date(answer.answered_at).getTime() - new Date(answer.served_at).getTime()),
    activeMs: answer.active_ms,
    awayMs: answer.away_ms,
    awayCount: answer.away_count,
    pasteCount: answer.paste_count,
    pastedChars: answer.pasted_chars,
    typingMs: answer.typing_ms,
    answerChars: answer.answer_chars,
  };
}

/** Scores and the signals line, from the answers so far. Pure. The summary is added by completeTest(). */
export function computeReport(answers: AnswerRow[], summary: ApplicantSummary | null = null): StoredReport {
  const sections = sectionScores(answers.map((a) => ({ section: a.section, score: a.score })));
  const overall = overallScore(sections);
  return {
    sections,
    overall,
    band: overall === null ? null : bandFor(overall),
    signals: summaryLine(answers.map((a) => ({ kind: answerKind(a.section), signals: signalsOf(a) }))),
    pendingScores: answers.filter((a) => a.score === null).length,
    summary,
  };
}

export async function loadAnswers(admin: AdminClient, testId: string): Promise<AnswerRow[]> {
  const { data, error } = await admin.from("applicant_answers").select(ANSWER_COLUMNS).eq("test_id", testId).order("position");
  if (error) throw error;
  return (data ?? []) as AnswerRow[];
}

/** The console link to a test's report. The tab itself is Phase 6. */
function reportUrl(origin: string, testId: string): string {
  return `${origin}/management/dashboard?tab=applicants&test=${encodeURIComponent(testId)}`;
}

/**
 * Marks the test finished with its scores so far, once, then marks what's
 * left, writes the summary and tells the manager, after the response.
 */
async function finishTest(admin: AdminClient, row: TestRow, origin: string): Promise<void> {
  const report = computeReport(await loadAnswers(admin, row.id));
  const nowIso = new Date().toISOString();
  const { data: finished, error } = await admin
    .from("applicant_tests")
    .update({ status: "submitted", submitted_at: nowIso, current_served_at: null, report, updated_at: nowIso })
    .eq("id", row.id)
    .eq("status", "started")
    .select("id");
  if (error) throw error;
  if (!finished || finished.length === 0) return;
  await afterResponse("complete", () => completeTest(admin, row.id, origin, { notify: true }).then(() => undefined));
}

/** Takes one AI call from the test's budget. False once it's spent. */
async function claimAiCall(admin: AdminClient, testId: string): Promise<boolean> {
  const { data, error } = await admin.rpc("claim_applicant_ai_call", { p_test: testId, p_cap: AI_CALL_CAP });
  if (error) throw error;
  return data === true;
}

/** Marks one written answer if it isn't marked yet. True when it has a score afterwards. */
async function markAnswer(admin: AdminClient, testId: string, position: number): Promise<boolean> {
  const { data, error } = await admin
    .from("applicant_answers")
    .select("item_key, answer, score")
    .eq("test_id", testId)
    .eq("position", position)
    .maybeSingle();
  if (error) throw error;
  if (!data) return false;
  if (data.score !== null) return true;
  const item = resolveItem(data.item_key as string);
  const text = (data.answer as { text?: unknown } | null)?.text;
  if (item?.kind !== "written" || typeof text !== "string") return false;
  if (!(await claimAiCall(admin, testId))) return false;

  const mark = await markWrittenAnswer(item.prompt, text);
  if (!mark) return false;
  // Only the first mark is kept, if two runs got here together.
  const { error: saveError } = await admin
    .from("applicant_answers")
    .update({ score: scoreFromMarks(mark.marks), evaluation: mark })
    .eq("test_id", testId)
    .eq("position", position)
    .is("score", null);
  if (saveError) throw saveError;
  return true;
}

function summaryInput(row: TestRow, answers: AnswerRow[], report: StoredReport) {
  const written = answers.flatMap((a) => {
    const item = resolveItem(a.item_key);
    const text = (a.answer as { text?: unknown } | null)?.text;
    if (item?.kind !== "written" || typeof text !== "string") return [];
    const mark = a.evaluation as Partial<WrittenMark> | null;
    return [{ scenario: `${item.prompt.setting} ${item.prompt.prompt}`, answer: text, strengths: mark?.strengths ?? "", gaps: mark?.gaps ?? "" }];
  });
  const missed = answers.flatMap((a) => {
    const item = resolveItem(a.item_key);
    return item?.kind === "choice" && a.correct === false ? [item.question.prompt] : [];
  });
  return {
    trackLabel: trackLabel(row.track),
    sections: SECTIONS.map((s) => ({ label: s.label, score: report.sections[s.id] })),
    written,
    missed,
  };
}

/**
 * Finishes a submitted test's report: marks any written answer still
 * unmarked, writes the summary once they all are, saves the report, and
 * (with `notify`) emails the manager once. Safe to run more than once or at
 * the same time: marks and the email are each claimed before they're done.
 */
export async function completeTest(admin: AdminClient, testId: string, origin: string, opts: { notify: boolean }): Promise<StoredReport | null> {
  const row = await reload(admin, testId);
  if (row.status !== "submitted") return null;

  let answers = await loadAnswers(admin, testId);
  const unmarked = answers.filter((a) => a.section === "written" && a.score === null);
  if (unmarked.length > 0) {
    for (const a of unmarked) await markAnswer(admin, testId, a.position);
    answers = await loadAnswers(admin, testId);
  }

  let summary = row.report?.summary ?? null;
  const scoresSoFar = computeReport(answers);
  if (!summary && scoresSoFar.pendingScores === 0 && (await claimAiCall(admin, testId))) {
    summary = await summariseApplicant(summaryInput(row, answers, scoresSoFar));
  }
  const report = computeReport(answers, summary);
  const { error } = await admin.from("applicant_tests").update({ report, updated_at: new Date().toISOString() }).eq("id", testId);
  if (error) throw error;

  if (opts.notify) await notifyManager(admin, row, origin);
  return report;
}

/** The "has finished" email, once: the send is claimed on the row first. Best effort. */
async function notifyManager(admin: AdminClient, row: TestRow, origin: string): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey || !row.created_by) return;
  const { data: claimed, error } = await admin
    .from("applicant_tests")
    .update({ manager_notified_at: new Date().toISOString() })
    .eq("id", row.id)
    .is("manager_notified_at", null)
    .select("id");
  if (error) throw error;
  if (!claimed || claimed.length === 0) return;
  try {
    const [{ data: manager }, { data: venue }] = await Promise.all([
      admin.auth.admin.getUserById(row.created_by),
      admin.from("venues").select("name").eq("id", row.venue_id).maybeSingle(),
    ]);
    const to = manager?.user?.email;
    if (!to) return;
    const email = applicantFinishedEmail({
      venueName: (venue?.name as string | undefined) ?? "your venue",
      applicantName: row.applicant_name,
      trackLabel: trackLabel(row.track),
      url: reportUrl(origin, row.id),
    });
    await sendTransactionalEmail(apiKey, { to, subject: email.subject, html: email.html, tag: "applicant_finished" });
  } catch (err) {
    console.warn(JSON.stringify({ event: "applicant_finished_email_failed", testId: row.id, message: err instanceof Error ? err.message : String(err) }));
  }
}

export type ReportItem = {
  position: number;
  section: SectionId;
  sectionLabel: string;
  prompt: string;
  /** Written scenarios: where and when. */
  setting?: string;
  /** What the applicant gave, as text. */
  given: string[];
  /** The right answer, as text, for quiz and ordering items. */
  rightAnswer?: string[];
  correct: boolean | null;
  score: number | null;
  timeMs: number;
  flags: SignalFlag[];
  /** Written scenarios, once marked: the marking guide with what the answer covered, and the marker's notes. */
  guide?: { point: string; covered: boolean }[];
  marks?: WrittenMark["marks"];
  strengths?: string;
  gaps?: string;
  followUp?: string;
};

function optionText(question: Question, id: unknown): string {
  if (question.format === "true_false") return id === "true" ? "True" : "False";
  if (question.format === "order_steps") return question.steps.find((s) => s.id === id)?.text ?? String(id);
  if (question.format === "number") return `${String(id)} ${question.unit}`.trim();
  return question.options.find((o) => o.id === id)?.text ?? String(id);
}

function rightAnswerOf(question: Question): string[] {
  if (question.format === "order_steps") return question.steps.map((s) => s.text);
  if (question.format === "number") return [`${question.answer} ${question.unit}`.trim()];
  return [optionText(question, question.answer)];
}

/** Every answer as the manager reads it: what was asked, what came back, how. */
export function reportItems(answers: AnswerRow[]): ReportItem[] {
  return answers.map((a) => {
    const item = resolveItem(a.item_key);
    const sectionLabel = SECTIONS.find((s) => s.id === a.section)?.label ?? a.section;
    const signals = signalsOf(a);
    const base = {
      position: a.position,
      section: a.section,
      sectionLabel,
      correct: a.correct,
      score: a.score,
      timeMs: signals.elapsedMs,
      flags: answerFlags(answerKind(a.section), signals),
    };
    if (item?.kind === "choice") {
      const given = Array.isArray(a.answer) ? a.answer : [a.answer];
      return { ...base, prompt: item.question.prompt, given: given.map((id) => optionText(item.question, id)), rightAnswer: rightAnswerOf(item.question) };
    }
    if (item?.kind === "written") {
      const text = (a.answer as { text?: unknown } | null)?.text;
      const mark = a.score === null ? null : (a.evaluation as WrittenMark | null);
      return {
        ...base,
        prompt: item.prompt.prompt,
        setting: item.prompt.setting,
        given: [typeof text === "string" ? text : ""],
        ...(mark
          ? {
              guide: item.prompt.rubric.map((point, i) => ({ point, covered: mark.covered.includes(i) })),
              marks: mark.marks,
              strengths: mark.strengths,
              gaps: mark.gaps,
              followUp: mark.followUp,
            }
          : {}),
      };
    }
    return { ...base, prompt: "This question is no longer in the bank.", given: [] };
  });
}
