import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getUserFromRequest } from "@/lib/supabase-server";
import { resolveAccess, validateSession } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { getCookieValue } from "@/lib/training-attempt";
import { readJsonBody } from "@/lib/ai-guard";
import { findGuest } from "@/lib/live-guest/guests";
import { MAX_REPLIES, SESSION_TTL_MINUTES, publicGuest } from "@/lib/live-guest/engine";
import { guestDifficulty, loadGuestProgress } from "@/lib/live-guest/difficulty";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 1024;
/** Conversations a user can open in START_WINDOW_MINUTES, held in the database. */
const MAX_STARTS_PER_WINDOW = 12;
const START_WINDOW_MINUTES = 60;

/**
 * Opens a Live Guest conversation. The guest's opening line is in the brief,
 * so this makes no AI call. Each reply goes to /api/live-guest/turn.
 */
export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    if (!rateLimit(`live-guest-start:user:${user.id}`, 10)) {
      return NextResponse.json({ error: "Too many requests. Try again in a minute.", code: "RATE_LIMITED" }, { status: 429 });
    }

    const read = await readJsonBody(req, MAX_BODY_BYTES);
    if (!read.ok) return read.response;
    const guest = typeof read.body.guestId === "string" ? findGuest(read.body.guestId) : undefined;
    if (!guest) return NextResponse.json({ error: "That guest isn't available.", code: "UNKNOWN_GUEST" }, { status: 404 });

    const admin = createSupabaseAdminClient();
    const browserSessionId = getCookieValue(req, "sbe_session_id");
    if (!browserSessionId) {
      return NextResponse.json({ error: "Missing active session. Please sign in again.", code: "SESSION_REQUIRED" }, { status: 401 });
    }
    const sessionValidation = await validateSession(admin, user.id, browserSessionId);
    if (!sessionValidation.valid) {
      return NextResponse.json({ error: "Session conflict detected. Please resume this device.", code: "SESSION_CONFLICT" }, { status: 409 });
    }
    const access = await resolveAccess(admin, user.id, user.email ?? "");
    if (!access.allowedModules.includes(guest.moduleId)) {
      return NextResponse.json(
        { error: "Your current plan does not include this guest. Please upgrade.", code: "MODULE_ACCESS_DENIED" },
        { status: 403 },
      );
    }

    const windowStart = new Date(Date.now() - START_WINDOW_MINUTES * 60_000).toISOString();
    const { count, error: countError } = await admin
      .from("live_guest_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", windowStart);
    if (countError) throw countError;
    if ((count ?? 0) >= MAX_STARTS_PER_WINDOW) {
      return NextResponse.json(
        { error: "You've started a lot of conversations this hour. Take a short break and try again.", code: "RATE_LIMITED" },
        { status: 429 },
      );
    }

    // Fixed for the whole conversation.
    const progress = await loadGuestProgress(admin, user.id);
    const difficulty = guestDifficulty(guest, progress);

    const expiresAt = new Date(Date.now() + SESSION_TTL_MINUTES * 60_000).toISOString();
    const { data: session, error: insertError } = await admin
      .from("live_guest_sessions")
      .insert({ user_id: user.id, guest_id: guest.id, module_id: guest.moduleId, difficulty, expires_at: expiresAt })
      .select("id")
      .single();
    if (insertError || !session) throw insertError ?? new Error("live_guest_sessions insert returned no row");

    return NextResponse.json({
      sessionId: session.id,
      guest: publicGuest(guest, {
        available: true,
        difficulty,
        passed: progress.passedGuests.has(guest.id),
        suggested: false,
      }),
      maxReplies: MAX_REPLIES,
    });
  } catch (error) {
    console.error("live-guest/start error:", error);
    return NextResponse.json({ error: "Could not start the conversation. Please try again.", code: "START_FAILED" }, { status: 500 });
  }
}
