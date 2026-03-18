import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getUserFromRequest } from "@/lib/supabase-server";

const SCENARIOS_PER_MODULE = 10;
const MANAGEMENT_ROLES = ["Manager", "Supervisor"];

function completionToPercent(completed: number) {
  return Math.min(Math.round((completed / SCENARIOS_PER_MODULE) * 100), 100);
}

function avgScore(totalPoints: number, count: number): number {
  if (count === 0) return 0;
  return Math.round((totalPoints / count) * 10) / 10; // one decimal place
}

export async function GET(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createSupabaseAdminClient();

    // Fetch all three module progress rows for this user
    const { data: rows } = await admin
      .from("user_training_progress")
      .select("module, scenarios_completed, total_score_points")
      .eq("user_id", user.id);

    const progressByModule = Object.fromEntries(
      (rows ?? []).map((r) => [r.module as string, r]),
    );

    const bar = progressByModule["bartending"];
    const sal = progressByModule["sales"];
    const mgmt = progressByModule["management"];

    const modules = {
      bartending: completionToPercent(bar?.scenarios_completed ?? 0),
      sales: completionToPercent(sal?.scenarios_completed ?? 0),
      management: completionToPercent(mgmt?.scenarios_completed ?? 0),
    };

    // Average score per module (0–25 scale, one decimal)
    const scores = {
      bartending: avgScore(bar?.total_score_points ?? 0, bar?.scenarios_completed ?? 0),
      sales: avgScore(sal?.total_score_points ?? 0, sal?.scenarios_completed ?? 0),
      management: avgScore(mgmt?.total_score_points ?? 0, mgmt?.scenarios_completed ?? 0),
    };

    // Raw session counts
    const sessions = {
      bartending: bar?.scenarios_completed ?? 0,
      sales: sal?.scenarios_completed ?? 0,
      management: mgmt?.scenarios_completed ?? 0,
    };

    let staffRole: string | null = null;
    let autoUnlockManagement = false;

    // Check if this user has a venue_staff record (matched by email)
    if (user.email) {
      const { data: staffRows } = await admin
        .from("venue_staff")
        .select("id, role, staff_user_id")
        .eq("email", user.email);

      if (staffRows && staffRows.length > 0) {
        staffRole = staffRows[0].role as string;

        // Link staff_user_id if not already set
        const unlinked = staffRows.filter((r) => !r.staff_user_id);
        if (unlinked.length > 0) {
          await admin
            .from("venue_staff")
            .update({ staff_user_id: user.id })
            .eq("email", user.email)
            .is("staff_user_id", null)
            .then();
        }

        // Manager / Supervisor roles should get management training unlocked
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

    return NextResponse.json({ modules, scores, sessions, staffRole, autoUnlockManagement });
  } catch (error) {
    console.error("Training progress error:", error);
    return NextResponse.json({ error: "Failed to load training progress." }, { status: 500 });
  }
}

