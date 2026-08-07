/**
 * POST /api/training/diagnostic/start
 *
 * Returns diagnostic questions for user assessment
 * Triggered on first B2B staff login or optional for Individual users
 *
 * Response:
 * {
 *   success: boolean,
 *   diagnostic_id: string (UUID to track this session),
 *   questions: [
 *     { id: "q1", question_text: "...", options: [{text, isCorrect}, ...] },
 *     ...
 *   ],
 *   message: string
 * }
 */

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

// Diagnostic answers vary per user (score seeds Elo baseline), so this
// response must never be cached at the edge. Without an explicit no-store
// directive, a "Cache Everything"-style zone rule on Cloudflare can cache
// the first response body ever returned for this URL and replay that exact
// payload to every subsequent caller regardless of who's asking — which is
// indistinguishable from "all 10 questions are the same" in the client.
const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, private",
  "CDN-Cache-Control": "no-store",
  Pragma: "no-cache",
};

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    const supabase = getSupabaseClient();

    // Fetch diagnostic questions from database
    const { data: questions, error } = await supabase
      .from("diagnostic_questions")
      .select("id, question_text, options, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .limit(10);

    if (error) {
      console.error("Error fetching diagnostic questions:", error);
      return NextResponse.json(
        { success: false, message: "Failed to load diagnostic questions" },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }

    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { success: false, message: "No diagnostic questions available" },
        { status: 404, headers: NO_STORE_HEADERS }
      );
    }

    // Format response
    const formattedQuestions = questions.map((q) => ({
      id: q.id,
      question_text: q.question_text,
      options: q.options, // Already in format [{text, isCorrect}, ...]
    }));

    return NextResponse.json(
      {
        success: true,
        diagnostic_id: user.id, // Use user ID as diagnostic session ID
        questions: formattedQuestions,
        message: "Diagnostic questions loaded successfully",
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error("Error in /api/training/diagnostic/start:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
