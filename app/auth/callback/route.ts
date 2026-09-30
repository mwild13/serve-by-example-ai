import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

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
      const safePath = next.startsWith("/") ? next : "/dashboard";

      // session_id can arrive as a top-level callback param (Google OAuth path)
      // or embedded inside the next param (email confirmation path).
      const stripeSessionId = searchParams.get("session_id");
      const nextQuery = safePath.includes("?") ? safePath.split("?")[1] : "";
      const embeddedSessionId = new URLSearchParams(nextQuery).get("session_id");
      const finalSessionId = stripeSessionId ?? embeddedSessionId;

      // Management portal redirects bypass the onboarding check — managers
      // don't go through the staff onboarding wizard.
      const isMgmtFlow = safePath.startsWith("/management");

      let redirectTo: string;
      if (isMgmtFlow) {
        redirectTo = safePath;
      } else {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", data.user.id)
          .single();
        redirectTo = profile?.onboarding_completed ? "/dashboard" : "/onboarding";
      }

      if (finalSessionId) {
        const sep = redirectTo.includes("?") ? "&" : "?";
        redirectTo += `${sep}checkout=success&session_id=${finalSessionId}`;
      }

      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth-error`);
}
