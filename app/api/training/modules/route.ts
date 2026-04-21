/**
 * GET /api/training/modules
 *
 * Returns modules available to the user
 * Filtered by: role, tier, venue config, user Elo
 * Recommended by: lowest Elo (struggle areas)
 *
 * Query params:
 * - category: 'technical' | 'service' | 'compliance' (optional filter)
 * - sort: 'recommended' | 'elo' | 'title' (default: 'recommended')
 *
 * Response:
 * {
 *   success: boolean,
 *   modules: [
 *     {
 *       id: number,
 *       title: string,
 *       description: string,
 *       category: string,
 *       difficulty_level: number,
 *       current_elo: number,
 *       mastery_pct: number,
 *       completion_pct: number,
 *       recommended: boolean,
 *       recommendation_reason?: string
 *     },
 *     ...
 *   ],
 *   total_modules: number,
 *   accessible_modules: number,
 *   user_role: string,
 *   platform_version: number,
 *   message: string
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase-server";
import { getAvailableModules } from "@/lib/module-navigator";

export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated
    const { user } = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const sort = searchParams.get("sort") || "recommended";

    // Get available modules for this user
    console.log(`[GET /api/training/modules] Fetching modules for user ${user.id}`);
    const modulesResponse = await getAvailableModules(
      user.id,
      user.email || ""
    );

    console.log(`[GET /api/training/modules] Got ${modulesResponse.modules.length} modules`);
    let modules = modulesResponse.modules;

    // Filter by category if specified
    if (category && ["technical", "service", "compliance"].includes(category)) {
      modules = modules.filter((m) => m.category === category);
    }

    // Sort modules
    if (sort === "elo") {
      modules.sort((a, b) => a.current_elo - b.current_elo);
    } else if (sort === "title") {
      modules.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // Default: 'recommended' - recommended first, then by Elo
      modules.sort((a, b) => {
        if (a.recommended !== b.recommended) {
          return a.recommended ? -1 : 1;
        }
        return a.current_elo - b.current_elo;
      });
    }

    return NextResponse.json({
      success: true,
      modules,
      total_modules: modulesResponse.total_modules,
      accessible_modules: modulesResponse.accessible_modules,
      user_role: modulesResponse.user_role,
      platform_version: modulesResponse.platform_version,
      message: "Modules loaded successfully",
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in GET /api/training/modules:", errorMessage);
    console.error("Full error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
