// The guard every applicant route starts with (app/api/applicant/[token]/*).
// There is no sign-in: the link token is the only key, so it's checked for
// shape before any database work and looked up by its hash. Limits run first,
// per IP, per link, and across everyone, so a flood costs almost nothing.
import "server-only";
import type { ApplicantState } from "@/lib/applicant/client";
import { findTestByToken, isMissingTable, type TestRow } from "@/lib/applicant/service";
import { isApplicantTokenShape } from "@/lib/applicant/token";
import type { AdminClient } from "@/lib/management/auth";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

/** Per link per minute: far more than anyone answering questions needs. */
const PER_TOKEN_PER_MINUTE = 30;
const PER_IP_PER_MINUTE = 60;
/** Per isolate, across every applicant: the circuit breaker. */
const GLOBAL_PER_MINUTE = 600;

const NOT_FOUND = "This link isn't working. Ask the venue to send it again.";

export function applicantError(status: number, code: string, error: string): Response {
  return Response.json({ error, code }, { status, headers: { "Cache-Control": "no-store" } });
}

export function applicantStateResponse(state: ApplicantState): Response {
  return Response.json({ state }, { headers: { "Cache-Control": "no-store" } });
}

export type OpenedTest = { ok: true; admin: AdminClient; row: TestRow } | { ok: false; response: Response };

export async function openApplicantTest(req: Request, token: string): Promise<OpenedTest> {
  const ip = getClientIp(req);
  if (!rateLimit(`applicant:ip:${ip}`, PER_IP_PER_MINUTE) || !rateLimit("applicant:global", GLOBAL_PER_MINUTE)) {
    return { ok: false, response: applicantError(429, "RATE_LIMITED", "Too many requests. Wait a minute and try again.") };
  }
  if (!isApplicantTokenShape(token)) return { ok: false, response: applicantError(404, "NOT_FOUND", NOT_FOUND) };
  if (!rateLimit(`applicant:token:${token}`, PER_TOKEN_PER_MINUTE)) {
    return { ok: false, response: applicantError(429, "RATE_LIMITED", "Too many requests. Wait a minute and try again.") };
  }

  const admin = createSupabaseAdminClient();
  try {
    const row = await findTestByToken(admin, token);
    if (!row) return { ok: false, response: applicantError(404, "NOT_FOUND", NOT_FOUND) };
    return { ok: true, admin, row };
  } catch (error) {
    if (isMissingTable(error as { code?: string })) return { ok: false, response: applicantError(404, "NOT_FOUND", NOT_FOUND) };
    throw error;
  }
}

/** Logs the detail, tells the applicant something they can act on. */
export function applicantServerError(error: unknown, route: string): Response {
  console.error(JSON.stringify({ event: "applicant_route_error", route, message: error instanceof Error ? error.message : String(error) }));
  return applicantError(500, "SERVER_ERROR", "Something went wrong on our side. Your answers so far are saved. Try again in a moment.");
}
