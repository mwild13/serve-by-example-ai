// Mobile notifications + bug-report pass (2026-08-25) — first reusable,
// branded HTML email wrapper in the codebase. Every existing Brevo-sending
// route (app/api/contact, app/api/toolkit-capture, app/api/roi/email,
// app/api/management/memberships, etc.) builds its own inline `htmlContent`
// string from scratch with no shared header/footer and no logo — see the
// "No logo/image branding in any email" finding from the mobile-cleanup
// exploration pass. This gives new sends (report-a-bug, notification
// opt-in confirmations) a consistent branded shell without touching those
// existing routes, which stay out of scope for this pass.

/**
 * Escapes a value for interpolation into email HTML. Any user-supplied string
 * (a staff name, an email local part, a form field) must go through this
 * before it lands in `htmlContent`, or a crafted value like
 * `<a href="https://evil">Reset your password</a>` is rendered as real markup
 * in an email sent from our domain.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * A form field as trimmed text, capped at `maxLength`; anything that isn't a
 * string becomes "". For public form routes, where a JSON body can carry a
 * number or object in any field.
 */
export function formText(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

const SITE_URL = "https://servebyexample.co";
const LOGO_URL = `${SITE_URL}/logo.png`;

// Email clients ignore web fonts, so headings fall back to a serif that sits
// close to the site's Newsreader and body text to the reader's system sans.
const HEADING_FONT = "Georgia,'Times New Roman',serif";
const BODY_FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

/** Body paragraph style, for callers building `bodyHtml`. */
export const EMAIL_TEXT_STYLE = `margin:0 0 16px;font-family:${BODY_FONT};font-size:16px;line-height:1.65;color:#172f22`;

/** Small print under the main content: fallback links, "didn't request this". */
export const EMAIL_SMALL_STYLE = `margin:0 0 8px;font-family:${BODY_FONT};font-size:13px;line-height:1.6;color:#7a9185`;

/**
 * The one call-to-action button. A table cell carries the colour and radius
 * because Outlook drops padding and border-radius on a bare link.
 * `href` and `label` must already be safe for HTML.
 */
export function emailButtonHtml(href: string, label: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 28px">
      <tr>
        <td bgcolor="#1f4e37" style="background:#1f4e37;border-radius:999px">
          <a href="${href}" style="display:inline-block;padding:15px 32px;font-family:${BODY_FONT};font-size:16px;font-weight:700;line-height:1;color:#fffef9;text-decoration:none;border-radius:999px">${label}</a>
        </td>
      </tr>
    </table>`;
}

/**
 * A long link shown for copying when the button does not work. Muted and
 * boxed, so a 300-character URL does not read as the main content.
 */
export function emailFallbackLinkHtml(href: string): string {
  return `
    <p style="${EMAIL_SMALL_STYLE}">If the button does not work, copy this link into your browser:</p>
    <p style="margin:0 0 24px;padding:12px 14px;background:#f5f2e9;border:1px solid #ece5d5;border-radius:10px;font-family:${BODY_FONT};font-size:12px;line-height:1.5;word-break:break-all">
      <a href="${href}" style="color:#496155;text-decoration:none">${href}</a>
    </p>`;
}

/**
 * Wraps a block of already-built HTML body content in a branded email
 * shell: the logo and name on parchment, a gold rule, a serif heading, and a
 * footer with the contact links. `bodyHtml` should be plain inline-styled
 * HTML (tables and paragraphs with inline `style=""`, no external CSS, for
 * email-client compatibility). Use EMAIL_TEXT_STYLE, emailButtonHtml() and
 * emailFallbackLinkHtml() so every email matches.
 */
export function brandedEmailHtml({
  preheader,
  heading,
  bodyHtml,
}: {
  /** Short hidden preview text shown in inbox lists before the email opens. */
  preheader?: string;
  heading: string;
  bodyHtml: string;
}): string {
  return `
    <div style="margin:0;padding:32px 16px;background:#f5f2e9;font-family:${BODY_FONT}">
      ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${preheader}</div>` : ""}
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" width="100%" style="max-width:560px;margin:0 auto;background:#fffef9;border:1px solid #ddd2ba;border-radius:20px;overflow:hidden">
        <tr>
          <td style="padding:22px 36px;background:#eeebe1;border-bottom:3px solid #a9812a">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding-right:12px;vertical-align:middle">
                  <a href="${SITE_URL}" style="text-decoration:none"><img src="${LOGO_URL}" alt="" width="44" height="44" style="display:block;width:44px;height:44px;border:0;border-radius:10px" /></a>
                </td>
                <td style="vertical-align:middle">
                  <a href="${SITE_URL}" style="font-family:${HEADING_FONT};font-size:20px;font-weight:700;letter-spacing:-0.01em;color:#0f2d1d;text-decoration:none">Serve By Example</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 36px 20px">
            <h1 style="margin:0 0 18px;font-family:${HEADING_FONT};font-size:28px;font-weight:700;line-height:1.2;letter-spacing:-0.01em;color:#0f2d1d">${heading}</h1>
            ${bodyHtml}
          </td>
        </tr>
        <tr>
          <td style="padding:20px 36px 24px;border-top:1px solid #ece5d5">
            <p style="margin:0 0 4px;font-family:${HEADING_FONT};font-size:14px;font-weight:700;color:#172f22">Serve By Example</p>
            <p style="margin:0;font-family:${BODY_FONT};font-size:12px;line-height:1.6;color:#7a9185">
              Hospitality staff training.
              <a href="${SITE_URL}" style="color:#a9812a;text-decoration:none">servebyexample.co</a>
              &middot; <a href="mailto:info@servebyexample.co" style="color:#a9812a;text-decoration:none">info@servebyexample.co</a>
            </p>
          </td>
        </tr>
      </table>
    </div>
  `;
}
