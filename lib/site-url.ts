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
