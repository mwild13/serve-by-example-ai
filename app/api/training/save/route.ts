import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getUserFromRequest } from "@/lib/supabase-server";
import { recordAttempt, syncMasteryToVenueStaff, markModuleMastered, moduleIdToString, SCENARIO_COUNTS, type ConfidenceLevel } from "@/lib/mastery";
import { resolveAccess, validateSession } from "@/lib/session";
import { VERIFY_QUESTIONS } from "@/lib/verify-questions";

const VERIFY_PASS_THRESHOLD = 4; // must match ModuleVerify PASS_THRESHOLD

async function maybeMarkTrialActivated(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  userEmail: string,
): Promise<void> {
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

// Legacy 3-module string names (backward compat)
const LEGACY_MODULES = ["bartending", "sales", "management"] as const;
type LegacyModule = (typeof LEGACY_MODULES)[number];
const LEGACY_MODULE_ID: Record<LegacyModule, number> = { bartending: 1, sales: 2, management: 3 };

const VALID_CONFIDENCE = ["low", "medium", "high"] as const;

function getCookieValue(req: Request, cookieName: string): string | null {
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

export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await req.json();
    const overallScore = Number(body.overallScore);
    const scenarioIndex = Number(body.scenarioIndex ?? 0);
    const confidence = (body.confidence ?? "medium") as ConfidenceLevel;

    // V3 ModuleVerify signal — flips is_mastered for (user, module).
    const verifyPassed = Boolean(body.verifyPassed);

    // Support both new numeric moduleId and legacy string module name
    const rawModuleId = body.moduleId != null ? Number(body.moduleId) : null;
    const rawModuleName = body.module as string | undefined;

    // Resolve to canonical values
    let moduleId: number | null = null;
    let moduleName: string;

    if (rawModuleId != null && Number.isFinite(rawModuleId) && rawModuleId >= 1 && rawModuleId <= 100) {
      moduleId = rawModuleId;
      moduleName = moduleIdToString(rawModuleId);
    } else if (rawModuleName && LEGACY_MODULES.includes(rawModuleName as LegacyModule)) {
      moduleName = rawModuleName;
      moduleId = LEGACY_MODULE_ID[rawModuleName as LegacyModule];
    } else {
      return NextResponse.json({ error: "Invalid module.", code: "INVALID_MODULE" }, { status: 400 });
    }

    // ── Tier-based access gate ─────────────────────────────────
    const admin = createSupabaseAdminClient();

    // ── Session displacement check for protected write route ───
    const browserSessionId = getCookieValue(req, "sbe_session_id");
    if (!browserSessionId) {
      return NextResponse.json(
        { error: "Missing active session. Please sign in again.", code: "SESSION_REQUIRED" },
        { status: 401 },
      );
    }

    const sessionValidation = await validateSession(admin, user.id, browserSessionId);
    if (!sessionValidation.valid) {
      return NextResponse.json(
        { error: "Session conflict detected. Please resume this device.", code: "SESSION_CONFLICT" },
        { status: 409 },
      );
    }

    const access = await resolveAccess(admin, user.id, user.email ?? "");
    if (moduleId && !access.allowedModules.includes(moduleId)) {
      return NextResponse.json(
        { error: "Your current plan does not include this module. Please upgrade.", code: "MODULE_ACCESS_DENIED" },
        { status: 403 },
      );
    }

    // ── V3 Verify pass branch ─────────────────────────────────
    // ModuleVerify posts { verifyPassed: true, answers: [{id, answer}] }.
    // Validate submitted answers server-side against the static question bank
    // before writing is_mastered — never trust the client's score directly.
    if (verifyPassed && moduleId) {
      const questions = VERIFY_QUESTIONS[moduleId];
      const rawAnswers: unknown[] = Array.isArray(body.answers) ? body.answers : [];

      const validatedCount = !questions ? 0 : rawAnswers.reduce((count: number, entry: unknown) => {
        if (!entry || typeof entry !== "object") return count;
        const e = entry as Partial<{ id: string; answer: string }>;
        if (typeof e.id !== "string" || typeof e.answer !== "string") return count;
        const idx = parseInt(e.id.split("-").pop() ?? "", 10);
        if (isNaN(idx) || idx < 0 || idx >= questions.length) return count;
        return questions[idx].answer.toLowerCase() === e.answer.toLowerCase() ? count + 1 : count;
      }, 0);

      if (validatedCount < VERIFY_PASS_THRESHOLD) {
        return NextResponse.json({ error: "Quiz not passed.", code: "QUIZ_NOT_PASSED" }, { status: 403 });
      }

      const result = await markModuleMastered(admin, {
        userId: user.id,
        moduleId,
        consecutiveCorrect: validatedCount,
      });
      if (user.email) {
        await syncMasteryToVenueStaff(admin, user.id, user.email);
        await maybeMarkTrialActivated(admin, user.email);
      }

      // ── SBE Elite badge check (only on a fresh mastery, once per lifetime) ──
      // Guard: only runs if this module was not already mastered and the user
      // hasn't yet received their Elite badge, preventing infinite increments.
      if (!result.alreadyMastered) {
        const { data: profile } = await admin
          .from("profiles")
          .select("all_modules_completed")
          .eq("id", user.id)
          .single();

        if (profile && !profile.all_modules_completed) {
          const { count } = await admin
            .from("mastery_rows")
            .select("module_id", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("is_mastered", true);

          if ((count ?? 0) >= 20) {
            await admin
              .from("profiles")
              .update({ sbe_elite_number: 1, all_modules_completed: true })
              .eq("id", user.id);
          }
        }
      }

      return NextResponse.json({
        success: true,
        v3: {
          isMastered: result.isMastered,
          alreadyMastered: result.alreadyMastered,
          moduleId,
        },
      });
    }

    if (!Number.isFinite(overallScore) || overallScore < 0 || overallScore > 25) {
      return NextResponse.json({ error: "Invalid score.", code: "INVALID_SCORE" }, { status: 400 });
    }
    if (!Number.isFinite(scenarioIndex) || scenarioIndex < 0) {
      return NextResponse.json({ error: "Invalid scenario index.", code: "INVALID_SCENARIO_INDEX" }, { status: 400 });
    }
    const moduleScenarioCount = SCENARIO_COUNTS[moduleName] ?? 20;
    if (scenarioIndex >= moduleScenarioCount) {
      return NextResponse.json(
        {
          error: `Invalid scenario index. Max for ${moduleName} is ${moduleScenarioCount - 1}.`,
          code: "SCENARIO_OUT_OF_RANGE",
        },
        { status: 400 },
      );
    }
    if (!VALID_CONFIDENCE.includes(confidence as typeof VALID_CONFIDENCE[number])) {
      return NextResponse.json({ error: "Invalid confidence level.", code: "INVALID_CONFIDENCE" }, { status: 400 });
    }

    // ── Record attempt in mastery engine ──────────────────────
    const result = await recordAttempt(admin, {
      userId: user.id,
      module: moduleName,
      moduleId: moduleId ?? undefined,
      scenarioIndex,
      overallScore,
      confidence,
    });

    // ── Update legacy user_training_progress for backward compat ──
    // Only for legacy 3-module system (modules 1-3)
    if (moduleId && moduleId <= 3) {
      const now = new Date().toISOString();
      const { data: existing } = await admin
        .from("_legacy_user_training_progress")
        .select("scenarios_completed, total_score_points")
        .eq("user_id", user.id)
        .eq("module", moduleName)
        .maybeSingle();

      const newScenarios = (existing?.scenarios_completed ?? 0) + 1;
      const newTotalScore = (existing?.total_score_points ?? 0) + overallScore;

      await admin.from("_legacy_user_training_progress").upsert(
        {
          user_id: user.id,
          module: moduleName,
          scenarios_completed: newScenarios,
          total_score_points: newTotalScore,
          last_active_at: now,
          updated_at: now,
        },
        { onConflict: "user_id,module" },
      );

      // ── Update stage completion for badge/progress display ──
      // Legacy stageLevel + completed:true path — drives badge awards in ProgressOverview.
      // user_level_progress must be updated here or badges remain permanently locked.
      const stageLevel = Number(body.stageLevel);
      const stageCompleted = Boolean(body.completed);

      if (stageLevel >= 1 && stageLevel <= 3 && stageCompleted) {
        const { data: existingLevel } = await admin
          .from("user_level_progress")
          .select("*")
          .eq("user_id", user.id)
          .eq("module", moduleName)
          .maybeSingle();

        const stageScoreKey = `level${stageLevel}_score` as
          | "level1_score"
          | "level2_score"
          | "level3_score";
        const stageCompletedKey = `level${stageLevel}_completed` as
          | "level1_completed"
          | "level2_completed"
          | "level3_completed";

        await admin.from("user_level_progress").upsert(
          {
            user_id: user.id,
            module: moduleName,
            current_level: Math.max(stageLevel, existingLevel?.current_level ?? 1),
            level1_score: existingLevel?.level1_score ?? 0,
            level1_completed: existingLevel?.level1_completed ?? false,
            level2_score: existingLevel?.level2_score ?? 0,
            level2_completed: existingLevel?.level2_completed ?? false,
            level3_score: existingLevel?.level3_score ?? 0,
            level3_completed: existingLevel?.level3_completed ?? false,
            level4_unlocked: stageLevel >= 3 ? true : (existingLevel?.level4_unlocked ?? false),
            [stageScoreKey]: overallScore,
            [stageCompletedKey]: true,
            last_active_at: now,
            updated_at: now,
          },
          { onConflict: "user_id,module" },
        );
      }
    }

    // ── Consecutive-correct streak tracking (for Pro badge) ──────
    // Pass threshold = 15/25. On pass: increment running streak and update
    // best if higher. On fail: reset running streak to 0.
    // Fires only when the attempt was not spam-guarded (genuine attempt).
    if (!result.spamGuarded) {
      const passed = overallScore >= 15;
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

    return NextResponse.json({
      success: true,
      mastery: {
        level: result.masteryLevel,
        previousLevel: result.previousLevel,
        levelChanged: result.levelChanged,
        spamGuarded: result.spamGuarded,
        eloRating: result.eloRating,
        eloDelta: result.eloDelta,
        isBridge: result.isBridge,
        consecutiveFails: result.consecutiveFails,
        confidenceAccuracy: result.confidenceAccuracy,
        nextReviewAt: result.nextReviewAt,
      },
    });
  } catch (error) {
    console.error("Training save error:", error);
    return NextResponse.json(
      { error: "Failed to save training progress.", code: "TRAINING_SAVE_FAILED" },
      { status: 500 },
    );
  }
}
