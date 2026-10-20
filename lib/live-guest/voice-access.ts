// The checks both Live Guest voice routes make before any call to OpenAI:
// signed in, on this device, the conversation is theirs and still open
// enough, Live Guest is on their plan (or it's their taster conversation),
// and they're within today's voice clips. See lib/live-guest/voice.ts.
import "server-only";
import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getUserFromRequest } from "@/lib/supabase-server";
import { hasLiveGuest, resolveAccess, validateSession } from "@/lib/session";
import { getCookieValue } from "@/lib/training-attempt";
import { rateLimit } from "@/lib/rate-limit";
import { consumeVoiceAllowance } from "@/lib/ai-usage";
import { TASTER_GUEST_ID } from "@/lib/live-guest/taster";
import { findGuest, type GuestBrief } from "@/lib/live-guest/guests";
import type { StoredTurn } from "@/lib/live-guest/engine";
import { VOICE_DAILY_CLIPS } from "@/lib/live-guest/voice";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type VoiceSession = {
  id: string;
  difficulty: 1 | 2 | 3;
  turns: StoredTurn[];
  turn_count: number;
  status: string;
  expires_at: string;
};

export type VoiceAccess = { admin: SupabaseClient; session: VoiceSession; brief: GuestBrief };

export function refuse(error: string, code: string, status: number): NextResponse {
  return NextResponse.json({ error, code }, { status });
}

/**
 * Either everything a voice route needs, or the response to send instead.
 * A recording ("listen") only makes sense while the conversation is going.
 * `check` is the route's own test of the conversation (which reply or line),
 * run before the clip is counted.
 */
export async function voiceAccess(
  req: Request,
  sessionId: unknown,
  kind: "listen" | "speak",
  check: (session: VoiceSession) => NextResponse | null,
): Promise<VoiceAccess | NextResponse> {
  const { user } = await getUserFromRequest(req);
  if (!user) return refuse("Unauthorized", "UNAUTHORIZED", 401);
  if (!rateLimit(`live-guest-${kind}:user:${user.id}`, 20)) return refuse("Too many requests. Try again in a minute.", "RATE_LIMITED", 429);
  if (typeof sessionId !== "string" || !UUID_PATTERN.test(sessionId)) return refuse("Invalid request.", "INVALID_REQUEST", 400);

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("live_guest_sessions")
    .select("id, user_id, guest_id, difficulty, turns, turn_count, status, expires_at")
    .eq("id", sessionId)
    .maybeSingle();
  if (error) throw error;
  const row = data as (VoiceSession & { user_id: string; guest_id: string }) | null;
  if (!row || row.user_id !== user.id) return refuse("Conversation not found.", "NOT_FOUND", 404);
  if (new Date(row.expires_at).getTime() <= Date.now()) return refuse("This conversation timed out. Start a new one.", "EXPIRED", 410);
  if (kind === "listen" && row.status !== "active") return refuse("This conversation has finished.", "ENDED", 409);
  const brief = findGuest(row.guest_id);
  if (!brief) return refuse("This guest is no longer available.", "UNKNOWN_GUEST", 410);
  const refused = check(row);
  if (refused) return refused;

  const browserSessionId = getCookieValue(req, "sbe_session_id");
  if (!browserSessionId) return refuse("Missing active session. Please sign in again.", "SESSION_REQUIRED", 401);
  const sessionValidation = await validateSession(admin, user.id, browserSessionId);
  if (!sessionValidation.valid) return refuse("Session conflict detected. Please resume this device.", "SESSION_CONFLICT", 409);
  const access = await resolveAccess(admin, user.id, user.email ?? "");
  if (!hasLiveGuest(access) && brief.id !== TASTER_GUEST_ID) {
    return refuse("Live Guest is on venue plans. Ask your venue about Serve By Example, or see the plans.", "PLAN_REQUIRED", 403);
  }
  if (!process.env.OPENAI_API_KEY) return refuse("Voice isn't available right now. Type your reply instead.", "VOICE_UNAVAILABLE", 503);
  // Last, so a refused request doesn't use a clip.
  if (!(await consumeVoiceAllowance(admin, user.id, VOICE_DAILY_CLIPS))) {
    return refuse("That's today's voice practice used up. You can keep going by typing, and voice is back tomorrow.", "VOICE_DAILY_LIMIT", 429);
  }
  return { admin, session: row, brief };
}
