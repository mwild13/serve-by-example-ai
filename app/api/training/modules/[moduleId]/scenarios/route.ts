/**
 * GET /api/training/modules/:moduleId/scenarios
 *
 * Returns all scenarios for a specific module
 * Filtered by user's Elo rating (can request advanced if Elo >= min_elo_for_advanced)
 *
 * Query params:
 * - level: 1 | 2 | 3 | 4 (optional, filter by stage level)
 * - difficulty: 1-5 (optional, difficulty filter)
 *
 * Response:
 * {
 *   success: boolean,
 *   module_id: number,
 *   scenarios: [
 *     {
 *       id: string,
 *       module_id: number,
 *       scenario_index: number,
 *       scenario_type: string,
 *       prompt: string,
 *       content: object,
 *       difficulty: number
 *     },
 *     ...
 *   ],
 *   total_scenarios: number,
 *   message: string
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    // Verify user is authenticated
    const { user } = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Await params since it's a Promise in Next.js 15
    const resolvedParams = await params;
    const moduleId = parseInt(resolvedParams.moduleId, 10);

    if (isNaN(moduleId)) {
      return NextResponse.json(
        { success: false, message: "Invalid module ID" },
        { status: 400 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const level = searchParams.get("level");
    const difficulty = searchParams.get("difficulty");

    const admin = createSupabaseAdminClient();

    // Verify module exists
    const { data: module, error: moduleError } = await admin
      .from("modules")
      .select("id, title")
      .eq("id", moduleId)
      .single();

    if (moduleError || !module) {
      return NextResponse.json(
        { success: false, message: "Module not found" },
        { status: 404 }
      );
    }

    // Build query for scenarios
    let query = admin
      .from("scenarios")
      .select("*")
      .eq("module_id", moduleId)
      .order("scenario_index", { ascending: true });

    // Apply level filter if specified
    if (level && ["1", "2", "3", "4"].includes(level)) {
      const scenarioTypes = {
        "1": "quiz",
        "2": "descriptor_l2",
        "3": "descriptor_l3",
        "4": "roleplay",
      };
      query = query.eq(
        "scenario_type",
        scenarioTypes[level as keyof typeof scenarioTypes]
      );
    }

    // Apply difficulty filter if specified
    if (difficulty && !isNaN(parseInt(difficulty, 10))) {
      query = query.eq("difficulty", parseInt(difficulty, 10));
    }

    const { data: scenarios, error: scenariosError } = await query;

    if (scenariosError) {
      console.error("Error fetching scenarios:", scenariosError);
      return NextResponse.json(
        { success: false, message: "Failed to fetch scenarios" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      module_id: moduleId,
      scenarios: scenarios || [],
      total_scenarios: scenarios?.length || 0,
      message: "Scenarios loaded successfully",
    });
  } catch (error) {
    console.error("Error in GET /api/training/modules/:moduleId/scenarios:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
