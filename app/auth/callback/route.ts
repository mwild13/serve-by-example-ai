import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Create profile for first-time Google users only — don't overwrite existing plan
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", data.user.id)
        .single();

      if (!existing) {
        await supabase.from("profiles").insert({
          id: data.user.id,
          display_name:
            data.user.user_metadata?.full_name ??
            data.user.email?.split("@")[0] ??
            "User",
          plan: "free",
        });
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
