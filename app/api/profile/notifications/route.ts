import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { brandedEmailHtml } from "@/lib/email-template";

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
//   confirmation email, mirroring the "so it's got our logo etc" ask. Both
//   are non-blocking — a Brevo failure never fails the underlying DB save,
//   same "best-effort, don't block the primary action" pattern as
//   app/api/toolkit-capture/route.ts's non-awaited email send.
// - BREVO_NOTIFICATIONS_LIST_ID is optional. If unset, the list-add step is
//   skipped (logged, not thrown) — the confirmation email still sends as
//   long as BREVO_API_KEY is set. Add a "SBE Mobile Notifications" list in
//   Brevo and set that list's numeric id as this env var in Cloudflare
//   Pages to enable list capture (needed for any future scheduled send —
//   see the Brevo Automation note in the mobile plan).

async function notifyBrevo(email: string, which: "reminders" | "digest") {
  const brevoApiKey = process.env.BREVO_API_KEY;
  if (!brevoApiKey) {
    console.warn("[profile/notifications] BREVO_API_KEY not set — skipping list add + confirmation email");
    return;
  }

  const listId = process.env.BREVO_NOTIFICATIONS_LIST_ID;
  const attributeKey = which === "digest" ? "WEEKLY_DIGEST" : "SUNDAY_REMINDER";

  // Add/update the contact — non-blocking, errors are logged only.
  fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: { "api-key": brevoApiKey, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      email,
      attributes: { [attributeKey]: true },
      ...(listId ? { listIds: [Number(listId)] } : {}),
      updateEnabled: true,
    }),
  }).catch((err) => console.error("[profile/notifications] Brevo contact upsert failed:", err));

  // Branded confirmation email — same non-blocking treatment.
  const heading = which === "digest" ? "You're subscribed to the weekly progress digest" : "You're subscribed to training reminders";
  const bodyHtml =
    which === "digest"
      ? `<p style="margin:0 0 12px;line-height:1.65;color:#172f22">You'll get a short summary of your training progress every <strong>Monday morning</strong>.</p>
         <p style="margin:0;line-height:1.65;color:#172f22">You can turn this off any time from Settings &gt; Notifications in the app.</p>`
      : `<p style="margin:0 0 12px;line-height:1.65;color:#172f22">You'll get a training reminder every <strong>Sunday night</strong> to help you get ready for the week ahead.</p>
         <p style="margin:0;line-height:1.65;color:#172f22">You can turn this off any time from Settings &gt; Notifications in the app.</p>`;

  fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": brevoApiKey, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      sender: { name: process.env.BREVO_FROM_NAME ?? "Serve By Example", email: "info@servebyexample.co" },
      to: [{ email }],
      subject: heading,
      htmlContent: brandedEmailHtml({ heading, bodyHtml }),
    }),
  }).catch((err) => console.error("[profile/notifications] Brevo confirmation email failed:", err));
}

export async function GET(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

    const body = (await req.json()) as {
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
    const { error } = await admin.from("profiles").update(update).eq("id", user.id);
    if (error) throw error;

    if (user.email) {
      if (body.notifReminders === true) void notifyBrevo(user.email, "reminders");
      if (body.notifWeeklyDigest === true) void notifyBrevo(user.email, "digest");
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[profile/notifications] PATCH failed:", err);
    return NextResponse.json({ error: "Could not save notification preferences." }, { status: 500 });
  }
}
