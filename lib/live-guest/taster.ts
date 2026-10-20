// The taster (Rich update, Phase 13): one free Live Guest conversation for
// people who aren't on a venue plan (Pro, free, lapsed), with the guest
// below, so they see what a venue plan adds. One start each, ever: an
// abandoned taster still counts. Checked on the server by the start and
// turn routes; the picker shows it as the one available guest.
//
// Chosen 2026-10-20 as the guest with all four dials in play (mood, speed,
// safety and money) in the most familiar pub complaint. The owner can change
// it here; the guest must be `reviewed: true` in guests.ts.
import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export const TASTER_GUEST_ID = "cold-parmy";

/** True once this person has started a taster conversation. */
export async function tasterUsed(admin: SupabaseClient, userId: string): Promise<boolean> {
  const { count, error } = await admin
    .from("live_guest_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("guest_id", TASTER_GUEST_ID);
  if (error) throw error;
  return (count ?? 0) > 0;
}
