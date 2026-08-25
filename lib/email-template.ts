// Mobile notifications + bug-report pass (2026-08-25) — first reusable,
// branded HTML email wrapper in the codebase. Every existing Brevo-sending
// route (app/api/contact, app/api/toolkit-capture, app/api/roi/email,
// app/api/management/memberships, etc.) builds its own inline `htmlContent`
// string from scratch with no shared header/footer and no logo — see the
// "No logo/image branding in any email" finding from the mobile-cleanup
// exploration pass. This gives new sends (report-a-bug, notification
// opt-in confirmations) a consistent branded shell without touching those
// existing routes, which stay out of scope for this pass.

const SITE_URL = "https://servebyexample.co";
const LOGO_URL = `${SITE_URL}/logo.png`;

/**
 * Wraps a block of already-built HTML body content in a branded email
 * shell: logo header, brand-green heading, muted footer with a contact
 * link. `bodyHtml` should be plain inline-styled HTML — the same style
 * used by every existing Brevo template in this repo (tables/divs with
 * inline `style=""`, no external CSS, for email-client compatibility).
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
    <div style="background:#f5f2e9;padding:32px 16px;font-family:sans-serif">
      ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${preheader}</div>` : ""}
      <div style="max-width:600px;margin:0 auto;background:#fffef9;border-radius:14px;overflow:hidden;border:1px solid #ddd2ba">
        <div style="background:#0f2d1d;padding:24px 32px;text-align:center">
          <img src="${LOGO_URL}" alt="Serve By Example" height="32" style="height:32px;width:auto;display:inline-block" />
        </div>
        <div style="padding:32px">
          <h2 style="margin:0 0 16px;color:#0f2d1d;font-size:20px">${heading}</h2>
          ${bodyHtml}
        </div>
        <div style="padding:20px 32px;background:#f7ecd0;border-top:1px solid #ddd2ba">
          <p style="margin:0;font-size:12px;color:#7a9185;line-height:1.6">
            Serve By Example &middot;
            <a href="mailto:info@servebyexample.co" style="color:#a9812a">info@servebyexample.co</a>
            &middot; <a href="${SITE_URL}" style="color:#a9812a">servebyexample.co</a>
          </p>
        </div>
      </div>
    </div>
  `;
}
