import { NextResponse } from "next/server";
import { completeTest, needsCompleting, type StoredReport } from "@/lib/applicant/service";
import { safeEqual } from "@/lib/notifications/unsubscribe-token";
import { reportError } from "@/lib/report-error";
import { siteOrigin } from "@/lib/site-url";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

// The safety net for applicant test marking (docs/APPLICANT_TESTING.md §4).
// Written answers are normally marked in the background as the applicant
// goes, and the summary once they finish. If that run failed (OpenAI was
// busy, the Worker ran out of time), this finishes it: the oldest finished
// test with an answer still to mark or no summary, and the manager's
// "has finished" email if it never went.
//
// Called by pg_cron through pg_net every 5 minutes
// (supabase/migrations/20261105_applicant_marking_cron.sql), with the shared
// secret in x-cron-secret, like the reminders. A test is left alone for its
// first 5 minutes, so the background run normally gets there first, and
// after 7 days, when the 10 call AI budget is long spent anyway.
//
// One test a run keeps it inside the Workers Free plan's 50 outbound
// requests (a test with four unmarked answers takes about 25).

const GRACE_MINUTES = 5;
const GIVE_UP_DAYS = 7;
const CANDIDATES = 50;

export async function POST(req: Request) {
  const secret = process.env.NOTIFICATIONS_SECRET;
  if (!secret || !safeEqual(req.headers.get("x-cron-secret") ?? "", secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const admin = createSupabaseAdminClient();
    const now = Date.now();
    const { data, error } = await admin
      .from("applicant_tests")
      .select("id, report")
      .eq("status", "submitted")
      .lt("submitted_at", new Date(now - GRACE_MINUTES * 60_000).toISOString())
      .gt("submitted_at", new Date(now - GIVE_UP_DAYS * 86_400_000).toISOString())
      .order("submitted_at", { ascending: true })
      .limit(CANDIDATES);
    if (error) throw error;

    const next = ((data ?? []) as { id: string; report: StoredReport | null }[]).find((t) => needsCompleting(t.report));
    if (!next) return NextResponse.json({ completed: 0 });

    const report = await completeTest(admin, next.id, siteOrigin(req), { notify: true });
    return NextResponse.json({ completed: 1, stillPending: report ? needsCompleting(report) : false });
  } catch (error) {
    await reportError(error, { route: "/api/cron/applicant-marking", url: req.url });
    return NextResponse.json({ error: "Applicant marking failed" }, { status: 500 });
  }
}
