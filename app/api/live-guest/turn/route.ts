import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getUserFromRequest } from "@/lib/supabase-server";
import { hasLiveGuest, resolveAccess, validateSession } from "@/lib/session";
import { TASTER_GUEST_ID } from "@/lib/live-guest/taster";
import { rateLimit } from "@/lib/rate-limit";
import { getCookieValue, maybeMarkTrialActivated } from "@/lib/training-attempt";
import { cleanUserText, parseModelJson, readJsonBody } from "@/lib/ai-guard";
import { CHAT_MODEL_PARAMS, getOpenAIClient } from "@/lib/openai";
import { aiDailyLimitForTier, aiDailyLimitResponse, consumeAiAllowance } from "@/lib/ai-usage";
import { AttemptIdConflictError, moduleIdToString, recordAttempt, syncMasteryToVenueStaff } from "@/lib/mastery";
import { reportError } from "@/lib/report-error";
import { findGuest, type GuestBrief, type Mood } from "@/lib/live-guest/guests";
import {
  GUEST_SYSTEM_PROMPT,
  briefBlock,
  conversationBlock,
  dialSummary,
  isPass,
  parseGuestTurn,
  revealTurns,
  stateAfter,
  type StoredTurn,
} from "@/lib/live-guest/engine";
import { startMoodFor } from "@/lib/live-guest/difficulty";
import {
  LIVE_GUEST_MAX_REPLY_CHARS,
  type GuestDifficulty,
  type LiveGuestOutcome,
  type LiveGuestResult,
} from "@/lib/live-guest-client";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 4 * 1024;
// A 300-character reply, a 200-character thought and a short debrief.
const MAX_OUTPUT_TOKENS = 600;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Live Guest results share the Arena's roleplay row, so a pass counts in the manager's service score. */
const ROLEPLAY_SCENARIO_INDEX = 40;

type SessionRow = {
  id: string;
  user_id: string;
  guest_id: string;
  module_id: number;
  difficulty: GuestDifficulty;
  turns: StoredTurn[];
  turn_count: number;
  status: string;
  result: LiveGuestResult | null;
  expires_at: string;
};

function resultOf(
  brief: GuestBrief,
  difficulty: GuestDifficulty,
  startMood: Mood,
  turns: StoredTurn[],
  outcome: LiveGuestOutcome,
  debrief: { score: number; wentWell: string; tryNext: string },
): LiveGuestResult {
  return {
    outcome,
    score: debrief.score,
    passed: isPass(outcome, debrief.score),
    wentWell: debrief.wentWell,
    tryNext: debrief.tryNext,
    startMood,
    difficulty,
    dials: dialSummary(brief, startMood, turns),
    turns: revealTurns(brief, turns),
    brief: { wants: brief.wants, calms: brief.calms, setsOff: brief.setsOff, mustDo: brief.mustDo ?? null },
    saved: false,
  };
}

/**
 * One staff reply in a Live Guest conversation: one AI call, which plays the
 * guest and, when the conversation ends, writes the debrief. The transcript
 * lives on the server; the browser only sends its next reply and how many it
 * has sent, so a retry can't be counted twice. See lib/live-guest/engine.ts.
 */
