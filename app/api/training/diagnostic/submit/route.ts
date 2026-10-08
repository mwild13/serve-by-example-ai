/**
 * POST /api/training/diagnostic/submit
 *
 * Scores the placement check and stores per-category percentages, which
 * order the user's module recommendations (lib/module-navigator.ts).
 *
 * Request Body:
 * {
 *   answers: { q1: "selected_answer", q2: "selected", ... }
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   category_scores: { technical: 80, service: 60, compliance: 40 },
 *   recommended_modules: [
 *     { module_id: 1, module_title: "...", reason: "..." },
 *     ...
 *   ],
 *   message: string
 * }
 */

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase-server";
import { processDiagnosticAnswers, getRecommendedModules } from "@/lib/diagnostic-engine";
import { readJsonBody } from "@/lib/ai-guard";

// A handful of short answers; anything larger isn't a real submission.
const MAX_BODY_BYTES = 4 * 1024;

export const dynamic = "force-dynamic";

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface SubmitRequest {
  answers: Record<string, string | boolean>;
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const read = await readJsonBody(request, MAX_BODY_BYTES);
    if (!read.ok) return read.response;
    const body = read.body as Partial<SubmitRequest>;

    if (!body.answers || typeof body.answers !== "object" || Object.keys(body.answers).length === 0) {
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

    const supabase = getSupabaseClient();

    // Stored in module_elo_baseline (the table name predates the Elo
    // retirement; it now holds percentages).
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

    // This used to also seed a fake scenario_mastery row per module with an
    // Elo baseline. The upsert named a conflict key that doesn't exist, so it
    // never succeeded (audit 2026-09-30, M4), and Elo is retired. Removed.

    // Update profiles to mark diagnostic as completed
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ diagnostic_completed: true })
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
