import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getUserFromRequest } from "@/lib/supabase-server";
import { hasLiveGuest, resolveAccess } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { GUEST_BRIEFS } from "@/lib/live-guest/guests";
import { publicGuest } from "@/lib/live-guest/engine";
import { guestDifficulty, loadGuestProgress, suggestedGuestIds } from "@/lib/live-guest/difficulty";
import { TASTER_GUEST_ID, tasterUsed } from "@/lib/live-guest/taster";

export const dynamic = "force-dynamic";

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
    return NextResponse.json({ guests, onPlan, ...(taster ? { taster } : {}) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("live-guest/guests error:", error);
    return NextResponse.json({ error: "Could not load the guests." }, { status: 500 });
  }
}
