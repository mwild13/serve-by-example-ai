import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase-server";
import { rateLimit } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { readJsonBody } from "@/lib/ai-guard";
import { isInstallPlatform } from "@/lib/install-platform";

// Records the first time someone opens the app from their Home Screen
// (docs/STAFF_MOBILE_REDESIGN_PLAN.md section 4.4), for the install count in
// docs/FUNNEL_METRICS.md. Only the first launch is kept. Copes with the
// columns not being there yet (supabase/migrations/20261101_app_installed_at.sql).
export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!rateLimit(`profile-app-installed:user:${user.id}`, 5)) {
      return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
    }

    const read = await readJsonBody(req, undefined, { requireJsonContentType: false });
    if (!read.ok) return read.response;
    const { platform } = read.body;
    if (!isInstallPlatform(platform)) {
      return NextResponse.json({ error: "Unknown platform." }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const { error } = await admin
      .from("profiles")
      .update({ app_installed_at: new Date().toISOString(), app_install_platform: platform })
      .eq("id", user.id)
      .is("app_installed_at", null);

    // 42703: the column doesn't exist yet. Nothing to record into.
    if (error && error.code !== "42703") throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("App installed error:", err);
    return NextResponse.json({ error: "Could not record the install." }, { status: 500 });
  }
}
