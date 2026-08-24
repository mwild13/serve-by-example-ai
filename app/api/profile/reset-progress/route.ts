import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// Mobile bug-fix plan, Phase 3a — "Reset progress" from Me > Settings.
// Irreversible from the user's perspective (the settings UI requires a
// type-to-confirm step before this ever fires), but NOT a hard SQL DELETE
// underneath: scenario_mastery and user_challenges are soft-deleted
// (archived_at = NOW()) so the manager-facing compliance/analytics rollup
// in Mission Control (lib/mastery.ts's syncMasteryToVenueStaff()) retains
// history — see 20260824_reset_progress_soft_delete.sql's header comment
// for the full rationale. user_level_progress and
// _legacy_user_training_progress are legacy 3-stage tracking tables that
// don't feed that manager-facing rollup, so they're hard-deleted directly,
// matching the convention the existing (unwired) app/api/profile/delete
// route already uses for those two tables.
//
// Deliberately narrower than app/api/profile/delete/route.ts: this keeps
// the account, auth.users row, profiles row, and venue/organization
// membership fully intact — only training-progress data clears. Also does
// NOT touch module_elo_baseline (the onboarding diagnostic seed) or
// profiles.diagnostic_completed/onboarding_completed — resetting progress
// isn't the same as re-triggering onboarding, and this repo's own recent
// history includes an onboarding-loop bug fix, so that flag is left alone
// deliberately rather than reset as a "nice to have".

export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Destructive, low-frequency action — a tight limit is appropriate (not
    // the "absorb rapid screen navigation" rate the read-heavy training
    // routes use).
    const ip = getClientIp(req);
    if (!rateLimit(`reset-progress:user:${user.id}`, 3) || !rateLimit(`reset-progress:ip:${ip}`, 3)) {
      return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
    }

    const admin = createSupabaseAdminClient();
    const now = new Date().toISOString();

    const { error: masteryError } = await admin
      .from("scenario_mastery")
      .update({ archived_at: now })
      .eq("user_id", user.id)
      .is("archived_at", null);
    if (masteryError) throw masteryError;

    const { error: challengesError } = await admin
      .from("user_challenges")
      .update({ archived_at: now })
      .eq("user_id", user.id)
      .is("archived_at", null);
    if (challengesError) throw challengesError;

    // Legacy 3-stage tracking — not read by any manager-facing rollup, so a
    // plain hard delete is fine here (matches app/api/profile/delete's own
    // convention for these two tables).
    await admin.from("user_level_progress").delete().eq("user_id", user.id);
    await admin.from("_legacy_user_training_progress").delete().eq("user_id", user.id);

    // Streak/badge counters live on profiles itself, not scenario_mastery —
    // reset those too so a "fresh start" reads as fresh everywhere on the
    // Me page, not just the module/category bars.
    await admin
      .from("profiles")
      .update({ current_correct_streak: 0, best_correct_streak: 0 })
      .eq("id", user.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[reset-progress] Failed:", err);
    return NextResponse.json({ error: "Could not reset progress. Please try again." }, { status: 500 });
  }
}
