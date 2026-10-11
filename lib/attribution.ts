// First-touch marketing attribution.
//
// middleware.ts stores the campaign parameters from a visitor's first landing
// in a first-party cookie. The session stamp copies them onto the profile at
// first sign-in (profiles.acquisition) and checkout copies them into Stripe
// metadata, so "which ad produced this customer" is answerable from the
// database and from Stripe without relying on Google Analytics consent.

export const ATTRIBUTION_COOKIE = "sbe_attr";
export const ATTRIBUTION_MAX_AGE = 60 * 60 * 24 * 90; // 90 days in seconds

const ATTRIBUTION_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "fbclid",
] as const;

const MAX_VALUE_CHARS = 150;
const MAX_COOKIE_CHARS = 1500;

export type Attribution = Partial<Record<(typeof ATTRIBUTION_PARAMS)[number], string>> & {
  landing_path?: string;
  captured_at?: string;
};

/** Reads the campaign parameters from a landing URL. Null when it carries none. */
export function attributionFromUrl(url: URL, now = new Date()): Attribution | null {
  const attribution: Attribution = {};
  for (const key of ATTRIBUTION_PARAMS) {
    const value = url.searchParams.get(key)?.trim();
    if (value) attribution[key] = value.slice(0, MAX_VALUE_CHARS);
  }
  if (Object.keys(attribution).length === 0) return null;
  attribution.landing_path = url.pathname.slice(0, MAX_VALUE_CHARS);
  attribution.captured_at = now.toISOString();
  return attribution;
}

/** The cookie value. Plain JSON: Next's cookie API percent-encodes it when the cookie is set. */
export function encodeAttribution(attribution: Attribution): string {
  return JSON.stringify(attribution);
}

/** Parses the decoded cookie value. The cookie is visitor-controlled, so only known keys with string values survive. */
export function decodeAttribution(raw: string | null | undefined): Attribution | null {
  if (!raw || raw.length > MAX_COOKIE_CHARS) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    const source = parsed as Record<string, unknown>;
    const attribution: Attribution = {};
    for (const key of [...ATTRIBUTION_PARAMS, "landing_path", "captured_at"] as const) {
      const value = source[key];
      if (typeof value === "string" && value) attribution[key] = value.slice(0, MAX_VALUE_CHARS);
    }
    return Object.keys(attribution).length > 0 ? attribution : null;
  } catch {
    return null;
  }
}

/** The attribution cookie from a request's Cookie header, if any. */
export function attributionFromRequest(req: Request): Attribution | null {
  const header = req.headers.get("cookie") ?? "";
  for (const pair of header.split(";")) {
    const index = pair.indexOf("=");
    if (index === -1) continue;
    if (pair.slice(0, index).trim() === ATTRIBUTION_COOKIE) {
      try {
        return decodeAttribution(decodeURIComponent(pair.slice(index + 1).trim()));
      } catch {
        return null;
      }
    }
  }
  return null;
}

/** Flattened for Stripe metadata, which only takes string values of up to 500 characters. */
export function attributionToStripeMetadata(attribution: Attribution | null): Record<string, string> {
  if (!attribution) return {};
  const metadata: Record<string, string> = {};
  for (const key of ATTRIBUTION_PARAMS) {
    const value = attribution[key];
    if (value) metadata[key] = value;
  }
  if (attribution.landing_path) metadata.landing_path = attribution.landing_path;
  return metadata;
}
