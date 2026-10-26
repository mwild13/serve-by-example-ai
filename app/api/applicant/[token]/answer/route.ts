import { readJsonBody } from "@/lib/ai-guard";
import { applicantError, applicantServerError, applicantStateResponse, openApplicantTest } from "@/lib/applicant/public-route";
import { recordAnswer } from "@/lib/applicant/service";
import { emailLinkOrigin } from "@/lib/site-url";

export const dynamic = "force-dynamic";

/** A 2,000 character answer, written in any script, and the signals. */
const MAX_BODY_BYTES = 12 * 1024;

/**
 * POST /api/applicant/[token]/answer { position, answer, signals }: one
 * answer to the item on screen. Quiz and ordering items are scored here;
 * written answers wait for the AI marker. Replies with the next item, or
 * the finished screen after the last one.
 */
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const opened = await openApplicantTest(req, token);
    if (!opened.ok) return opened.response;

    const read = await readJsonBody(req, MAX_BODY_BYTES);
    if (!read.ok) return read.response;

    const result = await recordAnswer(opened.admin, opened.row, read.body, emailLinkOrigin(req));
    if (!result.ok) return applicantError(result.status, result.code, result.error);
    return applicantStateResponse(result.state);
  } catch (error) {
    return applicantServerError(error, "applicant answer");
  }
}
