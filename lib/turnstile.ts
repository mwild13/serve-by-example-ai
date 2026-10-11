// Server-side check of a Cloudflare Turnstile token, for routes that Supabase
// Auth's own captcha protection does not cover (the password-reset request
// goes through our own route and the Admin API, not a captcha-protected Auth
// call). The widget itself is components/TurnstileWidget.tsx.

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * True when Cloudflare confirms the token. A missing or rejected token is
 * false.
 *
 * Fails open in two cases, each logged: TURNSTILE_SECRET_KEY is not set, or
 * Cloudflare's verify endpoint cannot be reached. The route's rate limit
 * still applies, and a password reset should not stop working because the
 * captcha service did.
 */
export async function verifyTurnstileToken(token: unknown, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error("Turnstile: TURNSTILE_SECRET_KEY is not set, skipping verification.");
    return true;
  }
  if (typeof token !== "string" || !token || token.length > 2048) return false;

  try {
    const form = new URLSearchParams({ secret, response: token });
    if (ip && ip !== "unknown") form.set("remoteip", ip);
    const res = await fetch(VERIFY_URL, { method: "POST", body: form });
    if (!res.ok) {
      console.error("Turnstile: verify endpoint returned", res.status);
      return true;
    }
    const result = (await res.json()) as { success?: boolean };
    return result.success === true;
  } catch (err) {
    console.error("Turnstile: verify request failed:", err);
    return true;
  }
}
