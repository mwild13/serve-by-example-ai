import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase-server";

/**
 * Retired. Both things this route recorded now happen where the grading does:
 *
 *   - Scenario Training scores: /api/evaluate records the score it produced
 *     (2026-09-26 — this route used to take overallScore from the browser).
 *   - Verify quiz mastery: /api/training/verify/start + /answer grade each
 *     answer server-side (audit 2026-09-30, C4 — this route used to accept
 *     the client's list of "correct" answers, checked against a key that
 *     also shipped in the browser bundle).
 *
 * Kept as a 410 so an older cached client gets a clear "refresh" message
 * rather than a 404.
 */
export async function POST(req: Request) {
  const { user } = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }
  console.warn(JSON.stringify({ event: "training_save_retired_called", userId: user.id }));
  return NextResponse.json(
    { error: "This version of the app is out of date. Please refresh the page.", code: "ROUTE_RETIRED" },
    { status: 410 },
  );
}
