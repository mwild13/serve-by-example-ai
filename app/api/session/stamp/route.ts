import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { generateSessionId, stampSession } from "@/lib/session";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year in seconds

export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // V4 priority-1 fix (2026-08-21): only called from login/session-conflict
    // pages, not polled — 10/min per user+IP is generous headroom for
    // legitimate retries while closing the previously-unrated gap.
    const ip = getClientIp(req);
    if (!rateLimit(`session-stamp:user:${user.id}`, 10) || !rateLimit(`session-stamp:ip:${ip}`, 10)) {
      return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
    }

    const sessionId = generateSessionId();
    const admin = createSupabaseAdminClient();

    await stampSession(admin, user.id, sessionId);

    const res = NextResponse.json({ success: true });
    res.headers.set(
      "Set-Cookie",
      `sbe_session_id=${sessionId}; Path=/; Max-Age=${COOKIE_MAX_AGE}; HttpOnly; SameSite=Lax`
    );
    return res;
  } catch (error) {
    console.error("Session stamp error:", error);
    return NextResponse.json({ error: "Failed to stamp session." }, { status: 500 });
  }
}

// Called on sign-out to clear the HttpOnly cookie server-side
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.headers.set(
    "Set-Cookie",
    "sbe_session_id=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax"
  );
  return res;
}
