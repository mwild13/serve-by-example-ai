import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getUserFromRequest } from "@/lib/supabase-server";

const SCENARIOS_PER_MODULE = 10; // each module has 10 scenarios
const VALID_MODULES = ["bartending", "sales", "management"] as const;
type TrainingModule = (typeof VALID_MODULES)[number];

function scoreToPercent(totalPoints: number, count: number) {
  if (count === 0) return 0;
  return Math.min(Math.round((totalPoints / count / 25) * 100), 100);
}

function completionToPercent(completed: number) {
  return Math.min(Math.round((completed / SCENARIOS_PER_MODULE) * 100), 100);
}

export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const trainingModule = body.module as string;
    const overallScore = Number(body.overallScore); // 0–25

    if (!VALID_MODULES.includes(trainingModule as TrainingModule)) {
      return NextResponse.json({ error: "Invalid module." }, { status: 400 });
    }
    if (!Number.isFinite(overallScore) || overallScore < 0 || overallScore > 25) {
      return NextResponse.json({ error: "Invalid score." }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const now = new Date().toISOString();

    // Fetch existing row for this user + module
    const { data: existing } = await admin
      .from("user_training_progress")
      .select("scenarios_completed, total_score_points")
      .eq("user_id", user.id)
      .eq("module", trainingModule)
      .maybeSingle();

    const newScenarios = (existing?.scenarios_completed ?? 0) + 1;
    const newTotalScore = (existing?.total_score_points ?? 0) + overallScore;

    // Upsert progress row
    await admin.from("user_training_progress").upsert(
      {
        user_id: user.id,
        module: trainingModule,scenarios_completed: newScenarios,
        total_score_points: newTotalScore,
        last_active_at: now,
        updated_at: now,
      },
      { onConflict: "user_id,module" },
    );

    // Sync back to venue_staff record (matched by email) so the
    // management console reflects real training data immediately.
    if (user.email) {
      const { data: staffRows } = await admin
        .from("venue_staff")
        .select("id")
        .eq("email", user.email);

      if (staffRows && staffRows.length > 0) {
        // Re-fetch all three modules to compute combined scores
        const { data: allProgress } = await admin
          .from("user_training_progress")
          .select("module, scenarios_completed, total_score_points")
          .eq("user_id", user.id);

        const progressByModule = Object.fromEntries(
          (allProgress ?? []).map((r) => [r.module as string, r]),
        );

        const bartending = progressByModule["bartending"];
        const sales = progressByModule["sales"];
        const management = progressByModule["management"];

        const serviceScore = scoreToPercent(
          bartending?.total_score_points ?? 0,
          bartending?.scenarios_completed ?? 0,
        );
        const salesScore = scoreToPercent(
          sales?.total_score_points ?? 0,
          sales?.scenarios_completed ?? 0,
        );
        const productScore = scoreToPercent(
          management?.total_score_points ?? 0,
          management?.scenarios_completed ?? 0,
        );

        // Overall progress = average completion across modules that have data
        const completions = [bartending, sales, management]
          .filter(Boolean)
          .map((r) => completionToPercent(r!.scenarios_completed));
        const overallProgress = completions.length
          ? Math.round(completions.reduce((a, b) => a + b, 0) / completions.length)
          : 0;

        for (const staffRow of staffRows) {
          await admin
            .from("venue_staff")
            .update({
              service_score: serviceScore,
              sales_score: salesScore,
              product_score: productScore,
              progress: overallProgress,
              last_active_at: now,
              updated_at: now,
            })
            .eq("id", staffRow.id);
        }

        // Link staff_user_id if not already set (best effort)
        await admin
          .from("venue_staff")
          .update({ staff_user_id: user.id })
          .eq("email", user.email)
          .is("staff_user_id", null)
          .then();
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Training save error:", error);
    return NextResponse.json({ error: "Failed to save training progress." }, { status: 500 });
  }
}
