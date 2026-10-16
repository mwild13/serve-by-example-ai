import { NextResponse } from "next/server";
import { siteOrigin } from "@/lib/site-url";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { EMAIL_SMALL_STYLE, EMAIL_TEXT_STYLE, brandedEmailHtml, emailButtonHtml, emailFallbackLinkHtml, escapeHtml } from "@/lib/email-template";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { readJsonBody } from "@/lib/ai-guard";
import { verifyTurnstileToken } from "@/lib/turnstile";

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

  // 4 KB: a Turnstile token alone can be 2,048 characters.
  const read = await readJsonBody(req, 4096);
  if (!read.ok) return read.response;
  const body = read.body;
  const email = typeof body?.email === "string" ? body.email.trim() : "";

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  // Checked before anything is looked up or sent, so a script can't use this
  // route to mail reset links to a list of addresses.
  if (!(await verifyTurnstileToken(body?.captchaToken, ip))) {
    return NextResponse.json(
      { error: "We could not confirm you are not a robot. Reload the page and try again." },
      { status: 400 },
    );
  }

  const appOrigin = siteOrigin(req);
  const redirectTo = `${appOrigin}/reset-password`;

  const admin = createSupabaseAdminClient();
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo },
  });

  if (linkError || !linkData?.properties?.hashed_token) {
    if (linkError) console.error("[auth/forgot-password] generateLink failed:", linkError.message);
    // Don't leak "no such user" — respond exactly as if it succeeded.
    return NextResponse.json({ ok: true, message: GENERIC_MESSAGE });
  }

  // The link goes straight to our reset page, which calls verifyOtp with the
  // token hash. Going through Supabase's /verify instead returns the session
  // in the URL hash, which our PKCE browser client ignores ("Auth session
  // missing"). Flat params only: an earlier version nested the whole Supabase
  // link as one encoded value, and click tracking decoded it and split it.
  const proxiedLink = `${appOrigin}/reset-password?token_hash=${encodeURIComponent(linkData.properties.hashed_token)}&type=recovery`;
  // The address passed a loose format check only, so escape it before it goes into HTML.
  const safeEmail = escapeHtml(email);
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
              <p style="${EMAIL_TEXT_STYLE}">
                We received a request to reset the password for
                <a href="mailto:${safeEmail}" style="color:#172f22;font-weight:700;text-decoration:none">${safeEmail}</a>.
                Choose a new one with the button below.
              </p>
              ${emailButtonHtml(proxiedLink, "Reset password")}
              <p style="${EMAIL_SMALL_STYLE}">This link works once and expires in 1 hour.</p>
              ${emailFallbackLinkHtml(proxiedLink)}
              <p style="${EMAIL_SMALL_STYLE}">Did not ask for this? You can ignore this email and your password will stay the same.</p>
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
