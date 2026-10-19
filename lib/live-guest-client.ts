// Live Guest types and calls for the browser. The guest briefs, the prompt
// and the grading stay on the server (lib/live-guest/).

export type GuestMood = 1 | 2 | 3 | 4 | 5;
/** Speed: 1 stalled to 5 flying. Safety: 1 unsafe to 5 safe. */
export type DialLevel = 1 | 2 | 3 | 4 | 5;
/** How the guest plays: 1 patient, 2 as written, 3 tough. Follows the person's progress. */
export type GuestDifficulty = 1 | 2 | 3;
/** The guest's module area, for grouping the picker. */
export type GuestArea = "technical" | "service" | "compliance";

/** What the browser sees of a guest before the conversation. */
export type PublicGuest = {
  id: string;
  moduleId: number;
  name: string;
  title: string;
  setting: string;
  opening: string;
  level: 1 | 2 | 3;
  area: GuestArea;
  /** False when the person's plan doesn't include the guest's module. */
  available: boolean;
  /** How this guest would play for this person today. */
  difficulty: GuestDifficulty;
  /** This person has passed a conversation with this guest. */
  passed: boolean;
  /** One of the few guests picked for this person's level. */
  suggested: boolean;
};

export type LiveGuestOutcome = "resolved" | "walked_out" | "unresolved" | "breach";

type MoneyMove = { label: string; dollars: number };

export type RevealTurn = {
  staff: string;
  guest: string;
  mood: GuestMood;
  thought: string;
  /** Null when the dial isn't in play for this guest. */
  speed: DialLevel | null;
  safety: DialLevel | null;
  /** What this reply made happen to the venue's money. */
  money: MoneyMove[];
};

/** Where the dials started and ended. Null when a dial isn't in play. */
export type DialSummary = {
  speed: { start: DialLevel; end: DialLevel } | null;
  safety: { start: DialLevel; end: DialLevel } | null;
  money: { total: number; per: string | null; note: string | null } | null;
};

export type LiveGuestResult = {
  outcome: LiveGuestOutcome;
  score: number;
  passed: boolean;
  wentWell: string;
  tryNext: string;
  startMood: GuestMood;
  difficulty: GuestDifficulty;
  dials: DialSummary;
  turns: RevealTurn[];
  /** Shown after the conversation: what the guest wanted and what the staff member couldn't see. */
  brief: { wants: string; calms: string[]; setsOff: string[]; mustDo: string | null };
  /** False if the result couldn't be recorded. It still shows. */
  saved: boolean;
};

export type LiveGuestStart = {
  sessionId: string;
  guest: PublicGuest;
  maxReplies: number;
};

export type LiveGuestTurnResult = {
  /** The guest's answer to this reply. */
  guest: string;
  /** Staff replies so far, this one included. */
  replies: number;
  ended: boolean;
  result: LiveGuestResult | null;
};

export const MOOD_LABEL: Record<GuestMood, string> = {
  1: "Fuming",
  2: "Annoyed",
  3: "Neutral",
  4: "Happy",
  5: "Delighted",
};

export const SPEED_LABEL: Record<DialLevel, string> = {
  1: "Stalled",
  2: "Slow",
  3: "Steady",
  4: "Quick",
  5: "Flying",
};

export const SAFETY_LABEL: Record<DialLevel, string> = {
  1: "Unsafe",
  2: "At risk",
  3: "Watch it",
  4: "Mostly safe",
  5: "Safe",
};

export const AREA_LABEL: Record<GuestArea, string> = {
  technical: "Behind the bar",
  service: "Service and sales",
  compliance: "Safety and compliance",
};

export const DIFFICULTY_LABEL: Record<GuestDifficulty, string> = {
  1: "Patient",
  2: "Everyday",
  3: "Tough",
};

/** "+$20", "-$3", "$0". A plain hyphen, never a dash. */
export function formatDollars(dollars: number): string {
  const amount = `$${Math.abs(Math.round(dollars)).toLocaleString("en-AU")}`;
  return dollars > 0 ? `+${amount}` : dollars < 0 ? `-${amount}` : amount;
}

export const LIVE_GUEST_MAX_REPLY_CHARS = 500;

export class LiveGuestError extends Error {
  constructor(message: string, readonly code: string | null, readonly status: number) {
    super(message);
    this.name = "LiveGuestError";
  }
}

async function call<T>(url: string, token: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: body === undefined ? "GET" : "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = (await res.json().catch(() => null)) as (T & { error?: string; code?: string }) | null;
  if (!res.ok || !data) {
    throw new LiveGuestError(data?.error ?? `Request failed (${res.status}).`, data?.code ?? null, res.status);
  }
  return data;
}

export async function listLiveGuests(token: string): Promise<PublicGuest[]> {
  return (await call<{ guests: PublicGuest[] }>("/api/live-guest/guests", token)).guests;
}

export function startLiveGuest(token: string, guestId: string): Promise<LiveGuestStart> {
  return call<LiveGuestStart>("/api/live-guest/start", token, { guestId });
}

/** `turn` is the number of replies already sent, so a retry can't land twice. */
export function sendLiveGuestReply(token: string, sessionId: string, turn: number, reply: string): Promise<LiveGuestTurnResult> {
  return call<LiveGuestTurnResult>("/api/live-guest/turn", token, { sessionId, turn, reply });
}
