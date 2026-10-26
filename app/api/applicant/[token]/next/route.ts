import { applicantError, applicantServerError, applicantStateResponse, openApplicantTest } from "@/lib/applicant/public-route";
import { serveCurrent } from "@/lib/applicant/service";
import { siteOrigin } from "@/lib/site-url";

export const dynamic = "force-dynamic";

/**
 * POST /api/applicant/[token]/next: the item to answer now, for a return
 * visit or a reload. A POST, not a GET, because serving an item starts its
 * clock and counts the visit.
 */
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const opened = await openApplicantTest(req, token);
    if (!opened.ok) return opened.response;
    if (opened.row.status === "invited") return applicantError(409, "NOT_STARTED", "Start the test first.");
    return applicantStateResponse(await serveCurrent(opened.admin, opened.row, siteOrigin(req)));
  } catch (error) {
    return applicantServerError(error, "applicant next");
  }
}
