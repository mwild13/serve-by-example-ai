import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getUserFromRequest } from "@/lib/supabase-server";
import { rateLimit } from "@/lib/rate-limit";
import { sydneyToday, venueIdsForStaff } from "@/lib/venue-content";
import { guestOfWeek, loadWeekRow, teamGoal, teamUserIds, weekStartOf } from "@/lib/team-week";
import type { TeamWeek } from "@/lib/team-week-shared";

export const dynamic = "force-dynamic";

/**
 * This week at the person's venue (Rich update, Phase 16): the team goal and
 * how far the team has got, and the guest of the week. Team totals only.
 * { week: null } when they aren't in a venue or nothing is set.
 */
export async function GET(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    if (!rateLimit(`team-week:user:${user.id}`, 30)) {
      return NextResponse.json({ error: "Too many requests. Try again in a minute.", code: "RATE_LIMITED" }, { status: 429 });
    }
    const admin = createSupabaseAdminClient();
    const [venueId] = await venueIdsForStaff(admin, user.id);
    if (!venueId) return NextResponse.json({ week: null });

    const weekStart = weekStartOf(sydneyToday());
    const row = await loadWeekRow(admin, venueId, weekStart);
    if (!row || (!row.goal_kind && !row.guest_id)) return NextResponse.json({ week: null });

    const [venue, team] = await Promise.all([admin.from("venues").select("name").eq("id", venueId).maybeSingle(), teamUserIds(admin, venueId)]);
    const [goal, guest] = await Promise.all([teamGoal(admin, row, team, weekStart), guestOfWeek(admin, row.guest_id, team, weekStart)]);
    const week: TeamWeek = { venueName: (venue.data?.name as string | undefined) ?? "Your venue", weekStart, teamSize: team.length, goal, guest };
    return NextResponse.json({ week });
  } catch (error) {
    console.error("team-week GET error:", error);
    // Home still loads without it.
    return NextResponse.json({ week: null });
  }
}
