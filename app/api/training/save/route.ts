import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getUserFromRequest } from "@/lib/supabase-server";
import { recordAttempt, syncMasteryToVenueStaff, moduleIdToString, SCENARIO_COUNTS, type ConfidenceLevel } from "@/lib/mastery";
import { resolveAccess, validateSession } from "@/lib/session";

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
        .from("user_training_progress")
        .select("scenarios_completed, total_score_points")
        .eq("user_id", user.id)
        .eq("module", moduleName)
        .maybeSingle();

      const newScenarios = (existing?.scenarios_completed ?? 0) + 1;
      const newTotalScore = (existing?.total_score_points ?? 0) + overallScore;

      await admin.from("user_training_progress").upsert(
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
      // StageLearning sends stageLevel + completed:true when a stage finishes.
      // user_level_progress drives the badge awards in ProgressOverview —
      // without this update, badges are permanently locked regardless of effort.
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

    // ── Sync mastery data to venue_staff for management dashboard ──
    if (user.email) {
      await syncMasteryToVenueStaff(admin, user.id, user.email);
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
