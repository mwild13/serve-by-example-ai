// Live Guest types and calls for the browser. The guest briefs, the prompt
// and the grading stay on the server (lib/live-guest/).

export type GuestMood = 1 | 2 | 3 | 4 | 5;

/** What the browser sees of a guest before the conversation. */
export type PublicGuest = {
  id: string;
  moduleId: number;
  name: string;
  title: string;
  setting: string;
  opening: string;
  level: 1 | 2 | 3;
  /** False when the person's plan doesn't include the guest's module. */
  available: boolean;
};

export type LiveGuestOutcome = "resolved" | "walked_out" | "unresolved" | "breach";

export type RevealTurn = {
  staff: string;
  guest: string;
  mood: GuestMood;
  thought: string;
};

export type LiveGuestResult = {
  outcome: LiveGuestOutcome;
  score: number;
  passed: boolean;
  wentWell: string;
  tryNext: string;
  startMood: GuestMood;
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
