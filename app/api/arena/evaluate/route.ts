import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase-server";

/**
 * Retired in the Rich update, Phase 8: the AI Arena became Live Guest
 * (/api/live-guest/*). No AI call is made here any more. Earlier results stay
 * in training_attempts and scenario_mastery.
 *
 * Kept as a 410 so an older cached client gets a clear "refresh" message
 * rather than a 404, as /api/training/save does.
 */
export async function POST(req: Request) {
  const { user } = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }
  return NextResponse.json(
    { error: "This version of the app is out of date. Please refresh the page.", code: "ROUTE_RETIRED" },
    { status: 410 },
  );
}
