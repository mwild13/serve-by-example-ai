import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getUserFromRequest } from "@/lib/supabase-server";
import { getMasteryProgress, getReviewQueue, getScenarioMasteryDetails, SCENARIO_COUNTS } from "@/lib/mastery";
import { resolveAccess } from "@/lib/session";

const MANAGEMENT_ROLES = ["Manager", "Supervisor"];

// Legacy 3-module names for backward-compat fields
const LEGACY_MODULES = ["bartending", "sales", "management"] as const;

export async function GET(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createSupabaseAdminClient();

    // ── Legacy mastery progress (modules 1-3 by string name) ──
    const masteryResults = await Promise.all(
      LEGACY_MODULES.map(async (mod) => {
        const progress = await getMasteryProgress(admin, user.id, mod);
        return [mod, progress] as const;
      }),
    );
    const masteryByModule = Object.fromEntries(masteryResults);

    // ── Dynamic module progress (all modules via module_id) ──
    const { data: allModules } = await admin
      .from("modules")
      .select("id, title, category")
      .order("id", { ascending: true });

    // Get all scenario_mastery records for this user that have module_id set
    const { data: masteryRows } = await admin
      .from("scenario_mastery")
      .select("module_id, mastery_level, elo_rating, total_attempts, total_score_points, last_attempt_at")
      .eq("user_id", user.id)
      .not("module_id", "is", null);

    // Aggregate mastery data per module_id
    const moduleProgress: Record<number, {
      scenariosAttempted: number;
      scenariosMastered: number;
      avgElo: number;
      completion: number;
      mastery: number;
    }> = {};

    if (masteryRows && allModules) {
      const byModuleId: Record<number, typeof masteryRows> = {};
      for (const row of masteryRows) {
        if (row.module_id == null) continue;
        (byModuleId[row.module_id] ??= []).push(row);
      }

      for (const mod of allModules) {
        const rows = byModuleId[mod.id] ?? [];
        const attempted = rows.length;
        const mastered = rows.filter((r) => r.mastery_level >= 3).length;
        const totalElo = rows.reduce((sum, r) => sum + (r.elo_rating ?? 1200), 0);
        const scenarioTotal = SCENARIO_COUNTS[`module_${mod.id}`] ?? 10;

        moduleProgress[mod.id] = {
          scenariosAttempted: attempted,
          scenariosMastered: mastered,
          avgElo: attempted > 0 ? Math.round(totalElo / attempted) : 1200,
          completion: attempted > 0 ? Math.round((attempted / scenarioTotal) * 100) : 0,
          mastery: attempted > 0 ? Math.round((mastered / scenarioTotal) * 100) : 0,
        };
      }
    }

    // ── Level progress (Stages 1-3, legacy table) ──
    const { data: levelRows } = await admin
      .from("user_level_progress")
      .select("module, level1_completed, level2_completed, level3_completed, level4_unlocked, level1_score, level2_score, level3_score")
      .eq("user_id", user.id);

    const defaultLevel = { level1_completed: false, level2_completed: false, level3_completed: false, level4_unlocked: false, level1_score: 0, level2_score: 0, level3_score: 0 };
    const levelProgress: Record<string, typeof defaultLevel> = {
      bartending: { ...defaultLevel },
      sales: { ...defaultLevel },
      management: { ...defaultLevel },
    };
    if (levelRows) {
      for (const row of levelRows) {
        if (row.module in levelProgress) {
          levelProgress[row.module] = {
            level1_completed: row.level1_completed,
            level2_completed: row.level2_completed,
            level3_completed: row.level3_completed,
            level4_unlocked: row.level4_unlocked,
            level1_score: row.level1_score,
            level2_score: row.level2_score,
            level3_score: row.level3_score,
          };
        }
      }
    }

    // ── Most recent training attempt (for "last trained" display) ──
    const { data: recentAttemptRow } = await admin
      .from("scenario_mastery")
      .select("last_attempt_at")
      .eq("user_id", user.id)
      .not("last_attempt_at", "is", null)
      .order("last_attempt_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const lastAttemptAt = recentAttemptRow?.last_attempt_at ?? null;

    // ── Spaced repetition queue ──
    const reviewQueue = await getReviewQueue(admin, user.id);

    // ── Per-scenario mastery details (for a specific module if requested) ──
    const url = new URL(req.url);
    const detailModule = url.searchParams.get("detail");
    let scenarioDetails: Awaited<ReturnType<typeof getScenarioMasteryDetails>> | null = null;
    if (detailModule && LEGACY_MODULES.includes(detailModule as typeof LEGACY_MODULES[number])) {
      scenarioDetails = await getScenarioMasteryDetails(admin, user.id, detailModule);
    }

    // ── Staff role & management auto-unlock ──
    let staffRole: string | null = null;
    let autoUnlockManagement = false;
    const access = await resolveAccess(admin, user.id, user.email ?? "");

    if (user.email) {
      const { data: staffRows } = await admin
        .from("venue_staff")
        .select("id, role, staff_user_id")
        .eq("email", user.email);

      if (staffRows && staffRows.length > 0) {
        staffRole = staffRows[0].role as string;

        const unlinked = staffRows.filter((r) => !r.staff_user_id);
        if (unlinked.length > 0) {
          await admin
            .from("venue_staff")
            .update({ staff_user_id: user.id })
            .eq("email", user.email)
            .is("staff_user_id", null)
            .then();
        }

        if (MANAGEMENT_ROLES.includes(staffRole)) {
          autoUnlockManagement = true;
          await admin
            .from("profiles")
            .update({ management_unlocked: true })
            .eq("id", user.id)
            .then();
        }
      }
    }

    return NextResponse.json({
      // Legacy 3-module fields (backward compat)
      modules: {
        bartending: masteryByModule["bartending"].completion,
        sales: masteryByModule["sales"].completion,
        management: masteryByModule["management"].completion,
      },
      mastery: {
        bartending: masteryByModule["bartending"].mastery,
        sales: masteryByModule["sales"].mastery,
        management: masteryByModule["management"].mastery,
      },
      scores: {
        bartending: masteryByModule["bartending"].avgScore,
        sales: masteryByModule["sales"].avgScore,
        management: masteryByModule["management"].avgScore,
      },
      sessions: {
        bartending: masteryByModule["bartending"].totalAttempts,
        sales: masteryByModule["sales"].totalAttempts,
        management: masteryByModule["management"].totalAttempts,
      },
      elo: {
        bartending: masteryByModule["bartending"].avgElo,
        sales: masteryByModule["sales"].avgElo,
        management: masteryByModule["management"].avgElo,
      },
      scenariosMastered: {
        bartending: masteryByModule["bartending"].scenariosMastered,
        sales: masteryByModule["sales"].scenariosMastered,
        management: masteryByModule["management"].scenariosMastered,
      },
      scenariosAttempted: {
        bartending: masteryByModule["bartending"].scenariosAttempted,
        sales: masteryByModule["sales"].scenariosAttempted,
        management: masteryByModule["management"].scenariosAttempted,
      },
      // New: per-module progress for all 20 modules
      moduleProgress,
      allModules: allModules ?? [],
      scenarioCounts: SCENARIO_COUNTS,
      levelProgress,
      reviewQueue,
      lastAttemptAt,
      scenarioDetails,
      staffRole,
      autoUnlockManagement,
      access: {
        tier: access.tier,
        allowedModules: access.allowedModules,
        isSponsored: access.isSponsored,
      },
    });
  } catch (error) {
    console.error("Training progress error:", error);
    return NextResponse.json({ error: "Failed to load training progress." }, { status: 500 });
  }
}
