import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getUserFromRequest } from "@/lib/supabase-server";
import { hasLiveGuest, resolveAccess } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { GUEST_BRIEFS } from "@/lib/live-guest/guests";
import { publicGuest } from "@/lib/live-guest/engine";
import { guestDifficulty, loadGuestProgress, suggestedGuestIds } from "@/lib/live-guest/difficulty";

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
    const available = (g: (typeof live)[number]) => onPlan && access.allowedModules.includes(g.moduleId);
    const suggested = suggestedGuestIds(live, progress, available);
    const guests = live.map((g) =>
      publicGuest(g, {
        available: available(g),
        difficulty: guestDifficulty(g, progress),
        passed: progress.passedGuests.has(g.id),
        suggested: suggested.has(g.id),
      }),
    );
    return NextResponse.json({ guests, onPlan }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("live-guest/guests error:", error);
    return NextResponse.json({ error: "Could not load the guests." }, { status: 500 });
  }
}
