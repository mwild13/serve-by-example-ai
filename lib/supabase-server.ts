import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

function getSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
    );
  }

  return { supabaseUrl, supabaseAnonKey };
}

function getCookieDomain(): string | undefined {
  // On Cloudflare Pages preview (*.pages.dev), PSL cookie rules prevent setting
  // cookies on arbitrary domains. Omit domain so browser uses exact host.
  // On production (servebyexample.co), use wildcard for cross-subdomain sharing.
  // On localhost, omit domain for local testing.
  if (typeof window === "undefined" && process.env.NODE_ENV === "production") {
    const host = process.env.VERCEL_URL || process.env.CF_PAGES_URL || "";
    if (host.includes(".pages.dev") || host.includes("localhost")) {
      return undefined;
    }
    // Production domain
    return ".servebyexample.co";
  }
  // Client-side or non-production: omit domain
  return undefined;
}

export async function createSupabaseServerClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  const cookieStore = await cookies();
  const cookieDomain = getCookieDomain();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Ignore cookie writes in contexts that only allow reads.
        }
      },
    },
    cookieOptions: {
      domain: cookieDomain,
      path: "/",
      sameSite: "lax" as const,
      secure: true,
    },
  });
}

/**
 * Extract the authenticated user from a Request.
 * On Cloudflare Pages, cookies are often not forwarded to API routes.
 * This helper tries the Authorization header JWT first, then falls back
 * to cookie-based session so it works in both environments.
 *
 * When auth is via Bearer token, we create a new client with the token set
 * in global.headers — this ensures auth.uid() resolves correctly in all
 * downstream RLS policy checks (which was the root cause of saves failing on CF).
 *
 * Gracefully handles refresh token errors without throwing.
 */
export async function getUserFromRequest(req: Request) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (token) {
    try {
      // Create a client that embeds the bearer token in every PostgREST request
      // so auth.uid() resolves during RLS evaluation on Cloudflare Workers.
      const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
      const cookieStore = await cookies();
      const authedClient = createServerClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: { Authorization: `Bearer ${token}` },
        },
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {
              // Ignore cookie writes in contexts that only allow reads.
            }
          },
        },
      });

      const { data: { user }, error } = await authedClient.auth.getUser(token);
      if (user && !error) {
        return { user, supabase: authedClient };
      }
    } catch {
      // Silently handle auth errors with provided token
    }
  }

  // Fallback: cookie-based auth (works locally + some deployments)
  const cookieClient = await createSupabaseServerClient();
  try {
    const { data: { user } } = await cookieClient.auth.getUser();
    return { user, supabase: cookieClient };
  } catch {
    // Session refresh failed - return null user
    return { user: null, supabase: cookieClient };
  }
}

export function createSupabaseMiddlewareClient(
  request: NextRequest,
  response: NextResponse,
) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  const cookieDomain = getCookieDomain();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
    cookieOptions: {
      domain: cookieDomain,
      path: "/",
      sameSite: "lax" as const,
      secure: true,
    },
  });
}
