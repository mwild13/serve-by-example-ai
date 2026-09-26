/**
 * training-attempt.ts – Server-side persistence for Scenario Training attempts.
 *
 * Called by /api/evaluate straight after it grades a response, so the score
 * written to mastery is always the one the server produced. It used to live
 * in /api/training/save, which took `overallScore` from the browser: any
 * signed-in user could post a perfect score for every scenario and show as
 * fully compliant on their manager's dashboard.
 *
 * See docs/handoff/security/2026-09-26-ai-token-abuse-and-request-races.md.
 */

import type { User } from "@supabase/supabase-js";
import type { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { recordAttempt, syncMasteryToVenueStaff, type ConfidenceLevel, type RecordAttemptResult } from "@/lib/mastery";

type AdminClient = ReturnType<typeof createSupabaseAdminClient>;

/** Pass mark for the Pro-badge streak, on the 0-25 Scenario Training scale. */
const STREAK_PASS_SCORE = 15;

/** Reads one cookie from a request's Cookie header. */
export function getCookieValue(req: Request, cookieName: string): string | null {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return null;

  const pair = cookieHeader
    .split(";")
    .map((chunk) => chunk.trim())
    .find((chunk) => chunk.startsWith(`${cookieName}=`));

  if (!pair) return null;
  const [, value = ""] = pair.split("=");
  return value || null;
}

/** Stamps trial_activated_at on the staff member's org the first time they make progress. */
export async function maybeMarkTrialActivated(admin: AdminClient, userEmail: string): Promise<void> {
  // Join membership + manager profile in one query (2 round-trips instead of 3).
  const { data: membership } = await admin
    .from("organization_members")
    .select("manager_id, profiles!manager_id(org_id)")
    .eq("staff_email", userEmail.toLowerCase())
    .in("status", ["invited", "active"])
    .limit(1)
    .maybeSingle();

  const profilesResult = membership?.profiles as { org_id: string | null }[] | { org_id: string | null } | null | undefined;
  const orgId = Array.isArray(profilesResult) ? profilesResult[0]?.org_id : profilesResult?.org_id;
  if (!orgId) return;

  const { data: org } = await admin
    .from("organizations")
    .select("trial_activated_at, trial_tier, trial_converted")
    .eq("id", orgId)
    .single();

  // Already activated or no trial — nothing to do.
  if (!org?.trial_tier || org.trial_converted || org.trial_activated_at) return;

  await admin
    .from("organizations")
    .update({ trial_activated_at: new Date().toISOString() })
    .eq("id", orgId);
}

export type ScenarioAttemptInput = {
  moduleName: string;
  moduleId: number;
  scenarioIndex: number;
  /** Must come from the server's own evaluation, never from the request body. */
  overallScore: number;
  confidence: ConfidenceLevel;
};

/**
 * Records a graded Scenario Training (descriptor) attempt: mastery engine,
 * legacy per-module progress, the Pro-badge streak, and the manager-facing
 * venue_staff sync.
 */
export async function recordScenarioAttempt(
  admin: AdminClient,
  user: User,
  input: ScenarioAttemptInput,
): Promise<RecordAttemptResult> {
  const { moduleName, moduleId, scenarioIndex, overallScore, confidence } = input;

  const result = await recordAttempt(admin, {
    userId: user.id,
    module: moduleName,
    moduleId,
    scenarioType: "descriptor",
    scenarioIndex,
    overallScore,
    confidence,
  });

  // ── Legacy user_training_progress for backward compat (modules 1-3) ──
  if (moduleId <= 3) {
    const now = new Date().toISOString();
    const { data: existing } = await admin
      .from("_legacy_user_training_progress")
      .select("scenarios_completed, total_score_points")
      .eq("user_id", user.id)
      .eq("module", moduleName)
      .maybeSingle();

    await admin.from("_legacy_user_training_progress").upsert(
      {
        user_id: user.id,
        module: moduleName,
        scenarios_completed: (existing?.scenarios_completed ?? 0) + 1,
        total_score_points: (existing?.total_score_points ?? 0) + overallScore,
        last_active_at: now,
        updated_at: now,
      },
      { onConflict: "user_id,module" },
    );
  }

  // ── Consecutive-correct streak tracking (for Pro badge) ──────
  // On pass: increment running streak and update best if higher. On fail:
  // reset to 0. Skipped for spam-guarded (non-genuine) attempts.
  if (!result.spamGuarded) {
    const passed = overallScore >= STREAK_PASS_SCORE;
    const { data: profile } = await admin
      .from("profiles")
      .select("current_correct_streak, best_correct_streak")
      .eq("id", user.id)
      .single();

    if (profile) {
      const newCurrent = passed ? (profile.current_correct_streak ?? 0) + 1 : 0;
      const newBest = Math.max(profile.best_correct_streak ?? 0, newCurrent);
      await admin
        .from("profiles")
        .update({ current_correct_streak: newCurrent, best_correct_streak: newBest })
        .eq("id", user.id);
    }
  }

  // ── Sync mastery data to venue_staff for management dashboard ──
  if (user.email) {
    await syncMasteryToVenueStaff(admin, user.id, user.email);
    await maybeMarkTrialActivated(admin, user.email);
  }

  return result;
}
