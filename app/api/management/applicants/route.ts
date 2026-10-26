import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/ai-guard";
import { monthlyApplicantTests, sydneyMonthStart } from "@/lib/applicant/allowance";
import { drawTest, isTrack, SECTIONS } from "@/lib/applicant/blueprint";
import { trackSources } from "@/lib/applicant/content";
import { applicantInviteEmail, defaultIntro, senderNameFor } from "@/lib/applicant/emails";
import {
  effectiveStatus,
  expiryFrom,
  isMissingTable,
  trackLabel,
  type StoredReport,
  type TestStatus,
} from "@/lib/applicant/service";
import { applicantTestUrl, createApplicantToken } from "@/lib/applicant/token";
import { formText } from "@/lib/email-template";
import { ManagementAccessError, managementErrorResponse, requireManager, type AdminClient } from "@/lib/management/auth";
import { sendTransactionalEmail } from "@/lib/notifications/brevo";
import { formatPersonName } from "@/lib/person-name";
import { siteOrigin } from "@/lib/site-url";
import { secureRandom } from "@/lib/verify-quiz";

export const dynamic = "force-dynamic";

/**
 * Applicant Testing (docs/APPLICANT_TESTING.md §7), the console side.
 *
 * GET    ?venueId=   the venue's tests, newest first, and the month's allowance
 * POST   { venueId, applicantName, applicantEmail, track, introMessage? }
 *                    deals a test, takes one from the allowance, emails the link
 * PATCH  { id, action: "resend" | "withdraw" }
 *                    resend: a new link (the old one stops working) and 14 fresh days
 * DELETE ?id=        erases one applicant's test and answers (owners only)
 *
 * Tests belong to the account that owns the venue (account_id). Duty managers
 * can invite and read, as they often hire for the floor.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_INTRO_CHARS = 2_000;
const LIST_LIMIT = 200;

const SETUP_NEEDED = { setupNeeded: true, tests: [], allowance: null };

type ListRow = {
  id: string;
  applicant_name: string;
  applicant_email: string;
  track: string;
  status: TestStatus;
  position: number;
  run_state: { queue: string[] } | null;
  sent_at: string | null;
  started_at: string | null;
  submitted_at: string | null;
  expires_at: string;
  created_at: string;
  report: StoredReport | null;
};

async function allowanceFor(admin: AdminClient, accountId: string, limit: number) {
  const month = sydneyMonthStart(new Date());
  const { data, error } = await admin
    .from("applicant_test_usage")
    .select("tests_sent")
    .eq("account_id", accountId)
    .eq("month", month)
    .maybeSingle();
  if (error) throw error;
  const used = (data?.tests_sent as number | undefined) ?? 0;
  return { month, used, limit, left: Math.max(0, limit - used) };
}

async function venueName(admin: AdminClient, venueId: string): Promise<string> {
  const { data } = await admin.from("venues").select("name").eq("id", venueId).maybeSingle();
  return ((data?.name as string | undefined) ?? "").trim() || "our venue";
}

async function managerReplyTo(admin: AdminClient, userId: string, email: string | undefined) {
  const { data } = await admin.from("profiles").select("full_name").eq("id", userId).maybeSingle();
  const name = ((data?.full_name as string | undefined) ?? "").trim();
  return email ? { email, ...(name ? { name } : {}) } : undefined;
}

async function sendInvite(
  admin: AdminClient,
  req: Request,
  opts: { venueId: string; applicantName: string; applicantEmail: string; intro: string; token: string; expiresAt: string; managerId: string; managerEmail?: string },
): Promise<{ sent: boolean; error: string | null }> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return { sent: false, error: "Email sending is not configured for this environment." };
  const name = await venueName(admin, opts.venueId);
  const email = applicantInviteEmail({
    venueName: name,
    applicantName: opts.applicantName,
    intro: opts.intro,
    url: applicantTestUrl(siteOrigin(req), opts.token),
    expiresAt: new Date(opts.expiresAt),
  });
  const sent = await sendTransactionalEmail(apiKey, {
    to: opts.applicantEmail,
    subject: email.subject,
    html: email.html,
    tag: "applicant_invite",
    senderName: senderNameFor(name),
    replyTo: await managerReplyTo(admin, opts.managerId, opts.managerEmail),
  });
  return sent ? { sent: true, error: null } : { sent: false, error: "The email could not be sent. Try Resend in a minute." };
}

function listItem(row: ListRow) {
  return {
    id: row.id,
    applicantName: row.applicant_name,
    applicantEmail: row.applicant_email,
    track: row.track,
    trackLabel: isTrack(row.track) ? trackLabel(row.track) : row.track,
    status: effectiveStatus(row),
    answered: row.position,
    items: row.run_state?.queue.length ?? 0,
    sentAt: row.sent_at,
    startedAt: row.started_at,
    submittedAt: row.submitted_at,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    overall: row.report?.overall ?? null,
    band: row.report?.band ?? null,
    flagCount: row.report?.signals.flagCount ?? 0,
  };
}

export async function GET(req: Request) {
  const gate = await requireManager(req, { rateKey: "mgmt-applicants" });
  if (!gate.ok) return gate.response;
  const { user, admin, entitlement, onTrial, assertOwnsVenue } = gate.ctx;

  try {
    const venueId = new URL(req.url).searchParams.get("venueId") ?? "";
    if (!UUID_PATTERN.test(venueId)) return NextResponse.json({ error: "Invalid venueId." }, { status: 400 });
    await assertOwnsVenue(venueId);

    const { data, error } = await admin
      .from("applicant_tests")
      .select("id, applicant_name, applicant_email, track, status, position, run_state, sent_at, started_at, submitted_at, expires_at, created_at, report")
      .eq("venue_id", venueId)
      .eq("account_id", user.id)
      .order("created_at", { ascending: false })
      .limit(LIST_LIMIT);
    if (isMissingTable(error)) return NextResponse.json(SETUP_NEEDED);
    if (error) throw error;

    return NextResponse.json({
      setupNeeded: false,
      tests: ((data ?? []) as ListRow[]).map(listItem),
      allowance: await allowanceFor(admin, user.id, monthlyApplicantTests(entitlement.tier, onTrial)),
      tracks: (["bar", "floor", "kitchen", "management"] as const).map((id) => ({
        id,
        label: trackLabel(id),
        ready: drawTest(trackSources(id), secureRandom).ok,
      })),
      defaultIntro: defaultIntro(await venueName(admin, venueId)),
      sections: SECTIONS.map(({ id, label }) => ({ id, label })),
    });
  } catch (error) {
    return managementErrorResponse(error, "Could not load applicant tests.", "applicants GET", 500);
  }
}

export async function POST(req: Request) {
  // Sends an email from our domain: the same tight limit as staff invites.
  const gate = await requireManager(req, { rateKey: "mgmt-applicants-invite", limit: 10 });
  if (!gate.ok) return gate.response;
  const { user, admin, entitlement, onTrial, assertOwnsVenue } = gate.ctx;

  try {
    const read = await readJsonBody(req, 8 * 1024);
    if (!read.ok) return read.response;
    const body = read.body;

    const venueId = typeof body.venueId === "string" ? body.venueId : "";
    if (!UUID_PATTERN.test(venueId)) return NextResponse.json({ error: "Invalid venueId." }, { status: 400 });
    const applicantName = formatPersonName(formText(body.applicantName, 120));
    if (!applicantName) return NextResponse.json({ error: "Add the applicant's name." }, { status: 400 });
    const applicantEmail = formText(body.applicantEmail, 254).toLowerCase();
    if (!EMAIL_REGEX.test(applicantEmail)) return NextResponse.json({ error: "Add a valid email address." }, { status: 400 });
    if (!isTrack(body.track)) return NextResponse.json({ error: "Choose the role they're applying for." }, { status: 400 });
    const track = body.track;
    if (typeof body.introMessage === "string" && body.introMessage.length > MAX_INTRO_CHARS) {
      return NextResponse.json({ error: `Keep the message under ${MAX_INTRO_CHARS} characters.` }, { status: 400 });
    }
    await assertOwnsVenue(venueId);

    const limit = monthlyApplicantTests(entitlement.tier, onTrial);
    if (limit === 0) {
      return NextResponse.json({ error: "Applicant tests are on the Boutique and Commercial plans.", code: "PLAN_REQUIRED" }, { status: 403 });
    }

    const drawn = drawTest(trackSources(track), secureRandom);
    if (!drawn.ok) {
      return NextResponse.json({ error: `The ${trackLabel(track).toLowerCase()} test isn't ready yet.`, code: "TRACK_NOT_READY" }, { status: 409 });
    }

    const { data: open, error: openError } = await admin
      .from("applicant_tests")
      .select("id, status, expires_at")
      .eq("venue_id", venueId)
      .eq("applicant_email", applicantEmail)
      .in("status", ["invited", "started"]);
    if (isMissingTable(openError)) return NextResponse.json({ error: "Applicant Testing isn't set up yet.", code: "SETUP_NEEDED" }, { status: 503 });
    if (openError) throw openError;
    if ((open ?? []).some((t) => effectiveStatus(t as { status: TestStatus; expires_at: string }) !== "expired")) {
      return NextResponse.json({ error: "This person already has a test open. Use Resend to send the link again.", code: "ALREADY_INVITED" }, { status: 409 });
    }

    const { data: claimed, error: claimError } = await admin.rpc("claim_applicant_test", {
      p_account: user.id,
      p_month: sydneyMonthStart(new Date()),
      p_limit: limit,
    });
    if (claimError) throw claimError;
    if (claimed !== true) {
      return NextResponse.json({ error: `You've sent all ${limit} tests for this month.`, code: "ALLOWANCE_USED" }, { status: 403 });
    }

    const introMessage = formText(body.introMessage, MAX_INTRO_CHARS) || defaultIntro(await venueName(admin, venueId));
    const { token, hash } = await createApplicantToken();
    const expiresAt = expiryFrom(new Date());
    const { data: inserted, error: insertError } = await admin
      .from("applicant_tests")
      .insert({
        venue_id: venueId,
        account_id: user.id,
        created_by: user.id,
        applicant_name: applicantName,
        applicant_email: applicantEmail,
        track,
        intro_message: introMessage,
        token_hash: hash,
        run_state: drawn.plan,
        expires_at: expiresAt,
      })
      .select("id")
      .single();
    if (insertError) throw insertError;

    const invite = await sendInvite(admin, req, { venueId, applicantName, applicantEmail, intro: introMessage, token, expiresAt, managerId: user.id, managerEmail: user.email });
    if (invite.sent) {
      await admin.from("applicant_tests").update({ sent_at: new Date().toISOString() }).eq("id", inserted.id);
    }
    return NextResponse.json({ id: inserted.id, inviteSent: invite.sent, inviteEmailError: invite.error });
  } catch (error) {
    return managementErrorResponse(error, "Could not send the test.", "applicants POST", 500);
  }
}

async function ownedTest(admin: AdminClient, accountId: string, id: unknown) {
  if (typeof id !== "string" || !UUID_PATTERN.test(id)) throw new ManagementAccessError(400, "INVALID_ID", "Invalid id.");
  const { data, error } = await admin
    .from("applicant_tests")
    .select("id, venue_id, applicant_name, applicant_email, intro_message, status, expires_at")
    .eq("id", id)
    .eq("account_id", accountId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new ManagementAccessError(404, "TEST_NOT_FOUND", "Test not found.");
  return data as { id: string; venue_id: string; applicant_name: string; applicant_email: string; intro_message: string | null; status: TestStatus; expires_at: string };
}

export async function PATCH(req: Request) {
  const gate = await requireManager(req, { rateKey: "mgmt-applicants-invite", limit: 10 });
  if (!gate.ok) return gate.response;
  const { user, admin } = gate.ctx;

  try {
    const read = await readJsonBody(req, 2 * 1024);
    if (!read.ok) return read.response;
    const test = await ownedTest(admin, user.id, read.body.id);
    const action = read.body.action;

    if (action === "withdraw") {
      if (test.status === "submitted" || test.status === "withdrawn") {
        return NextResponse.json({ error: "This test can't be withdrawn now." }, { status: 409 });
      }
      const { error } = await admin
        .from("applicant_tests")
        .update({ status: "withdrawn", updated_at: new Date().toISOString() })
        .eq("id", test.id)
        .in("status", ["invited", "started"]);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (action === "resend") {
      if (test.status === "submitted" || test.status === "withdrawn") {
        return NextResponse.json({ error: "This test is closed. Send a new one instead." }, { status: 409 });
      }
      // The link can't be sent again as it was (only its hash is kept), so a
      // resend makes a new one. The old link stops working; answers so far stay.
      const { token, hash } = await createApplicantToken();
      const expiresAt = expiryFrom(new Date());
      const { error } = await admin
        .from("applicant_tests")
        .update({ token_hash: hash, expires_at: expiresAt, updated_at: new Date().toISOString() })
        .eq("id", test.id)
        .in("status", ["invited", "started"]);
      if (error) throw error;
      const invite = await sendInvite(admin, req, {
        venueId: test.venue_id,
        applicantName: test.applicant_name,
        applicantEmail: test.applicant_email,
        intro: test.intro_message || defaultIntro(await venueName(admin, test.venue_id)),
        token,
        expiresAt,
        managerId: user.id,
        managerEmail: user.email,
      });
      if (invite.sent) await admin.from("applicant_tests").update({ sent_at: new Date().toISOString() }).eq("id", test.id);
      return NextResponse.json({ ok: true, inviteSent: invite.sent, inviteEmailError: invite.error, expiresAt });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (error) {
    return managementErrorResponse(error, "Could not update the test.", "applicants PATCH", 500);
  }
}

export async function DELETE(req: Request) {
  const gate = await requireManager(req, { rateKey: "mgmt-applicants", ownerOnly: true });
  if (!gate.ok) return gate.response;
  const { user, admin } = gate.ctx;

  try {
    const test = await ownedTest(admin, user.id, new URL(req.url).searchParams.get("id"));
    // Answers and the Live Guest conversation go with it (ON DELETE CASCADE).
    const { error } = await admin.from("applicant_tests").delete().eq("id", test.id).eq("account_id", user.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return managementErrorResponse(error, "Could not delete the test.", "applicants DELETE", 500);
  }
}
