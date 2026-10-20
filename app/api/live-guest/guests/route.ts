import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getUserFromRequest } from "@/lib/supabase-server";
import { hasLiveGuest, resolveAccess } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { GUEST_BRIEFS } from "@/lib/live-guest/guests";
import { publicGuest } from "@/lib/live-guest/engine";
import { guestDifficulty, loadGuestProgress, suggestedGuestIds } from "@/lib/live-guest/difficulty";
import { TASTER_GUEST_ID, tasterUsed } from "@/lib/live-guest/taster";
import { sydneyToday, venueIdsForStaff } from "@/lib/venue-content";
import { loadWeekRow, weekStartOf } from "@/lib/team-week";
import type { SupabaseClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/** The guest the person's manager picked for the team this week (Phase 16), or null. */
async function weekGuestId(admin: SupabaseClient, userId: string): Promise<string | null> {
  try {
    const [venueId] = await venueIdsForStaff(admin, userId);
    if (!venueId) return null;
    return (await loadWeekRow(admin, venueId, weekStartOf(sydneyToday())))?.guest_id ?? null;
  } catch (error) {
    console.error("live-guest/guests: guest of the week failed:", error);
    return null;
  }
}

/**
 * The Live Guest picker: every reviewed guest, without the hidden parts of
 * the brief, with how each would play for this person and a few suggested.
 */
export async function GET(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!rateLimit(`live-guest-list:user:${user.id}`, 30)) {
      return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
    }
    const admin = createSupabaseAdminClient();
    const [access, progress] = await Promise.all([
      resolveAccess(admin, user.id, user.email ?? ""),
      loadGuestProgress(admin, user.id),
    ]);
    const live = GUEST_BRIEFS.filter((g) => g.reviewed);
    // Venue plans only. Everyone else sees the guests with an upgrade prompt.
    const onPlan = hasLiveGuest(access);
    // Off a venue plan, the taster guest is open once (lib/live-guest/taster.ts).
    const used = onPlan ? false : await tasterUsed(admin, user.id);
    const available = (g: (typeof live)[number]) =>
      onPlan ? access.allowedModules.includes(g.moduleId) : g.id === TASTER_GUEST_ID && !used;
    const suggested = onPlan ? suggestedGuestIds(live, progress, available) : new Set(live.filter(available).map((g) => g.id));
    const guests = live.map((g) =>
      publicGuest(g, {
        available: available(g),
        difficulty: guestDifficulty(g, progress),
        passed: progress.passedGuests.has(g.id),
        suggested: suggested.has(g.id),
      }),
    );
    const taster = onPlan ? undefined : { guestId: TASTER_GUEST_ID, used };
    const weekGuest = onPlan ? await weekGuestId(admin, user.id) : null;
    const week = weekGuest && guests.some((g) => g.id === weekGuest && g.available) ? { weekGuestId: weekGuest } : {};
    return NextResponse.json({ guests, onPlan, ...(taster ? { taster } : {}), ...week }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("live-guest/guests error:", error);
    return NextResponse.json({ error: "Could not load the guests." }, { status: 500 });
  }
}
