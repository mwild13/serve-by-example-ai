/**
 * GET /api/training/modules/:moduleId
 *
 * Returns metadata for a specific module
 */

import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const { user } = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const moduleId = parseInt(resolvedParams.moduleId, 10);

    if (isNaN(moduleId)) {
      return NextResponse.json(
        { success: false, message: "Invalid module ID" },
        { status: 400 }
      );
    }

    const admin = createSupabaseAdminClient();

    const { data: module, error } = await admin
      .from("modules")
      .select("id, title, description, category, difficulty_level")
      .eq("id", moduleId)
      .single();

    if (error || !module) {
      // Return fallback module info if DB lookup fails
      // Shortened 2026-08-24 (docs/Module-Title-Renames-Proposal.md) — 2-3
      // word titles, matching the modules table.
      const fallbackTitles: Record<number, { title: string; category: string }> = {
        1: { title: "Beer Pouring", category: "technical" },
        2: { title: "Wine Service", category: "technical" },
        3: { title: "Cocktail Fundamentals", category: "technical" },
        4: { title: "Barista Basics", category: "technical" },
        5: { title: "Tray Carrying", category: "technical" },
        6: { title: "Sanitation Basics", category: "technical" },
        7: { title: "Bar-Back Efficiency", category: "technical" },
        8: { title: "The Greeting", category: "service" },
        9: { title: "Table Dynamics", category: "service" },
        10: { title: "Anticipatory Service", category: "service" },
        11: { title: "Guest Complaints", category: "service" },
        12: { title: "Suggestive Selling", category: "service" },
        13: { title: "VIP Management", category: "service" },
        14: { title: "Phone Etiquette", category: "service" },
        15: { title: "RSA Compliance", category: "compliance" },
        16: { title: "Food Safety", category: "compliance" },
        17: { title: "Conflict De-escalation", category: "compliance" },
        18: { title: "Evacuation Protocols", category: "compliance" },
        19: { title: "Opening & Closing", category: "compliance" },
        20: { title: "Inventory Control", category: "compliance" },
      };

      const fallback = fallbackTitles[moduleId] || { title: `Module ${moduleId}`, category: "technical" };

      return NextResponse.json({
        success: true,
        id: moduleId,
        title: fallback.title,
        description: `Training module for ${fallback.title}`,
        category: fallback.category,
        difficulty_level: 2,
      });
    }

    return NextResponse.json({
      success: true,
      ...module,
    });
  } catch (error) {
    console.error("Error in GET /api/training/modules/:moduleId:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
