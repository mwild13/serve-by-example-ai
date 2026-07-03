import { createClient } from "@supabase/supabase-js";

export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    console.error(
      "[supabase-admin] Missing NEXT_PUBLIC_SUPABASE_URL environment variable"
    );
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL. Set this in Cloudflare Pages environment variables.",
    );
  }

  if (!supabaseServiceRoleKey) {
    console.error(
      "[supabase-admin] Failed to initialize Supabase admin client."
    );
    throw new Error(
      "Failed to initialize Supabase admin client. Set required environment variables in Cloudflare Pages.",
    );
  }

  console.log("[supabase-admin] Creating admin client for:", supabaseUrl);

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}