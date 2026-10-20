import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { reportError } from "@/lib/report-error";
import { safeEqual } from "@/lib/notifications/unsubscribe-token";
import { dueReminders, sendPush, sydneyClock, vapidConfig, type ReminderRow } from "@/lib/web-push";

// Sends shift reminders by web push (Rich update, Phase 12, part 2).
//
// Called by pg_cron through pg_net every 15 minutes, every day
// (supabase/migrations/20261026_push_reminders.sql), with the shared secret
// in x-cron-secret, the same one the notification emails use. Each run
// finds who is due (dueReminders() in lib/web-push.ts), marks them reminded
// for the day first, so a retry or an overlapping run never sends twice,
// then sends one empty push to each of their browsers.
//
// MAX_PUSHES keeps one run under the Workers Free plan's 50 outbound
// requests. Anyone left over is picked up by the next run, inside the hour.

const MAX_PUSHES = 40;

export async function POST(req: Request) {
  const secret = process.env.NOTIFICATIONS_SECRET;
  if (!secret || !safeEqual(req.headers.get("x-cron-secret") ?? "", secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const config = vapidConfig();
  if (!config) return NextResponse.json({ skipped: "VAPID keys not set" });

  try {
    const admin = createSupabaseAdminClient();
    const clock = sydneyClock(new Date());
    const [{ data: rows, error }, { data: done, error: doneError }] = await Promise.all([
      admin.from("shift_schedules").select("user_id, shift_days, reminder_time, last_reminded_on").not("reminder_time", "is", null),
      admin.from("preshift_days").select("user_id").eq("day", clock.date),
    ]);
    if (error) throw error;
    if (doneError) throw doneError;
    const due = dueReminders((rows ?? []) as ReminderRow[], clock, new Set((done ?? []).map((r) => r.user_id as string)));
    if (due.length === 0) return NextResponse.json({ due: 0, sent: 0 });

    const { data: subs, error: subsError } = await admin
      .from("push_subscriptions")
      .select("id, user_id, endpoint")
      .in("user_id", due)
      .limit(MAX_PUSHES);
    if (subsError) throw subsError;
    // Only people with a browser to send to, and only as many as fit this run.
    const users = [...new Set((subs ?? []).map((s) => s.user_id as string))];
    if (users.length === 0) return NextResponse.json({ due: due.length, sent: 0 });

    // Claim first: only rows not yet reminded today are updated and returned.
    const { data: claimed, error: claimError } = await admin
      .from("shift_schedules")
      .update({ last_reminded_on: clock.date })
      .in("user_id", users)
      .or(`last_reminded_on.is.null,last_reminded_on.lt.${clock.date}`)
      .select("user_id");
    if (claimError) throw claimError;
    const mine = new Set((claimed ?? []).map((r) => r.user_id as string));

    const targets = (subs ?? []).filter((s) => mine.has(s.user_id as string));
    const outcomes = await Promise.all(targets.map(async (s) => ({ id: s.id as string, outcome: await sendPush(s.endpoint as string, config) })));
    const gone = outcomes.filter((o) => o.outcome === "gone").map((o) => o.id);
    if (gone.length > 0) await admin.from("push_subscriptions").delete().in("id", gone);

    return NextResponse.json({
      due: due.length,
      claimed: mine.size,
      sent: outcomes.filter((o) => o.outcome === "sent").length,
      failed: outcomes.filter((o) => o.outcome === "failed").length,
      removed: gone.length,
    });
  } catch (error) {
    console.error("cron/reminders error:", error);
    await reportError(error, { route: "/api/cron/reminders", url: req.url });
    return NextResponse.json({ error: "Reminder run failed." }, { status: 500 });
  }
}
