/**
 * integrity.ts – how each applicant answer was produced (docs/APPLICANT_TESTING.md §5).
 *
 * The browser reports, per item, time on and away from the page, pastes and
 * typing time. The server knows when it sent the item and when the answer
 * came back, so readSignals() trims anything the browser claims beyond that.
 * answerFlags() turns the signals into plain sentences for the manager, and
 * summaryLine() gives one line for the whole test.
 *
 * These are things to ask about in the interview, never a verdict. No flag
 * fails a test, and the wording never says "cheating".
 *
 * Pure.
 */

/** Where every threshold lives. Change them here and nowhere else. */
const SIGNAL_THRESHOLDS = {
  /** A choice answered faster than this reads as a guess. */
  quickChoiceMs: 2_000,
  /** A written answer sent faster than this was hardly read. */
  quickWrittenMs: 4_000,
  /** Pasting at least this much into one answer is worth a look. */
  pastedChars: 80,
  /** Away from the page this long during one item. */
  awayMs: 60_000,
  /** Or this many times. */
  awayCount: 3,
  /** Faster than this many characters a second, over a long answer, is more than typing. */
  typedCharsPerSecond: 15,
  /** Typing speed is only judged on answers at least this long. */
  typingCheckChars: 150,
} as const;

/** Most of any count or length the browser can claim. */
const MAX_COUNT = 1_000;
const MAX_CHARS = 20_000;

export type AnswerSignals = {
  /** Server: from sending the item to receiving the answer. */
  elapsedMs: number;
  activeMs: number;
  awayMs: number;
  awayCount: number;
  pasteCount: number;
  pastedChars: number;
  /** First keystroke to last. */
  typingMs: number;
  /** Server: length of the answer that arrived. */
  answerChars: number;
};

function whole(value: unknown, max: number): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return 0;
  return Math.min(Math.round(value), max);
}

/**
 * The browser's report, checked against the server's own times. Nothing the
 * browser sends can make an answer look slower or more typed than the
 * server saw: time on and away from the page together fit inside the
 * elapsed time.
 */
export function readSignals(raw: unknown, elapsedMs: number, answerChars: number): AnswerSignals {
  const r = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const elapsed = whole(elapsedMs, Number.MAX_SAFE_INTEGER);
  const awayMs = whole(r.awayMs, elapsed);
  const activeMs = Math.min(whole(r.activeMs, elapsed), elapsed - awayMs);
  return {
    elapsedMs: elapsed,
    activeMs,
    awayMs,
    awayCount: whole(r.awayCount, MAX_COUNT),
    pasteCount: whole(r.pasteCount, MAX_COUNT),
    pastedChars: whole(r.pastedChars, MAX_CHARS),
    typingMs: whole(r.typingMs, elapsed),
    answerChars: whole(answerChars, MAX_CHARS),
  };
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

/** "1 second", "45 seconds", "4 minutes", "1 hour 5 minutes". */
export function formatDuration(ms: number): string {
  const seconds = Math.max(0, Math.round(ms / 1000));
  if (seconds < 60) return plural(seconds, "second");
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return plural(minutes, "minute");
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? plural(hours, "hour") : `${plural(hours, "hour")} ${plural(rest, "minute")}`;
}

/** Choice: quiz and ordering. Written: a typed answer. */
export type AnswerKind = "choice" | "written";

type FlagKind = "quick" | "paste" | "away" | "typing";

export type SignalFlag = { kind: FlagKind; text: string };

export function answerFlags(kind: AnswerKind, s: AnswerSignals): SignalFlag[] {
  const t = SIGNAL_THRESHOLDS;
  const flags: SignalFlag[] = [];
  const quickLimit = kind === "choice" ? t.quickChoiceMs : t.quickWrittenMs;
  if (s.elapsedMs < quickLimit) {
    flags.push({ kind: "quick", text: `Answered in ${formatDuration(s.elapsedMs)}` });
  }
  if (kind !== "choice" && s.pastedChars >= t.pastedChars) {
    flags.push({ kind: "paste", text: `Pasted ${plural(s.pastedChars, "character")}` });
  }
  if (s.awayMs >= t.awayMs) {
    flags.push({ kind: "away", text: `Away from the page for ${formatDuration(s.awayMs)}` });
  } else if (s.awayCount >= t.awayCount) {
    flags.push({ kind: "away", text: `Left the page ${plural(s.awayCount, "time")}` });
  }
  if (
    kind !== "choice" &&
    s.pastedChars < t.pastedChars &&
    s.answerChars >= t.typingCheckChars &&
    s.answerChars / Math.max(s.typingMs / 1000, 0.001) > t.typedCharsPerSecond
  ) {
    flags.push({
      kind: "typing",
      text: `${plural(s.answerChars, "character")} appeared in ${formatDuration(s.typingMs)} of typing`,
    });
  }
  return flags;
}

export type SignalSummary = {
  /** One line for the top of the report. */
  line: string;
  flagCount: number;
  /** Time on the test, from the server, gaps between visits left out. */
  totalMs: number;
};

export function summaryLine(answers: { kind: AnswerKind; signals: AnswerSignals }[]): SignalSummary {
  const flags = answers.flatMap((a) => answerFlags(a.kind, a.signals));
  const count = (kind: FlagKind) => flags.filter((f) => f.kind === kind).length;
  const pastes = count("paste") + count("typing");
  const away = count("away");
  const quick = count("quick");
  const parts = [
    pastes === 0 ? "Answers typed, no large pastes" : `${plural(pastes, "answer")} pasted or not typed`,
    away === 0 ? "stayed on the page" : `left the page during ${plural(away, "answer")}`,
    quick === 0 ? "no rushed answers" : `${plural(quick, "very quick answer")}`,
  ];
  return {
    line: `${parts.join(", ")}.`,
    flagCount: flags.length,
    totalMs: answers.reduce((sum, a) => sum + a.signals.elapsedMs, 0),
  };
}
