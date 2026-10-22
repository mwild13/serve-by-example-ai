import { createSupabaseBrowserClient } from "@/lib/supabase";

/**
 * Signs this browser out. Supabase's default global scope revokes the
 * session on the server, so a copied refresh token stops working too. The
 * one-device cookie (sbe_session_id) is HttpOnly, so the browser can't clear
 * it itself: /api/session/stamp does. Neither step throws; the caller always
 * gets to send the person on to sign-in.
 */
export async function signOutEverywhere(): Promise<void> {
  await Promise.all([
    createSupabaseBrowserClient().auth.signOut().catch(() => undefined),
    fetch("/api/session/stamp", { method: "DELETE", keepalive: true }).catch(() => undefined),
  ]);
}
