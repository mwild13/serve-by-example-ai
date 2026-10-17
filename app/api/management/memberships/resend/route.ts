import { NextResponse } from "next/server";
import { siteOrigin } from "@/lib/site-url";
import { requireManager } from "@/lib/management/auth";
import { EMAIL_SMALL_STYLE, EMAIL_TEXT_STYLE, brandedEmailHtml, emailButtonHtml, emailFallbackLinkHtml, escapeHtml, staffVenueNoteHtml } from "@/lib/email-template";
import { readJsonBody } from "@/lib/ai-guard";
import { nameFromEmail } from "@/lib/person-name";

export async function POST(req: Request) {
  const gate = await requireManager(req, { rateKey: "invite-resend", limit: 10 });
  if (!gate.ok) return gate.response;
  const { user, admin } = gate.ctx;

  const read = await readJsonBody(req, undefined, { requireJsonContentType: false });
  if (!read.ok) return read.response;
  const body = read.body as Record<string, unknown>;
  const membershipId = typeof body.membershipId === "string" ? body.membershipId.trim() : null;
  if (!membershipId) {
    return NextResponse.json({ error: "membershipId is required" }, { status: 400 });
  }

  const { data: membership, error: lookupError } = await admin
    .from("organization_members")
    .select("id, staff_email, manager_id")
    .eq("id", membershipId)
    .eq("manager_id", user.id)
    .not("status", "eq", "removed")
    .maybeSingle();

  if (lookupError || !membership) {
    return NextResponse.json({ error: "Membership not found" }, { status: 404 });
  }

  const email = membership.staff_email as string;
  const name = nameFromEmail(email) || "there";
  const appOrigin = siteOrigin(req);
  const redirectTo = `${appOrigin}/login`;

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "invite",
    email,
    options: { redirectTo, data: { display_name: name } },
  });

  // generateLink's "invite" type only succeeds for brand-new users. A staff
  // member who already signed up on their own before the manager got to them
  // will always hit this — fall back to a login-reminder email instead of
  // failing outright, mirroring the primary invite route's handling.
  const isExistingUser =
    !!linkError &&
    (linkError.message?.toLowerCase().includes("already registered") ||
      linkError.message?.toLowerCase().includes("already been registered"));

  if (linkError && !isExistingUser) {
    console.error("[memberships/resend] generateLink failed:", linkError.message);
    return NextResponse.json({ error: "Could not generate an invite link." }, { status: 422 });
  }

  // The action link signs whoever opens it in as `email`, so it only goes
  // into the email. Responses return the plain login page (`redirectTo`) —
  // returning the action link let any account mint a login for an address it
  // didn't own (audit 2026-09-30, H1).
  const inviteLink = linkData?.properties?.action_link ?? null;
  const ctaHref = inviteLink ?? redirectTo;
  const ctaLabel = inviteLink ? "Accept invitation" : "Log in to your account";
  const bodyText = inviteLink
    ? "This is a reminder that you've been added as a staff member on <strong>Serve By Example</strong>. Click the button below to set up your account and start your training."
    : "This is a reminder that you've been added as a staff member on <strong>Serve By Example</strong>. Log in to your existing account to get started with your training.";

  const brevoApiKey = process.env.BREVO_API_KEY;
  if (!brevoApiKey) {
    return NextResponse.json({
      inviteLink: redirectTo,
      emailSent: false,
      error: "Email sending is not configured for this environment (missing BREVO_API_KEY).",
    });
  }

  const fromEmail = "info@servebyexample.co";
  const fromName = process.env.BREVO_FROM_NAME ?? "Serve By Example";

  try {
    const emailRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": brevoApiKey, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        sender: { name: fromName, email: fromEmail },
        to: [{ email, name }],
        subject: `Reminder: you've been invited to join ${fromName}`,
        htmlContent: brandedEmailHtml({
          preheader: "A reminder that your invitation is waiting.",
          heading: "A reminder of your invitation",
          bodyHtml: `
            <p style="${EMAIL_TEXT_STYLE}">Hi ${escapeHtml(name)},</p>
            <p style="${EMAIL_TEXT_STYLE}">${bodyText}</p>
            ${emailButtonHtml(escapeHtml(ctaHref), ctaLabel)}
            ${staffVenueNoteHtml()}
            ${inviteLink ? `<p style="${EMAIL_SMALL_STYLE}">This link expires in 7 days.</p>` : ""}
            ${emailFallbackLinkHtml(escapeHtml(ctaHref))}
          `,
        }),
      }),
    });

    if (!emailRes.ok) {
      const detail = await emailRes.text();
      console.warn("Memberships resend: Brevo send failed:", emailRes.status, detail);
      return NextResponse.json({
        inviteLink: redirectTo,
        emailSent: false,
        error: `Email provider rejected the send (HTTP ${emailRes.status}).`,
      });
    }

    return NextResponse.json({ inviteLink: redirectTo, emailSent: true });
  } catch (err) {
    console.warn("Memberships resend: Brevo fetch threw:", err);
    return NextResponse.json({
      inviteLink: redirectTo,
      emailSent: false,
      error: "Could not reach the email provider.",
    });
  }
}
