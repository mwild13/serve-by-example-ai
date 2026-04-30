import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseMiddlewareClient } from "@/lib/supabase-server";
import { shouldApplyGeoBlock } from "@/lib/geo-config";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;

  // ── Geo-blocking check (before auth) ────────
  // Cloudflare sets cf-ipcountry; falls back to undefined for local dev (treated as allowed)
  const country = request.headers.get("cf-ipcountry") ?? undefined;
  if (shouldApplyGeoBlock(path, country)) {
    const geoBlockUrl = request.nextUrl.clone();
    geoBlockUrl.pathname = "/restricted";
    return NextResponse.redirect(geoBlockUrl);
  }

  const supabase = createSupabaseMiddlewareClient(request, response);
  
  let user = null;
  try {
    const {
      data: { user: authUser },
      error,
    } = await supabase.auth.getUser();
    
    if (!error) {
      user = authUser;
    }
  } catch (err) {
    // Silently handle refresh token errors in middleware
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
    return NextResponse.redirect(loginUrl);
  }

  if (isManagementDashboard && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/management/login";
    return NextResponse.redirect(loginUrl);
  }

  // If already signed in and visiting login, send straight to dashboard.
  if (path === "/login" && user) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  if (path === "/management/login" && user) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/management/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  // ── Session displacement check for protected routes ────────
  if (user && (isDashboard || isManagementDashboard)) {
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
              `Session conflict: user=${user?.id}, stored_session=${storedSessionId?.substring(0, 8)}..., browser_session=${browserSessionId?.substring(0, 8)}...`
            );
        const conflictUrl = request.nextUrl.clone();
        conflictUrl.pathname = "/session-conflict";
        return NextResponse.redirect(conflictUrl);
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
