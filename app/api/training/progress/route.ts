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

    // ── Fire all independent reads in parallel ──
    const url = new URL(req.url);
    const detailModule = url.searchParams.get("detail");

    const [
      masteryResults,
      { data: allModules },
      { data: masteryRows },
      { data: arenaRows },
      { data: profileRow },
      { data: levelRows },
      { data: recentAttemptRow },
      reviewQueue,
      access,
      { data: staffRows },
      scenarioDetails,
    ] = await Promise.all([
      Promise.all(
        LEGACY_MODULES.map(async (mod) => {
          const progress = await getMasteryProgress(admin, user.id, mod);
          return [mod, progress] as const;
        }),
      ),
      admin
        .from("modules")
        .select("id, title, category, description, difficulty_level")
        .order("id", { ascending: true }),
      admin
        .from("scenario_mastery")
        .select("module_id, mastery_level, elo_rating, total_attempts, total_score_points, last_attempt_at, is_mastered")
        .eq("user_id", user.id)
        .not("module_id", "is", null),
      admin
        .from("scenario_mastery")
        .select("module_id, best_score, total_attempts, mastery_level")
        .eq("user_id", user.id)
        .eq("scenario_index", 40)
        .not("module_id", "is", null),
      admin
        .from("profiles")
        .select("best_correct_streak, sbe_elite_number")
        .eq("id", user.id)
        .maybeSingle(),
      admin
        .from("user_level_progress")
        .select("module, level1_completed, level2_completed, level3_completed, level4_unlocked, level1_score, level2_score, level3_score")
        .eq("user_id", user.id),
      admin
        .from("scenario_mastery")
        .select("last_attempt_at")
        .eq("user_id", user.id)
        .not("last_attempt_at", "is", null)
        .order("last_attempt_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      getReviewQueue(admin, user.id),
      resolveAccess(admin, user.id, user.email ?? ""),
      user.email
        ? admin.from("venue_staff").select("id, role, staff_user_id").ilike("email", user.email)
        : Promise.resolve({ data: null as { id: string; role: string; staff_user_id: string | null }[] | null }),
      detailModule && LEGACY_MODULES.includes(detailModule as typeof LEGACY_MODULES[number])
        ? getScenarioMasteryDetails(admin, user.id, detailModule)
        : Promise.resolve(null),
    ]);

    const masteryByModule = Object.fromEntries(masteryResults);

    // ── Dynamic module progress (all modules via module_id) ──
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
        // ModuleVerify writes a single row with is_mastered=true — treat as 100% if present
        const hasVerified = rows.some((r) => (r as { is_mastered?: boolean | null }).is_mastered === true);

        moduleProgress[mod.id] = {
          scenariosAttempted: attempted,
          scenariosMastered: mastered,
          avgElo: attempted > 0 ? Math.round(totalElo / attempted) : 1200,
          completion: hasVerified ? 100 : (attempted > 0 ? Math.round((attempted / scenarioTotal) * 100) : 0),
          mastery: hasVerified ? 100 : (attempted > 0 ? Math.round((mastered / scenarioTotal) * 100) : 0),
        };
      }
    }

    // ── Canonical skill level (mastered modules / total × 10) ──
    const masteredModuleCount = allModules
      ? allModules.filter((mod) => (moduleProgress[mod.id]?.mastery ?? 0) >= 80).length
      : 0;
    const totalModuleCount = allModules?.length ?? 20;
    const scenariosStartedCount = allModules
      ? allModules.filter((mod) => (moduleProgress[mod.id]?.scenariosAttempted ?? 0) > 0).length
      : 0;
    const skillLevel = Math.min(
      10,
      Math.max(1, Math.round((masteredModuleCount / Math.max(totalModuleCount, 1)) * 10)),
    );

    // ── Arena progress (derived from parallel arenaRows fetch) ──
    const arenaProgress: Record<number, { attempts: number; bestScore: number; passed: boolean }> = {};
    if (arenaRows) {
      for (const row of arenaRows) {
        if (row.module_id == null) continue;
        arenaProgress[row.module_id] = {
          attempts: (row.total_attempts as number) ?? 0,
          bestScore: (row.best_score as number) ?? 0,
          passed: ((row.mastery_level as number) ?? 0) >= 3,
        };
      }
    }

    const bestCorrectStreak = (profileRow?.best_correct_streak as number) ?? 0;
    const sbeEliteNumber = (profileRow?.sbe_elite_number as number) ?? 0;

    // ── Level progress (Stages 1-3, legacy table) ──
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

    const lastAttemptAt = recentAttemptRow?.last_attempt_at ?? null;

    // ── Best Live Scenario score — derived from arenaRows (no extra query needed) ──
    const bestArenaScore: number = arenaRows
      ? Math.max(0, ...arenaRows.map((r) => (r.best_score as number | null) ?? 0))
      : 0;

    // ── Staff role & management auto-unlock (conditional writes, run after reads) ──
    let staffRole: string | null = null;
    let autoUnlockManagement = false;

    if (staffRows && staffRows.length > 0) {
      staffRole = staffRows[0].role as string;

      const unlinked = staffRows.filter((r) => !r.staff_user_id);
      if (unlinked.length > 0) {
        await admin
          .from("venue_staff")
          .update({ staff_user_id: user.id })
          .ilike("email", user.email!)
          .is("staff_user_id", null)
          .then();
      }

      // Only auto-unlock management for users with their own paid plan.
      // Sponsored venue staff (isSponsored = true) must never receive management access.
      if (MANAGEMENT_ROLES.includes(staffRole) && !access.isSponsored) {
        autoUnlockManagement = true;
        await admin
          .from("profiles")
          .update({ management_unlocked: true })
          .eq("id", user.id)
          .then();
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
      // Canonical skill level (same formula for all views)
      skillLevel,
      // Server-computed tracker counts (avoids client-side key-lookup issues)
      masteredModuleCount,
      totalModuleCount,
      scenariosStartedCount,
      arenaModuleCount: Object.keys(arenaProgress).length,
      // New: per-module progress for all 20 modules
      moduleProgress,
      allModules: allModules ?? [],
      arenaProgress,
      scenarioCounts: SCENARIO_COUNTS,
      levelProgress,
      reviewQueue,
      lastAttemptAt,
      scenarioDetails,
      bestCorrectStreak,
      sbeEliteNumber,
      staffRole,
      autoUnlockManagement,
      bestArenaScore,
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
