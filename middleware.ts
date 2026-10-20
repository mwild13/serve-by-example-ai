import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseMiddlewareClient } from "@/lib/supabase-server";
import { shouldApplyGeoBlock } from "@/lib/geo-config";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isMobilePhoneUserAgent } from "@/lib/user-agent";
import { errorReportingOrigin } from "@/lib/report-error";
import { ATTRIBUTION_COOKIE, ATTRIBUTION_MAX_AGE, attributionFromUrl, encodeAttribution } from "@/lib/attribution";

// The staff sign-up link is /dashboard?join=CODE. Most new staff open it
// signed out, and the code used to be lost on the way through /login, Google
// sign-in or onboarding. It is parked in this cookie when a signed-out visitor
// arrives with one, and put back on the URL at their first signed-in request
// to the app, whichever way they got there.
const JOIN_COOKIE = "sbe_join";
const JOIN_COOKIE_MAX_AGE = 60 * 60 * 24; // 1 day in seconds
const JOIN_CODE = /^[A-Za-z0-9]{4,8}$/;

// Names of Supabase auth cookies the browser sent more than once. That only
// happens when a host-only copy sits beside the real one (which is scoped to
// .servebyexample.co): syncRedirect() used to copy cookies onto a redirect
// without their domain, so a token refreshed during the phone redirect to
// /mobile was written as a second, host-only cookie. The stale copy then won
// on every later request and the server saw nobody signed in, even straight
// after a fresh sign-in.
function staleAuthCookieNames(cookieHeader: string | null): string[] {
  const seen = new Set<string>();
  let hasDuplicate = false;
  for (const pair of (cookieHeader ?? "").split(";")) {
    const name = pair.split("=")[0]?.trim();
    if (!name || !name.startsWith("sb-") || !name.includes("-auth-token")) continue;
    if (seen.has(name)) hasDuplicate = true;
    seen.add(name);
  }
  // Once one name is doubled, clear the host-only copy of every auth cookie:
  // a session is split across numbered chunks, and a stale chunk left beside
  // fresh ones corrupts it just the same. Expiring a host-only cookie that
  // does not exist does nothing.
  return hasDuplicate ? [...seen] : [];
}

function buildCSP(nonce: string): string {
  // `next dev`'s webpack devtool wraps every module in eval() for Fast
  // Refresh/HMR — with no 'unsafe-eval', that eval is blocked entirely,
  // which breaks React hydration/event handling app-wide in local dev
  // (controlled inputs stop updating, onClick handlers stop firing —
  // this is what made login, and every other button/dropdown, appear dead
  // on localhost). `next build` (production, and every Cloudflare Pages
  // preview/production deployment) never emits eval-wrapped bundles, so
  // this only ever relaxes the policy for `next dev` — production and
  // preview keep the strict policy untouched.
  const isLocalDev = process.env.NODE_ENV === "development";
  const scriptSrc = isLocalDev
    ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval' https://js.stripe.com https://challenges.cloudflare.com`
    : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://js.stripe.com https://challenges.cloudflare.com`;

  // Error reports go straight from the browser to Sentry (lib/report-error.ts).
  // The host comes from the DSN, so nothing is allowed while reporting is off.
  const errorReporting = errorReportingOrigin();

  return [
    // Deny everything not explicitly listed
    "default-src 'none'",
    // Scripts: only self + nonce-tagged scripts + scripts loaded by those (strict-dynamic) + Stripe
    // + Cloudflare Turnstile (the sign-in captcha, components/TurnstileWidget.tsx)
    scriptSrc,
    // Styles: unsafe-inline kept — Next.js injects critical CSS inline at render time
    "style-src 'self' 'unsafe-inline'",
    // Images: self + data URIs + blob (canvas) + any https (for /_next/image CDN)
    "img-src 'self' data: blob: https:",
    // Fonts: self-hosted via next/font — no external CDN needed
    "font-src 'self'",
    // Fetch/XHR/WebSocket: own API routes + Supabase + Stripe + Google Analytics.
    // The three Google wildcards are the hosts Google documents for GA4 under a
    // CSP: hits can go to a regional host (region1.google-analytics.com,
    // *.analytics.google.com), not only www.google-analytics.com.
    `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://www.google.com https://challenges.cloudflare.com${errorReporting ? ` ${errorReporting}` : ""}`,
    // Plugins/embeds: none used — explicit even though default-src already covers it
    "object-src 'none'",
    // Iframes: Stripe payment elements and the Turnstile challenge
    "frame-src https://js.stripe.com https://*.stripe.com https://challenges.cloudflare.com",
    // Prevent this site being embedded in any iframe (clickjacking)
    "frame-ancestors 'none'",
    // Prevent base tag injection attacks
    "base-uri 'self'",
    // Prevent form submissions to external URLs
    "form-action 'self'",
    // Audio: Live Guest voice plays the guest's lines from blob: URLs
    // (components/live-guest/useGuestVoice.ts)
    "media-src 'self' blob:",
    // Web app manifest
    "manifest-src 'self'",
    // The service worker for shift reminders (public/sw.js). Named here
    // because script-src uses 'strict-dynamic', which ignores 'self'.
    "worker-src 'self'",
  ].join("; ");
}

