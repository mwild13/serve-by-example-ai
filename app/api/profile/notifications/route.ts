import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

// Mobile bug-fix plan, Phase 3a — notification toggles on the new
// /mobile/settings page. A profiles table write, so it goes through an API
// route rather than a direct client-side Supabase call, per CLAUDE.md's
// "never fetch/write the DB directly inside a client component" rule (the
// legacy desktop StaffSettingsPanel wrote directly to profiles for this
// same data — not a pattern to repeat in this newer app tree).

export async function GET(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("profiles")
      .select("notif_reminders, notif_weekly_digest, notif_achievement_alerts")
      .eq("id", user.id)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({
      notifReminders: data?.notif_reminders ?? true,
      notifWeeklyDigest: data?.notif_weekly_digest ?? true,
      notifAchievementAlerts: data?.notif_achievement_alerts ?? true,
    });
  } catch (err) {
    console.error("[profile/notifications] GET failed:", err);
    return NextResponse.json({ error: "Could not load notification preferences." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json()) as {
      notifReminders?: unknown;
      notifWeeklyDigest?: unknown;
      notifAchievementAlerts?: unknown;
    };

    const update: Record<string, boolean> = {};
    if (typeof body.notifReminders === "boolean") update.notif_reminders = body.notifReminders;
    if (typeof body.notifWeeklyDigest === "boolean") update.notif_weekly_digest = body.notifWeeklyDigest;
    if (typeof body.notifAchievementAlerts === "boolean") update.notif_achievement_alerts = body.notifAchievementAlerts;

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No valid fields provided." }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const { error } = await admin.from("profiles").update(update).eq("id", user.id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[profile/notifications] PATCH failed:", err);
    return NextResponse.json({ error: "Could not save notification preferences." }, { status: 500 });
  }
}
