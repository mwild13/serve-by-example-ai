import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseMiddlewareClient } from "@/lib/supabase-server";
import { shouldApplyGeoBlock } from "@/lib/geo-config";
import { getCloudflareContext } from "@opennextjs/cloudflare";

function buildCSP(nonce: string): string {
  return [
    // Deny everything not explicitly listed
    "default-src 'none'",
    // Scripts: only self + nonce-tagged scripts + scripts loaded by those (strict-dynamic) + Stripe
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://js.stripe.com`,
    // Styles: unsafe-inline kept — Next.js injects critical CSS inline at render time
    "style-src 'self' 'unsafe-inline'",
    // Images: self + data URIs + blob (canvas) + any https (for /_next/image CDN)
    "img-src 'self' data: blob: https:",
    // Fonts: self-hosted via next/font — no external CDN needed
    "font-src 'self'",
    // Fetch/XHR/WebSocket: own API routes + Supabase + Stripe + Google Analytics
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://www.google-analytics.com https://www.google.com",
    // Iframes: Stripe payment elements only
    "frame-src https://js.stripe.com https://*.stripe.com",
    // Prevent this site being embedded in any iframe (clickjacking)
    "frame-ancestors 'none'",
    // Prevent base tag injection attacks
    "base-uri 'self'",
    // Prevent form submissions to external URLs
    "form-action 'self'",
    // Web app manifest
    "manifest-src 'self'",
  ].join("; ");
}

export async function middleware(request: NextRequest) {
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

  // Helper function to safely redirect while transferring modified Supabase cookies
  const syncRedirect = (url: URL) => {
    const redirectResponse = NextResponse.redirect(url);
    // Copy all cookies over from our mutated response object
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
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

  if (shouldApplyGeoBlock(path, country)) {
    const geoBlockUrl = request.nextUrl.clone();
    geoBlockUrl.pathname = "/restricted";
    const geoRedirect = syncRedirect(geoBlockUrl);
    // Prevent any edge or browser caching of this redirect
    geoRedirect.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    geoRedirect.headers.set("Vary", "CF-IPCountry");
    return geoRedirect;
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
  const isOnboarding = path.startsWith("/onboarding");
  const isManagementDashboard = path.startsWith("/management/dashboard");
  const isSessionConflict = path === "/session-conflict";

  // Allow session-conflict page without redirect loops
  if (isSessionConflict) {
    return response;
  }

  if ((isDashboard || isOnboarding) && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return syncRedirect(loginUrl);
  }

  if (isManagementDashboard && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return syncRedirect(loginUrl);
  }

  // If already signed in and visiting login, send straight to dashboard.
  if (path === "/login" && user) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return syncRedirect(dashboardUrl);
  }

  // ── Session displacement check for protected routes ────────
  if (user && supabase && (isDashboard || isManagementDashboard)) {
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
        return syncRedirect(conflictUrl);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Pages and routes (exclude API routes with negative lookahead)
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
