import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getUserFromRequest } from "@/lib/supabase-server";
import { getMasteryProgress, getReviewQueue, getScenarioMasteryDetails, SCENARIO_COUNTS } from "@/lib/mastery";
import { resolveAccess } from "@/lib/session";

const MANAGEMENT_ROLES = ["Manager", "Supervisor"];

export async function GET(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createSupabaseAdminClient();
    const modules = ["bartending", "sales", "management"] as const;

    // ── Mastery-based progress for each module ──
    const masteryResults = await Promise.all(
      modules.map(async (mod) => {
        const progress = await getMasteryProgress(admin, user.id, mod);
        return [mod, progress] as const;
      }),
    );
    const masteryByModule = Object.fromEntries(masteryResults);

    // Module completion % (mastery_level >= 1 / total scenarios)
    const moduleCompletion = {
      bartending: masteryByModule["bartending"].completion,
      sales: masteryByModule["sales"].completion,
      management: masteryByModule["management"].completion,
    };

    // Module mastery % (mastery_level == 3 / total scenarios)
    const moduleMastery = {
      bartending: masteryByModule["bartending"].mastery,
      sales: masteryByModule["sales"].mastery,
      management: masteryByModule["management"].mastery,
    };

    // Average score per module (0–25 scale)
    const scores = {
      bartending: masteryByModule["bartending"].avgScore,
      sales: masteryByModule["sales"].avgScore,
      management: masteryByModule["management"].avgScore,
    };

    // Total attempts per module
    const sessions = {
      bartending: masteryByModule["bartending"].totalAttempts,
      sales: masteryByModule["sales"].totalAttempts,
      management: masteryByModule["management"].totalAttempts,
    };

    // Elo ratings
    const elo = {
      bartending: masteryByModule["bartending"].avgElo,
      sales: masteryByModule["sales"].avgElo,
      management: masteryByModule["management"].avgElo,
    };

    // Scenarios mastered / attempted
    const scenariosMastered = {
      bartending: masteryByModule["bartending"].scenariosMastered,
      sales: masteryByModule["sales"].scenariosMastered,
      management: masteryByModule["management"].scenariosMastered,
    };

    const scenariosAttempted = {
      bartending: masteryByModule["bartending"].scenariosAttempted,
      sales: masteryByModule["sales"].scenariosAttempted,
      management: masteryByModule["management"].scenariosAttempted,
    };

    // ── Level progress (Stages 1-3) ──
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

    // ── Spaced repetition queue (scenarios due for review) ──
    const reviewQueue = await getReviewQueue(admin, user.id);

    // ── Per-scenario mastery details (for the active module if requested) ──
    const url = new URL(req.url);
    const detailModule = url.searchParams.get("detail");
    let scenarioDetails: Awaited<ReturnType<typeof getScenarioMasteryDetails>> | null = null;
    if (detailModule && modules.includes(detailModule as typeof modules[number])) {
      scenarioDetails = await getScenarioMasteryDetails(admin, user.id, detailModule);
    }

    // ── Staff role & management auto-unlock (unchanged) ──
    let staffRole: string | null = null;
    let autoUnlockManagement = false;

    // ── Tier-based access info ──
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
      modules: moduleCompletion,
      mastery: moduleMastery,
      scores,
      sessions,
      elo,
      scenariosMastered,
      scenariosAttempted,
      scenarioCounts: SCENARIO_COUNTS,
      levelProgress,
      reviewQueue,
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

