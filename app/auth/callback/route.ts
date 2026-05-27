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

      // Support ?next= for portal-specific redirects (e.g. management Google sign-in)
      const next = searchParams.get("next") ?? "/dashboard";
      const safePath = next.startsWith("/") ? next : "/dashboard";
      return NextResponse.redirect(`${origin}${safePath}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth-error`);
}
