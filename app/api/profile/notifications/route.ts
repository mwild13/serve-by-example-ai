import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase-server";
import { rateLimit } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { readJsonBody } from "@/lib/ai-guard";
import { syncBrevo, type NotifFlag } from "@/lib/notifications/brevo";

// Mobile bug-fix plan, Phase 3a — notification toggles on the new
// /mobile/settings page. A profiles table write, so it goes through an API
// route rather than a direct client-side Supabase call, per CLAUDE.md's
// "never fetch/write the DB directly inside a client component" rule (the
// legacy desktop StaffSettingsPanel wrote directly to profiles for this
// same data — not a pattern to repeat in this newer app tree).
//
// Notifications pass (2026-08-25):
// - Both flags now default to false (opt-in, not opt-out) — see the
//   SettingsScreen.tsx comment above the notif state for why.
// - "Achievement alerts" removed — notif_achievement_alerts is no longer
//   read or written here; the DB column is left in place, unused.
// - Turning a flag ON (client only calls this after the user confirms the
//   Monday-morning / Sunday-night dialog in SettingsScreen.tsx) now also
//   best-effort adds the user to a Brevo list and sends a branded
//   confirmation email, mirroring the "so it's got our logo etc" ask.
// - Phase 1 follow-up (2026-10-03): Brevo calls are now awaited with a
//   timeout. Un-awaited, a Worker can cancel them once the response returns,
//   so confirmations could be dropped silently. They are still best effort:
//   a Brevo failure is logged and never fails the DB save. Turning a flag
//   OFF now also sets its Brevo attribute to false. Before this, the contact
//   kept the attribute at true, so any Brevo automation keyed on it would
//   have kept emailing people who had opted out.
// - BREVO_NOTIFICATIONS_LIST_ID is optional. If unset, the list-add step is
//   skipped (logged, not thrown) — the confirmation email still sends as
//   long as BREVO_API_KEY is set. Add a "SBE Mobile Notifications" list in
//   Brevo and set that list's numeric id as this env var in Cloudflare
//   Pages to enable list capture (needed for any future scheduled send —
//   see the Brevo Automation note in the mobile plan).
// - 2026-10-05: list membership now follows consent. Once both flags are
//   off, the contact is also removed from the list, so a send aimed at the
//   list alone can't reach someone who opted out.
// - 2026-10-17: the Brevo calls moved to lib/notifications/brevo.ts, shared
//   with the unsubscribe route and the scheduled sender.

export async function GET(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!rateLimit(`profile-notifications-read:user:${user.id}`, 60)) {
      return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
    }

    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("profiles")
      .select("notif_reminders, notif_weekly_digest")
      .eq("id", user.id)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({
      notifReminders: data?.notif_reminders ?? false,
      notifWeeklyDigest: data?.notif_weekly_digest ?? false,
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
    if (!rateLimit(`profile-notifications-write:user:${user.id}`, 10)) {
      return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
    }

    const read = await readJsonBody(req, undefined, { requireJsonContentType: false });
    if (!read.ok) return read.response;
    const body = read.body as {
      notifReminders?: unknown;
      notifWeeklyDigest?: unknown;
    };

    const update: Record<string, boolean> = {};
    if (typeof body.notifReminders === "boolean") update.notif_reminders = body.notifReminders;
    if (typeof body.notifWeeklyDigest === "boolean") update.notif_weekly_digest = body.notifWeeklyDigest;

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No valid fields provided." }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();

    // Desktop settings save both flags on every submit, so only a real
    // off → on change triggers the Brevo list-add + confirmation email.
    const { data: current } = await admin
      .from("profiles")
      .select("notif_reminders, notif_weekly_digest")
      .eq("id", user.id)
      .maybeSingle();

    const { error } = await admin.from("profiles").update(update).eq("id", user.id);
    if (error) throw error;

    // Only real transitions reach Brevo: desktop saves both flags on every
    // submit, and an unchanged flag must not re-send a confirmation.
    const changes: Partial<Record<NotifFlag, boolean>> = {};
    if (typeof update.notif_reminders === "boolean" && update.notif_reminders !== !!current?.notif_reminders) {
      changes.reminders = update.notif_reminders;
    }
    if (typeof update.notif_weekly_digest === "boolean" && update.notif_weekly_digest !== !!current?.notif_weekly_digest) {
      changes.digest = update.notif_weekly_digest;
    }
    if (user.email && Object.keys(changes).length > 0) {
      const subscribedAfter =
        (update.notif_reminders ?? !!current?.notif_reminders) ||
        (update.notif_weekly_digest ?? !!current?.notif_weekly_digest);
      await syncBrevo(user.email, changes, subscribedAfter);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[profile/notifications] PATCH failed:", err);
    return NextResponse.json({ error: "Could not save notification preferences." }, { status: 500 });
  }
}
