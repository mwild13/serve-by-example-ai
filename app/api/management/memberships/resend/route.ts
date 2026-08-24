import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  const { user } = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as Record<string, unknown>;
  const membershipId = typeof body.membershipId === "string" ? body.membershipId.trim() : null;
  if (!membershipId) {
    return NextResponse.json({ error: "membershipId is required" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  const { data: membership, error: lookupError } = await admin
    .from("organization_members")
    .select("id, staff_email, manager_id")
    .eq("id", membershipId)
    .eq("manager_id", user.id)
    .single();

  if (lookupError || !membership) {
    return NextResponse.json({ error: "Membership not found" }, { status: 404 });
  }

  const email = membership.staff_email as string;
  const name = email.split("@")[0];
  const appOrigin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? new URL(req.url).origin;
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
    return NextResponse.json({ error: linkError.message }, { status: 422 });
  }

  const inviteLink = linkData?.properties?.action_link ?? null;
  const ctaHref = inviteLink ?? redirectTo;
  const ctaLabel = inviteLink ? "Accept invitation" : "Log in to your account";
  const bodyText = inviteLink
    ? "This is a reminder that you've been added as a staff member on <strong>Serve By Example</strong>. Click the button below to set up your account and start your training."
    : "This is a reminder that you've been added as a staff member on <strong>Serve By Example</strong>. Log in to your existing account to get started with your training.";

  const brevoApiKey = process.env.BREVO_API_KEY;
  if (!brevoApiKey) {
    return NextResponse.json({
      inviteLink: ctaHref,
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
        htmlContent: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
            <h2 style="margin-bottom:8px">Reminder invitation</h2>
            <p style="color:#555">Hi ${name},</p>
            <p style="color:#555">${bodyText}</p>
            <p style="margin:32px 0">
              <a href="${ctaHref}" style="background:#22c55e;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block">${ctaLabel}</a>
            </p>
            <p style="color:#aaa;font-size:13px">If the button doesn't work, copy and paste this link into your browser:<br>${ctaHref}</p>
            ${inviteLink ? '<p style="color:#aaa;font-size:13px">This link expires in 7 days.</p>' : ""}
          </div>
        `,
      }),
    });

    if (!emailRes.ok) {
      const detail = await emailRes.text();
      console.warn("Memberships resend: Brevo send failed:", emailRes.status, detail);
      return NextResponse.json({
        inviteLink: ctaHref,
        emailSent: false,
        error: `Email provider rejected the send (HTTP ${emailRes.status}).`,
      });
    }

    return NextResponse.json({ inviteLink: ctaHref, emailSent: true });
  } catch (err) {
    console.warn("Memberships resend: Brevo fetch threw:", err);
    return NextResponse.json({
      inviteLink: ctaHref,
      emailSent: false,
      error: "Could not reach the email provider.",
    });
  }
}
