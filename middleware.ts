import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseMiddlewareClient } from "@/lib/supabase-server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;

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
      if (storedSessionId && storedSessionId !== browserSessionId) {
        const conflictUrl = request.nextUrl.clone();
        conflictUrl.pathname = "/session-conflict";
        return NextResponse.redirect(conflictUrl);
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/onboarding", "/login", "/management/dashboard/:path*", "/management/login", "/session-conflict"],
};
