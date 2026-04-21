import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getUserFromRequest } from "@/lib/supabase-server";
import { recordAttempt, syncMasteryToVenueStaff, moduleIdToString, type ConfidenceLevel } from "@/lib/mastery";
import { resolveAccess } from "@/lib/session";

// Legacy 3-module string names (backward compat)
const LEGACY_MODULES = ["bartending", "sales", "management"] as const;
type LegacyModule = (typeof LEGACY_MODULES)[number];
const LEGACY_MODULE_ID: Record<LegacyModule, number> = { bartending: 1, sales: 2, management: 3 };

const VALID_CONFIDENCE = ["low", "medium", "high"] as const;

export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
      return NextResponse.json({ error: "Invalid module." }, { status: 400 });
    }

    // ── Tier-based access gate ─────────────────────────────────
    const admin = createSupabaseAdminClient();
    const access = await resolveAccess(admin, user.id, user.email ?? "");
    if (moduleId && !access.allowedModules.includes(moduleId)) {
      return NextResponse.json(
        { error: "Your current plan does not include this module. Please upgrade." },
        { status: 403 },
      );
    }

    if (!Number.isFinite(overallScore) || overallScore < 0 || overallScore > 25) {
      return NextResponse.json({ error: "Invalid score." }, { status: 400 });
    }
    if (!Number.isFinite(scenarioIndex) || scenarioIndex < 0) {
      return NextResponse.json({ error: "Invalid scenario index." }, { status: 400 });
    }
    if (!VALID_CONFIDENCE.includes(confidence as typeof VALID_CONFIDENCE[number])) {
      return NextResponse.json({ error: "Invalid confidence level." }, { status: 400 });
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
    return NextResponse.json({ error: "Failed to save training progress." }, { status: 500 });
  }
}