const SIGNED_IN_PREFIXES = ["/dashboard", "/mobile", "/management", "/onboarding", "/session-conflict", "/payment-success"];

export async function middleware(request: NextRequest) {
  // One address for the site. www.servebyexample.co answered as well, and
  // host-only cookies (the one-device session id, sbe_session_id) do not
  // carry between the two, so a visitor who arrived on www, as the password
  // reset email sends them, was half signed in on the other.
  // The host is read from the headers, the same way lib/supabase-server.ts
  // does: request.nextUrl does not reliably carry the public hostname.
  const requestHost = (request.headers.get("x-forwarded-host") || request.headers.get("host") || "").split(":")[0];
  if (requestHost.toLowerCase() === "www.servebyexample.co") {
    const canonicalUrl = new URL(`${request.nextUrl.pathname}${request.nextUrl.search}`, "https://servebyexample.co");
    return NextResponse.redirect(canonicalUrl, 308);
  }

  // A sign-in that came back to the home page. When Supabase does not accept
  // the address a sign-in asked to return to, it sends the visitor to the
  // Site URL with the one-time code still attached, and the home page ignored
  // it: they looked signed out. /auth/callback finishes the sign-in, or shows
  // the sign-in error on /login when the code was issued for another host.
  if (request.nextUrl.pathname === "/" && request.nextUrl.searchParams.has("code")) {
    const callbackUrl = request.nextUrl.clone();
    callbackUrl.pathname = "/auth/callback";
    return NextResponse.redirect(callbackUrl);
  }

  // Generate a unique nonce per request — replaces unsafe-inline in script-src
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCSP(nonce);

  // Forward nonce to the layout via request headers so Next.js can apply it
  // to its own generated hydration <script> tags
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  // This is our base response instance where Supabase writes its updated cookies
  let response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("Content-Security-Policy", csp);

  const path = request.nextUrl.pathname;

  // Signed-in surfaces must never sit in a shared cache. The server-rendered
  // ones already send no-store, but the client shells (/onboarding,
  // /dashboard/badges, /session-conflict) are prerendered and would otherwise
  // go out with Next's default one-year s-maxage.
  if (SIGNED_IN_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    response.headers.set("Cache-Control", "private, no-store");
  }

  // Expires the host-only copy of any auth cookie that arrived twice, leaving
  // the real one. Appended as raw headers, and last, because the cookie API
  // keeps one entry per name and would drop these when it rewrites the header.
  const staleAuthCookies = staleAuthCookieNames(request.headers.get("cookie"));
  const clearStaleAuthCookies = <T extends NextResponse>(res: T): T => {
    for (const name of staleAuthCookies) {
      res.headers.append("Set-Cookie", `${name}=; Path=/; Max-Age=0; Secure; SameSite=Lax`);
    }
    return res;
  };

  // Helper function to safely redirect while transferring modified Supabase cookies
  const syncRedirect = (url: URL) => {
    const redirectResponse = NextResponse.redirect(url);
    // Copy every cookie over whole, with its domain, path and expiry. Copying
    // only the name and value turned each one into a host-only session cookie.
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    // Preserve CSP headers on the redirect response
    redirectResponse.headers.set("Content-Security-Policy", csp);
    return redirectResponse;
  };

  // ── Geo-blocking check (before auth) ────────
  // Use Cloudflare's native request.cf.country (authoritative, not a header that can be cached).
  // Falls back to cf-ipcountry header, then undefined (treated as allowed) for local dev.
  let country: string | undefined;
  try {
    const cfCtx = getCloudflareContext() as { cf?: { country?: string } };
    country = cfCtx?.cf?.country ?? request.headers.get("cf-ipcountry") ?? undefined;
  } catch {
    // getCloudflareContext throws outside Cloudflare runtime (local dev) — fall back to header
    country = request.headers.get("cf-ipcountry") ?? undefined;
  }

  if (shouldApplyGeoBlock(path, country, request.headers.get("user-agent"))) {
    const geoBlockUrl = request.nextUrl.clone();
    geoBlockUrl.pathname = "/restricted";
    const geoRedirect = syncRedirect(geoBlockUrl);
    // Prevent any edge or browser caching of this redirect
    geoRedirect.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    geoRedirect.headers.set("Vary", "CF-IPCountry");
    return clearStaleAuthCookies(geoRedirect);
  }

  // First-touch attribution: keep the campaign parameters from the first
  // landing that carries any, so sign-up and checkout can record them later
  // (lib/attribution.ts). Never overwritten by a later visit.
  if (!request.cookies.has(ATTRIBUTION_COOKIE)) {
    const attribution = attributionFromUrl(request.nextUrl);
    if (attribution) {
      response.cookies.set(ATTRIBUTION_COOKIE, encodeAttribution(attribution), {
        path: "/",
        maxAge: ATTRIBUTION_MAX_AGE,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }
  }

  let user = null;
  let supabase: ReturnType<typeof createSupabaseMiddlewareClient> | null = null;
  try {
    supabase = createSupabaseMiddlewareClient(request, response);
    const {
      data: { user: authUser },
      error,
    } = await supabase.auth.getUser();

    if (!error) {
      user = authUser;
    }
  } catch {
    // Silently handle missing env vars (local dev) or refresh token errors
    // User will be redirected to login if needed
  }

  const isDashboard = path.startsWith("/dashboard");
  // /mobile is the V4 staff surface — same auth + one-device enforcement as
  // /dashboard. Its own auth gate (app/mobile/layout.tsx) redirects on no
  // user too, but the session-displacement check below only ever runs here
  // in middleware, so /mobile must be included in this gate or a displaced
  // session could browse the mobile screens un-checked.
  const isMobile = path.startsWith("/mobile");
  const isOnboarding = path.startsWith("/onboarding");
  const isManagementDashboard = path.startsWith("/management/dashboard");
  const isSessionConflict = path === "/session-conflict";

  // Allow session-conflict page without redirect loops
  if (isSessionConflict) {
    return clearStaleAuthCookies(response);
  }

  if ((isDashboard || isMobile || isOnboarding) && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    const loginRedirect = syncRedirect(loginUrl);
    const joinCode = request.nextUrl.searchParams.get("join") ?? "";
    if (JOIN_CODE.test(joinCode)) {
      loginRedirect.cookies.set(JOIN_COOKIE, joinCode.toUpperCase(), {
        path: "/",
        maxAge: JOIN_COOKIE_MAX_AGE,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }
    return clearStaleAuthCookies(loginRedirect);
  }

  const isPhone = isMobilePhoneUserAgent(request.headers.get("user-agent") ?? "");
  // Back from Stripe: /dashboard verifies the payment and applies the plan
  // (app/dashboard/page.tsx), then sends a phone on to /mobile/home itself.
  // Redirecting here first skipped that, so on a phone the plan only changed
  // when the webhook landed.
  const isCheckoutReturn =
    isDashboard &&
    request.nextUrl.searchParams.get("checkout") === "success" &&
    request.nextUrl.searchParams.has("session_id");

  // A join code parked before sign-in: put it back on the URL once, at the
  // first signed-in request to the app, and drop the cookie.
  const pendingJoin = request.cookies.get(JOIN_COOKIE)?.value ?? "";
  if (user && pendingJoin && (isDashboard || isMobile) && !isCheckoutReturn) {
    if (request.nextUrl.searchParams.has("join") || !JOIN_CODE.test(pendingJoin)) {
      // Already on a join link, or the cookie is not a code: just clear it.
      response.cookies.delete(JOIN_COOKIE);
    } else {
      const joinUrl = request.nextUrl.clone();
      joinUrl.pathname = isPhone ? "/mobile/settings" : "/dashboard";
      joinUrl.searchParams.set("join", pendingJoin);
      const joinRedirect = syncRedirect(joinUrl);
      joinRedirect.cookies.delete(JOIN_COOKIE);
      return clearStaleAuthCookies(joinRedirect);
    }
  }

  // Staff on a phone always land on the V4 mobile app, regardless of how
  // they got to /dashboard (password login, Google OAuth, onboarding
  // completion, a bookmark, the back button — every one of those paths ends
  // with a request to /dashboard, so gating it here catches all of them in
  // one place instead of patching each entry point separately). No role
  // check needed: /dashboard is staff-only by construction — managers land
  // on /management/dashboard, a different route entirely.
  if (isDashboard && user && isPhone && !isCheckoutReturn) {
    const mobileHomeUrl = request.nextUrl.clone();
    // The staff sign-up link (/dashboard?join=CODE) goes to mobile Settings,
    // which joins the venue on arrival. The query string is kept by clone().
    mobileHomeUrl.pathname = mobileHomeUrl.searchParams.has("join") ? "/mobile/settings" : "/mobile/home";
    return clearStaleAuthCookies(syncRedirect(mobileHomeUrl));
  }

  if (isManagementDashboard && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return clearStaleAuthCookies(syncRedirect(loginUrl));
  }

  // If already signed in and visiting login, send straight to dashboard.
  if (path === "/login" && user) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return clearStaleAuthCookies(syncRedirect(dashboardUrl));
  }

  // ── Session displacement check for protected routes ────────
  if (user && supabase && (isDashboard || isMobile || isManagementDashboard)) {
    const browserSessionId = request.cookies.get("sbe_session_id")?.value;

    if (browserSessionId) {
      // Query the profile's current_session_id
      const { data: profile } = await supabase
        .from("profiles")
        .select("current_session_id")
        .eq("id", user.id)
        .single();

      const storedSessionId = profile?.current_session_id;

      // If there's a stored session and it doesn't match, redirect to conflict page
      // Log session conflicts for security monitoring
      if (storedSessionId && storedSessionId !== browserSessionId) {
        console.warn(
          `Session conflict detected for user ${user?.id}. Device may be compromised.`
        );
        const conflictUrl = request.nextUrl.clone();
        conflictUrl.pathname = "/session-conflict";
        conflictUrl.searchParams.set("returnTo", path);
        return clearStaleAuthCookies(syncRedirect(conflictUrl));
      }
    }
  }

  return clearStaleAuthCookies(response);
}

export const config = {
  matcher: [
    // Pages and routes only — exclude API, Next.js internals, and any public
    // static file (paths containing a dot, e.g. *.webp, *.png, *.txt).
    // Without this exclusion the image optimizer's internal fetch to /logo.webp
    // was intercepted and redirected to /restricted, breaking all optimised images.
    "/((?!api|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\..*).*)",
  ],
};
