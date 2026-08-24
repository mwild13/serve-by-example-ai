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

    // Duty-manager promotion reconciliation. memberships/route.ts's invite
    // handler already promotes an *existing* account immediately by email —
    // this is the fallback for a brand-new invitee: they have no profiles
    // row (or still the "staff" default) until this, their first
    // signup/login, which is also the earliest point their real user_id is
    // known. Runs on every login, not just signup, so it's self-healing if
    // the immediate-promotion path above ever missed. Scoped to
    // platform_role === "staff" only — never touches an existing
    // owner/admin's role, and never re-runs for someone already promoted.
    try {
      const { data: currentProfile } = await admin
        .from("profiles")
        .select("platform_role")
        .eq("id", user.id)
        .single();

      if ((currentProfile?.platform_role ?? "staff") === "staff" && user.email) {
        const { data: dutyManagerGrant } = await admin
          .from("organization_members")
          .select("id")
          .or(`user_id.eq.${user.id},staff_email.ilike.${user.email}`)
          .eq("role", "duty_manager")
          .in("status", ["invited", "active"])
          .limit(1)
          .maybeSingle();

        if (dutyManagerGrant) {
          await admin.from("profiles").update({ platform_role: "duty_manager" }).eq("id", user.id);
          await admin
            .from("organization_members")
            .update({ status: "active", user_id: user.id, updated_at: new Date().toISOString() })
            .eq("id", dutyManagerGrant.id);
        }
      }
    } catch (err) {
      // Never block login/session-stamping on this — worst case, the
      // promotion is retried on the user's next login instead.
      console.warn("Session stamp: duty_manager reconciliation failed:", err);
    }

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
