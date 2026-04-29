import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { generateSessionId, stampSession } from "@/lib/session";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year in seconds

export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
