/**
 * GET /api/training/modules
 *
 * Returns modules available to the user
 * Recommendations: see lib/module-navigator.ts.
 *
 * Query params:
 * - category: 'technical' | 'service' | 'compliance' (optional filter)
 * - sort: 'recommended' | 'title' (default: 'recommended')
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
    const modulesResponse = await getAvailableModules(
      user.id,
      user.email || ""
    );

    let modules = modulesResponse.modules;

    // Filter by category if specified
    if (category && ["technical", "service", "compliance"].includes(category)) {
      modules = modules.filter((m) => m.category === category);
    }

    // Sort modules
    if (sort === "title") {
      modules.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // Default: 'recommended' first, then foundational modules first.
      modules.sort((a, b) =>
        Number(b.recommended) - Number(a.recommended) ||
        a.difficulty_level - b.difficulty_level ||
        a.id - b.id);
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
