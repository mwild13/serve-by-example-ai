// The public origin of the site, for links that leave it: email links,
// Supabase redirect targets and Stripe return URLs.
//
// NEXT_PUBLIC_SITE_URL has been set without a scheme ("servebyexample.co"),
// which Stripe rejects outright ("An explicit scheme must be provided") and
// which makes a link in an email relative. The value is normalised here so
// every caller gets "https://host" whatever was typed into the dashboard.
export function siteOrigin(req: Request): string {
  const configured = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || "").trim();
  if (configured) {
    const withScheme = /^https?:\/\//i.test(configured) ? configured : `https://${configured}`;
    try {
      return new URL(withScheme).origin;
    } catch {
      // Not a usable URL: fall through to the request's own origin.
    }
  }
  return new URL(req.url).origin;
}

// Cloudflare Pages previews of this project: https://<branch>.serve-by-example-ai.pages.dev.
const PREVIEW_HOST = /^[a-z0-9-]+\.serve-by-example-ai\.pages\.dev$/;

/**
 * The origin for a link in an email that leads back into the app. On a
 * Pages preview it's the preview itself, so a test email opens the code
 * being tested rather than production; everywhere else it's siteOrigin().
 * Only this project's own preview hosts are trusted from the request.
 */
export function emailLinkOrigin(req: Request): string {
  const url = new URL(req.url);
  if (url.protocol === "https:" && PREVIEW_HOST.test(url.hostname)) return url.origin;
  return siteOrigin(req);
}
