import { createBrowserClient } from "@supabase/ssr";

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
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host.includes(".pages.dev") || host === "localhost") {
      return undefined;
    }
    // Production domain
    return ".servebyexample.co";
  }
  // Fallback: omit domain
  return undefined;
}

export function createSupabaseBrowserClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: {
      domain: getCookieDomain(),
      path: "/",
      sameSite: "lax" as const,
      secure: true,
    },
  });
}