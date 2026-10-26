import { readJsonBody } from "@/lib/ai-guard";
import { applicantError, applicantServerError, applicantStateResponse, openApplicantTest } from "@/lib/applicant/public-route";
import { startTest } from "@/lib/applicant/service";
import { siteOrigin } from "@/lib/site-url";

export const dynamic = "force-dynamic";

/**
 * POST /api/applicant/[token]/start { consent: true }: the applicant has read
 * the collection notice and agreed. Records the consent, starts the test and
 * serves the first item. Starting again just returns where they are.
 */
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const opened = await openApplicantTest(req, token);
    if (!opened.ok) return opened.response;

    const read = await readJsonBody(req, 512);
    if (!read.ok) return read.response;
    if (read.body.consent !== true) return applicantError(400, "CONSENT_REQUIRED", "Tick the box to say you've read how your answers are used.");

    return applicantStateResponse(await startTest(opened.admin, opened.row, siteOrigin(req)));
  } catch (error) {
    return applicantServerError(error, "applicant start");
  }
}
