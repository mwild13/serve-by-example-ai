import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { brandedEmailHtml } from "@/lib/email-template";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// Password-reset branding + deliverability fix (2026-09-02) — this used to
// be a bare client-side supabase.auth.resetPasswordForEmail() call
// (app/login/page.tsx, app/auth/page.tsx), which sends Supabase's stock,
// unbranded "Reset Password / Follow this link..." template through
// whatever mailer Supabase Auth has configured. Two problems: (1) it
// doesn't match our brand at all, and (2) that generic copy plus a raw
// <project-ref>.supabase.co link (not our domain) is exactly the shape
// Gmail flags as "might be dangerous". Fixed the same way
// app/api/management/staff/route.ts already fixed staff invites: generate
// the link server-side (generateLink never sends anything itself), then
// send our own fully-branded email via Brevo — same pipeline, same
// verified sending domain as every other transactional email in this app.
// The link inside the email is proxied through
// /api/auth/verify-redirect so it visibly lives on our own domain too.
//
// Never reveals whether an email address has an account — every response
// (valid email, unknown email, send failure) gets the same generic
// message, matching Supabase's own resetPasswordForEmail() behaviour.

const GENERIC_MESSAGE = "If an account exists for that email, we've sent a password reset link.";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!rateLimit(`forgot-password:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const appOrigin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? new URL(req.url).origin;
  const redirectTo = `${appOrigin}/reset-password`;

  const admin = createSupabaseAdminClient();
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo },
  });

  if (linkError || !linkData?.properties?.action_link) {
    if (linkError) console.error("[auth/forgot-password] generateLink failed:", linkError.message);
    // Don't leak "no such user" — respond exactly as if it succeeded.
    return NextResponse.json({ ok: true, message: GENERIC_MESSAGE });
  }

  const proxiedLink = `${appOrigin}/api/auth/verify-redirect?link=${encodeURIComponent(linkData.properties.action_link)}`;
  const brevoApiKey = process.env.BREVO_API_KEY;
  const fromEmail = "info@servebyexample.co";
  const fromName = process.env.BREVO_FROM_NAME ?? "Serve By Example";

  if (brevoApiKey) {
    try {
      const emailRes = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": brevoApiKey, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          sender: { name: fromName, email: fromEmail },
          to: [{ email }],
          subject: "Reset your Serve By Example password",
          htmlContent: brandedEmailHtml({
            preheader: "Use this link to reset your password. It expires in 1 hour.",
            heading: "Reset your password",
            bodyHtml: `
              <p style="margin:0 0 20px;color:#496155;font-size:15px;line-height:1.6">
                We received a request to reset the password for <strong>${email}</strong>. Click the button below
                to choose a new one — this link expires in 1 hour and can only be used once.
              </p>
              <p style="margin:0 0 24px">
                <a href="${proxiedLink}" style="background:#1f4e37;color:#fffef9;padding:14px 28px;border-radius:999px;text-decoration:none;font-weight:700;display:inline-block;font-size:15px">Reset password</a>
              </p>
              <p style="margin:0 0 8px;color:#7a9185;font-size:13px">If the button doesn&rsquo;t work, copy and paste this link into your browser:</p>
              <p style="margin:0 0 20px;color:#7a9185;font-size:12px;word-break:break-all">${proxiedLink}</p>
              <p style="margin:0;color:#7a9185;font-size:13px">Didn&rsquo;t request this? You can safely ignore this email — your password won&rsquo;t be changed.</p>
            `,
          }),
        }),
      });

      if (!emailRes.ok) {
        const detail = await emailRes.text();
        console.error("[auth/forgot-password] Brevo send failed:", emailRes.status, detail);
      }
    } catch (err) {
      console.error("[auth/forgot-password] Brevo fetch threw:", err);
    }
  } else {
    // Safety net only — should not happen in any deployed environment.
    // Falls back to Supabase's own built-in mailer/template so a reset
    // email still goes out even if BREVO_API_KEY is ever unset.
    console.error("[auth/forgot-password] BREVO_API_KEY not set — falling back to Supabase's built-in mailer.");
    try {
      const supabase = await createSupabaseServerClient();
      await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    } catch (err) {
      console.error("[auth/forgot-password] Supabase fallback send failed:", err);
    }
  }

  return NextResponse.json({ ok: true, message: GENERIC_MESSAGE });
}
