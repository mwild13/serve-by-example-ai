import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { reportError } from "@/lib/report-error";
import { siteOrigin } from "@/lib/site-url";
import { nameFromEmail } from "@/lib/person-name";
import { sendScheduledEmail } from "@/lib/notifications/brevo";
import { sundayReminderEmail, weeklyDigestEmail, type NotificationStats } from "@/lib/notifications/emails";
import { dueSends, isNotificationKind, sendFor, sydneyTime, type DueSend } from "@/lib/notifications/schedule";
import {
  safeEqual,
  unsubscribeApiUrl,
  unsubscribePageUrl,
  unsubscribeToken,
  type UnsubscribeKind,
} from "@/lib/notifications/unsubscribe-token";

// Sends the weekly digest (Monday morning) and the Sunday reminder to the
// people who switched them on in Settings > Notifications.
//
// Called by pg_cron through pg_net every 15 minutes on Sunday and Monday UTC
// (supabase/migrations/20261017_notification_sender.sql) with the shared
// secret in x-cron-secret. Most calls land outside both send windows and
// return at once. Inside a window, each call claims up to BATCH_SIZE people
// who have not had that day's email, sends, and records the result, so the
// 15-minute runs work through the list and a retry or overlap never sends
// twice.
//
// BATCH_SIZE keeps one call under the Workers Free plan's 50 outbound
// requests (one claim, the sends, one finish). Four runs an hour over a
// four- or five-hour window is about 700 to 800 emails per window. Past
// that, buy Workers Paid (1,000 subrequests) and raise it.
//
// Manual run, for testing (same secret):
//   POST {"force": "weekly_digest"}   sends now, outside the window
//   POST {"dryRun": true}             reports what is due, sends nothing

const BATCH_SIZE = 40;

type ClaimRow = {
  user_id: string;
  email: string;
  display_name: string | null;
  days_trained: number;
  quiz_answers: number;
  quizzes_passed: number;
  scenarios: number;
  modules_mastered: number;
  reviews_due: number;
};

type RunResult = DueSend & { claimed: number; sent: number; failed: number };

function flagFor(kind: DueSend["kind"]): UnsubscribeKind {
  return kind === "weekly_digest" ? "digest" : "reminders";
}

async function runSend(send: DueSend, secret: string, brevoApiKey: string, origin: string): Promise<RunResult> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.rpc("claim_notification_batch", {
    p_kind: send.kind,
    p_period: send.period,
    p_from: send.from,
    p_to: send.to,
    p_limit: BATCH_SIZE,
  });
  if (error) throw error;
  const rows = (data ?? []) as ClaimRow[];
  if (rows.length === 0) return { ...send, claimed: 0, sent: 0, failed: 0 };

  const flag = flagFor(send.kind);
  const outcomes = await Promise.all(
    rows.map(async (row) => {
      const token = await unsubscribeToken(secret, row.user_id, flag);
      const stats: NotificationStats = {
        // No name set yet: use the one the app shows elsewhere (info@ reads "Info").
        displayName: row.display_name?.trim() || nameFromEmail(row.email) || null,
        daysTrained: row.days_trained,
        quizAnswers: row.quiz_answers,
        quizzesPassed: row.quizzes_passed,
        scenarios: row.scenarios,
        modulesMastered: row.modules_mastered,
        reviewsDue: row.reviews_due,
      };
      const links = {
        trainingUrl: `${origin}/dashboard`,
        unsubscribeUrl: unsubscribePageUrl(origin, row.user_id, flag, token),
      };
      const email = send.kind === "weekly_digest"
        ? weeklyDigestEmail(stats, { from: send.from, to: send.to }, links)
        : sundayReminderEmail(stats, links);
      const ok = await sendScheduledEmail(brevoApiKey, {
        to: row.email,
        subject: email.subject,
        html: email.html,
        oneClickUnsubscribeUrl: unsubscribeApiUrl(origin, row.user_id, flag, token),
        tag: send.kind,
      });
      return { userId: row.user_id, ok };
    }),
  );

  const sent = outcomes.filter((o) => o.ok).map((o) => o.userId);
  const failed = outcomes.filter((o) => !o.ok).map((o) => o.userId);
  const { error: finishError } = await admin.rpc("finish_notification_batch", {
    p_kind: send.kind,
    p_period: send.period,
    p_sent: sent,
    p_failed: failed,
  });
  if (finishError) throw finishError;

  return { ...send, claimed: rows.length, sent: sent.length, failed: failed.length };
}

export async function POST(req: Request) {
  // A wrong secret is refused below; this only stops a flood of guesses.
  if (!rateLimit(`cron-notifications:ip:${getClientIp(req)}`, 20)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const secret = process.env.NOTIFICATIONS_SECRET;
  if (!secret) {
    console.error("[cron/notifications] NOTIFICATIONS_SECRET is not set; nothing sent.");
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }
  if (!safeEqual(req.headers.get("x-cron-secret") ?? "", secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { force?: unknown; dryRun?: unknown };
  const now = new Date();
  const sends = isNotificationKind(body.force) ? [sendFor(body.force, sydneyTime(now).date)] : dueSends(now);

  if (sends.length === 0 || body.dryRun === true) {
    return NextResponse.json({ ok: true, sydney: sydneyTime(now), due: sends, sent: [] });
  }

  const brevoApiKey = process.env.BREVO_API_KEY;
  if (!brevoApiKey) {
    // Checked before claiming, so nobody is marked as sent.
    console.error("[cron/notifications] BREVO_API_KEY is not set; nothing sent.");
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const origin = siteOrigin(req);
  const results: RunResult[] = [];
  try {
    for (const send of sends) {
      results.push(await runSend(send, secret, brevoApiKey, origin));
    }
  } catch (error) {
    console.error("[cron/notifications] run failed:", error);
    await reportError(error, { route: "/api/cron/notifications", url: req.url });
    return NextResponse.json({ error: "Run failed.", results }, { status: 500 });
  }

  console.log(JSON.stringify({ event: "notifications_run", results }));
  return NextResponse.json({ ok: true, sydney: sydneyTime(now), sent: results });
}
