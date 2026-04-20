import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { generateSessionId, stampSession } from "@/lib/session";

/**
 * POST /api/session/stamp
 *
 * Called immediately after login/signup from the client.
 * Generates a new session UUID, writes it to the profiles table,
 * and returns it so the client can store it as a cookie.
 */
export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionId = generateSessionId();
    const admin = createSupabaseAdminClient();

    await stampSession(admin, user.id, sessionId);

    return NextResponse.json({ sessionId });
  } catch (error) {
    console.error("Session stamp error:", error);
    return NextResponse.json({ error: "Failed to stamp session." }, { status: 500 });
  }
}
