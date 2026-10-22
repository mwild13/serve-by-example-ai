import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { generateSessionId, stampSession } from "@/lib/session";
import { isMobilePhoneUserAgent } from "@/lib/user-agent";

// The one-device session cookie, as /api/session/stamp sets it.
const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // The on_auth_user_created trigger creates the profiles row (id, email)
      // for every new user, so this only fills in a first-time Google user's
      // display name — never tier/plan. Runs on the admin client: clients
      // can no longer write profiles (audit 2026-09-30, Phase 2).
      const googleName = data.user.user_metadata?.full_name;
      if (typeof googleName === "string" && googleName.trim()) {
        const admin = createSupabaseAdminClient();
        await admin
          .from("profiles")
          .update({ display_name: googleName.trim().slice(0, 80) })
          .eq("id", data.user.id)
          .is("display_name", null);
      }

      const next = searchParams.get("next") ?? "/dashboard";
      // A path on this site only: "//host" and "/\\host" are read by
      // browsers as another site.
      const safePath = /^\/(?![/\\])/.test(next) ? next : "/dashboard";

      // session_id can arrive as a top-level callback param (Google OAuth path)
      // or embedded inside the next param (email confirmation path).
      const stripeSessionId = searchParams.get("session_id");
      const nextQuery = safePath.includes("?") ? safePath.split("?")[1] : "";
      const embeddedSessionId = new URLSearchParams(nextQuery).get("session_id");
      const rawSessionId = stripeSessionId ?? embeddedSessionId;
      // A Stripe Checkout id, nothing else, goes back on the URL.
      const finalSessionId = rawSessionId && /^cs_[A-Za-z0-9_]{1,250}$/.test(rawSessionId) ? rawSessionId : null;

      // Management portal redirects bypass the onboarding check — managers
      // don't go through the staff onboarding wizard.
      const isMgmtFlow = safePath.startsWith("/management");
      // A visitor who picked a paid plan while signed out goes back to
      // /membership, which starts checkout (see resumeCheckoutPath in
      // app/login/page.tsx). Onboarding follows the payment.
      const resumesCheckout = /^\/membership\?checkout_plan=[a-z_]{1,40}$/.test(safePath);

      let redirectTo: string;
      if (isMgmtFlow || resumesCheckout) {
        redirectTo = safePath;
      } else {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", data.user.id)
          .single();
        // A phone goes straight to the mobile app, which middleware.ts
        // would otherwise do with one more redirect. Not back from Stripe:
        // /dashboard confirms the payment first.
        const phone = isMobilePhoneUserAgent(request.headers.get("user-agent") ?? "");
        const staffHome = phone && !finalSessionId ? "/mobile/home" : "/dashboard";
        redirectTo = profile?.onboarding_completed ? staffHome : "/onboarding";
      }

      if (finalSessionId) {
        const sep = redirectTo.includes("?") ? "&" : "?";
        redirectTo += `${sep}checkout=success&session_id=${finalSessionId}`;
      }

      // An account made in the last two minutes is a sign-up, not a sign-in.
      // components/ConversionEvents.tsx reads this and removes it from the URL.
      const createdMs = Date.parse(data.user.created_at ?? "");
      const isGoogle = data.user.app_metadata?.provider === "google";
      if (isGoogle && Number.isFinite(createdMs) && Date.now() - createdMs < 120_000) {
        redirectTo += `${redirectTo.includes("?") ? "&" : "?"}signup=google`;
      }

      // Signing in makes this the account's one active device, as the
      // password sign-in does through /api/session/stamp. Without it a Google
      // sign-in had no session cookie, so drills and quizzes refused it.
      const sessionId = generateSessionId();
      await stampSession(createSupabaseAdminClient(), data.user.id, sessionId);
      const response = NextResponse.redirect(`${origin}${redirectTo}`);
      response.headers.append("Set-Cookie", `sbe_session_id=${sessionId}; Path=/; Max-Age=${SESSION_COOKIE_MAX_AGE}; HttpOnly; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`);
      return response;
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth-error`);
}
