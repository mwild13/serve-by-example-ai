import { NextResponse } from "next/server";
import { isTrack } from "@/lib/applicant/blueprint";
import { completeTest, computeReport, effectiveStatus, loadAnswers, reportItems, trackLabel, type StoredReport, type TestStatus } from "@/lib/applicant/service";
import { siteOrigin } from "@/lib/site-url";
import { ManagementAccessError, managementErrorResponse, requireManager } from "@/lib/management/auth";

export const dynamic = "force-dynamic";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * GET /api/management/applicants/[id]: one applicant's report, every answer
 * with what was asked, what came back, its score, its time and its signals.
 * Scores are worked out from the answers each time. If a finished test
 * still has written answers to mark or no summary (the background run
 * failed or hasn't finished), this finishes it first, so the manager never
 * reads half a report.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireManager(req, { rateKey: "mgmt-applicants" });
  if (!gate.ok) return gate.response;
  const { user, admin } = gate.ctx;

  try {
    const { id } = await params;
    if (!UUID_PATTERN.test(id)) throw new ManagementAccessError(400, "INVALID_ID", "Invalid id.");
    const { data, error } = await admin
      .from("applicant_tests")
      .select("id, venue_id, applicant_name, applicant_email, track, status, position, run_state, visits, sent_at, started_at, submitted_at, expires_at, created_at, report")
      .eq("id", id)
      .eq("account_id", user.id)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new ManagementAccessError(404, "TEST_NOT_FOUND", "Test not found.");
    const test = data as {
      id: string;
      venue_id: string;
      applicant_name: string;
      applicant_email: string;
      track: string;
      status: TestStatus;
      position: number;
      run_state: { queue: string[] } | null;
      visits: number;
      sent_at: string | null;
      started_at: string | null;
      submitted_at: string | null;
      expires_at: string;
      created_at: string;
      report: StoredReport | null;
    };

    if (test.status === "submitted" && (!test.report?.summary || test.report.pendingScores > 0)) {
      await completeTest(admin, test.id, siteOrigin(req), { notify: false });
    }
    const answers = await loadAnswers(admin, test.id);
    const { data: saved } = await admin.from("applicant_tests").select("report").eq("id", test.id).maybeSingle();
    const summary = (saved?.report as StoredReport | null)?.summary ?? null;
    return NextResponse.json({
      test: {
        id: test.id,
        venueId: test.venue_id,
        applicantName: test.applicant_name,
        applicantEmail: test.applicant_email,
        track: test.track,
        trackLabel: isTrack(test.track) ? trackLabel(test.track) : test.track,
        status: effectiveStatus(test),
        answered: test.position,
        items: test.run_state?.queue.length ?? 0,
        visits: test.visits,
        sentAt: test.sent_at,
        startedAt: test.started_at,
        submittedAt: test.submitted_at,
        expiresAt: test.expires_at,
        createdAt: test.created_at,
      },
      report: computeReport(answers, summary),
      items: reportItems(answers),
    });
  } catch (error) {
    return managementErrorResponse(error, "Could not load the report.", "applicants [id] GET", 500);
  }
}