export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    // Per user only: staff on venue Wi-Fi share one IP.
    if (!rateLimit(`live-guest-turn:user:${user.id}`, 20)) {
      return NextResponse.json({ error: "Too many requests. Try again in a minute.", code: "RATE_LIMITED" }, { status: 429 });
    }

    const read = await readJsonBody(req, MAX_BODY_BYTES);
    if (!read.ok) return read.response;
    const { sessionId, turn, reply } = read.body;
    if (typeof sessionId !== "string" || !UUID_PATTERN.test(sessionId) || !Number.isInteger(turn) || (turn as number) < 0) {
      return NextResponse.json({ error: "Invalid request.", code: "INVALID_REQUEST" }, { status: 400 });
    }
    if (typeof reply !== "string" || !reply.trim()) {
      return NextResponse.json({ error: "Type a reply first.", code: "EMPTY_REPLY" }, { status: 400 });
    }
    if (reply.length > LIVE_GUEST_MAX_REPLY_CHARS) {
      return NextResponse.json(
        { error: `Keep it under ${LIVE_GUEST_MAX_REPLY_CHARS} characters, like something you'd say out loud.`, code: "REPLY_TOO_LONG" },
        { status: 400 },
      );
    }
    const staff = cleanUserText(reply);
    const position = turn as number;

    const admin = createSupabaseAdminClient();
    const { data, error: readError } = await admin
      .from("live_guest_sessions")
      .select("id, user_id, guest_id, module_id, difficulty, turns, turn_count, status, result, expires_at")
      .eq("id", sessionId)
      .maybeSingle();
    if (readError) throw readError;
    const session = data as SessionRow | null;
    if (!session || session.user_id !== user.id) {
      return NextResponse.json({ error: "Conversation not found.", code: "NOT_FOUND" }, { status: 404 });
    }

    // The same reply sent again (a dropped connection): answer it from what's stored.
    const last = session.turns[session.turns.length - 1];
    if (session.turn_count === position + 1 && last && last.staff === staff) {
      return NextResponse.json({
        guest: last.guest,
        replies: session.turn_count,
        ended: session.status !== "active",
        result: session.status !== "active" ? session.result : null,
      });
    }
    if (session.status !== "active") {
      return NextResponse.json({ error: "This conversation has finished.", code: "ENDED" }, { status: 409 });
    }
    if (new Date(session.expires_at).getTime() <= Date.now()) {
      return NextResponse.json({ error: "This conversation timed out. Start a new one.", code: "EXPIRED" }, { status: 410 });
    }
    if (session.turn_count !== position) {
      return NextResponse.json({ error: "That reply is out of step. Reload and try again.", code: "TURN_MISMATCH" }, { status: 409 });
    }
    const brief = findGuest(session.guest_id);
    if (!brief) {
      return NextResponse.json({ error: "This guest is no longer available.", code: "UNKNOWN_GUEST" }, { status: 410 });
    }

    const browserSessionId = getCookieValue(req, "sbe_session_id");
    if (!browserSessionId) {
      return NextResponse.json({ error: "Missing active session. Please sign in again.", code: "SESSION_REQUIRED" }, { status: 401 });
    }
    const sessionValidation = await validateSession(admin, user.id, browserSessionId);
    if (!sessionValidation.valid) {
      return NextResponse.json({ error: "Session conflict detected. Please resume this device.", code: "SESSION_CONFLICT" }, { status: 409 });
    }
    const access = await resolveAccess(admin, user.id, user.email ?? "");
    // A plan can lapse mid-conversation; no AI call without it. A taster
    // conversation could only have been started once (see the start route).
    if (!hasLiveGuest(access) && session.guest_id !== TASTER_GUEST_ID) {
      return NextResponse.json(
        { error: "Live Guest is on venue plans. Ask your venue about Serve By Example, or see the plans.", code: "PLAN_REQUIRED" },
        { status: 403 },
      );
    }
    if (!(await consumeAiAllowance(admin, user.id, aiDailyLimitForTier(access.tier)))) {
      return aiDailyLimitResponse(access.tier);
    }

    const replyNumber = position + 1;
    const difficulty = session.difficulty;
    const startMood = startMoodFor(brief, difficulty);
    const moods = session.turns.map((t) => t.mood);
    const previous = stateAfter(brief, startMood, session.turns);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    let completion;
    try {
      completion = await getOpenAIClient().chat.completions.create(
        {
          ...CHAT_MODEL_PARAMS,
          temperature: 0.8,
          max_completion_tokens: MAX_OUTPUT_TOKENS,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: GUEST_SYSTEM_PROMPT },
            { role: "system", content: briefBlock(brief, replyNumber, difficulty, previous, moods) },
            { role: "user", content: conversationBlock(brief, session.turns, staff) },
          ],
        },
        { signal: controller.signal },
      );
    } finally {
      clearTimeout(timeout);
    }

    const parsed = parseModelJson(completion.choices[0]?.message?.content, "live-guest/turn");
    const guestTurn = parsed ? parseGuestTurn(parsed, brief, replyNumber, previous) : null;
    if (!guestTurn) {
      return NextResponse.json({ error: `${brief.name} didn't answer. Send your reply again.`, code: "NO_REPLY" }, { status: 502 });
    }

    const turns: StoredTurn[] = [
      ...session.turns,
      {
        staff,
        guest: guestTurn.reply,
        mood: guestTurn.mood,
        thought: guestTurn.thought,
        speed: guestTurn.speed,
        safety: guestTurn.safety,
        money: guestTurn.money,
      },
    ];
    const ended = guestTurn.outcome !== "continue";
    let result =
      ended && guestTurn.debrief
        ? resultOf(brief, difficulty, startMood, turns, guestTurn.outcome as LiveGuestOutcome, guestTurn.debrief)
        : null;

    // Saved only if no other reply landed first.
    const { data: claimed, error: updateError } = await admin
      .from("live_guest_sessions")
      .update({
        turns,
        turn_count: replyNumber,
        status: ended ? guestTurn.outcome : "active",
        result,
        attempt_id: ended ? session.id : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.id)
      .eq("turn_count", position)
      .eq("status", "active")
      .select("id");
    if (updateError) throw updateError;
    if (!claimed || claimed.length === 0) {
      return NextResponse.json({ error: "That reply is out of step. Reload and try again.", code: "TURN_MISMATCH" }, { status: 409 });
    }

    if (result) {
      try {
        const attempt = await recordAttempt(admin, {
          userId: user.id,
          module: moduleIdToString(brief.moduleId),
          moduleId: brief.moduleId,
          scenarioType: "roleplay",
          scenarioIndex: ROLEPLAY_SCENARIO_INDEX,
          overallScore: result.score / 4,
          confidence: "medium",
          passed: result.passed,
          // The conversation's own id, so a retry can't record it twice.
          attemptId: session.id,
          evaluation: {
            kind: "live_guest",
            guest_id: brief.id,
            difficulty: result.difficulty,
            outcome: result.outcome,
            score: result.score,
            passed: result.passed,
            went_well: result.wentWell,
            try_next: result.tryNext,
          },
        });
        if (!attempt.replayed) {
          await syncMasteryToVenueStaff(admin, user.id);
          // A venue trial's staff talking to a guest is the activation we want.
          if (user.email) await maybeMarkTrialActivated(admin, user.email);
        }
        result = { ...result, saved: true };
        await admin.from("live_guest_sessions").update({ result }).eq("id", session.id);
      } catch (saveError) {
        if (!(saveError instanceof AttemptIdConflictError)) {
          console.error("live-guest/turn: failed to record attempt:", saveError);
        }
      }
    }

    return NextResponse.json({ guest: guestTurn.reply, replies: replyNumber, ended, result });
  } catch (error) {
    console.error("live-guest/turn error:", error);
    await reportError(error, { route: "/api/live-guest/turn", url: req.url });
    return NextResponse.json({ error: "Something went wrong. Send your reply again.", code: "TURN_FAILED" }, { status: 500 });
  }
}
