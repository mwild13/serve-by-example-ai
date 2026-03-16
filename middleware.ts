import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseMiddlewareClient } from "@/lib/supabase-server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  const supabase = createSupabaseMiddlewareClient(request, response);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");

  if (isDashboard && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // If already signed in and visiting login, send straight to dashboard.
  if (request.nextUrl.pathname === "/login" && user) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
