/**
 * POST /api/training/diagnostic/submit
 *
 * Processes diagnostic answers and seeds user Elo
 *
 * Request Body:
 * {
 *   answers: { q1: "selected_answer", q2: "selected", ... }
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   category_scores: { technical: 1350, service: 1250, compliance: 1200 },
 *   recommended_modules: [
 *     { module_id: 1, module_title: "...", reason: "..." },
 *     ...
 *   ],
 *   message: string
 * }
 */

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import {
  processDiagnosticAnswers,
  getRecommendedModules,
  generateScenarioMasterySeeds,
} from "@/lib/diagnostic-engine";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface SubmitRequest {
  answers: Record<string, string | boolean>;
}

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: missing auth token" },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: invalid token" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = (await request.json()) as SubmitRequest;

    if (!body.answers || Object.keys(body.answers).length === 0) {
      return NextResponse.json(
        { success: false, message: "No answers provided" },
        { status: 400 }
      );
    }

    // Process diagnostic answers
    const diagnosticResult = await processDiagnosticAnswers(body.answers);

    if (!diagnosticResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: diagnosticResult.message,
        },
        { status: 400 }
      );
    }

    // Store diagnostic results in module_elo_baseline
    const { error: baselineError } = await supabase
      .from("module_elo_baseline")
      .upsert(
        {
          user_id: user.id,
          diagnostic_completed_at: new Date().toISOString(),
          answers: body.answers,
          category_scores: diagnosticResult.category_scores,
        },
        { onConflict: "user_id" }
      );

    if (baselineError) {
      console.error("Error storing diagnostic results:", baselineError);
      return NextResponse.json(
        { success: false, message: "Failed to store diagnostic results" },
        { status: 500 }
      );
    }

    // Generate scenario_mastery seeds for this user
    // This creates baseline Elo entries for each module
    const seeds = generateScenarioMasterySeeds(
      user.id,
      diagnosticResult.category_scores
    );

    // Insert seeds into scenario_mastery (upsert in case duplicates)
    // Note: We're seeding one record per module as a representative baseline
    if (seeds.length > 0) {
      const { error: seedError } = await supabase
        .from("scenario_mastery")
        .upsert(seeds, { onConflict: "user_id,module_id,scenario_index" });

      if (seedError) {
        console.error("Error seeding scenario_mastery:", seedError);
        // Don't fail the whole response - seeds are optional
      }
    }

    // Update profiles to mark diagnostic as completed
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        diagnostic_completed: true,
        diagnostic_completed_at: new Date().toISOString(),
        platform_version: 2, // Auto-migrate to v2 on diagnostic completion
      })
      .eq("id", user.id);

    if (profileError) {
      console.error("Error updating profile:", profileError);
      // Don't fail - diagnostic was completed
    }

    // Generate recommended modules based on lowest scores
    const recommendedModules = getRecommendedModules(
      diagnosticResult.category_scores,
      5
    );

    return NextResponse.json({
      success: true,
      category_scores: diagnosticResult.category_scores,
      detailed_scores: diagnosticResult.detailed_scores,
      recommended_modules: recommendedModules,
      message: "Diagnostic assessment completed. Your learning path is ready!",
    });
  } catch (error) {
    console.error("Error in /api/training/diagnostic/submit:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
