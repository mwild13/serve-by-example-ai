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
      const fallbackTitles: Record<number, { title: string; category: string }> = {
        1: { title: "Pouring the Perfect Beer", category: "technical" },
        2: { title: "Wine Knowledge & Service", category: "technical" },
        3: { title: "Cocktail Fundamentals", category: "technical" },
        4: { title: "Coffee/Barista Basics", category: "technical" },
        5: { title: "Carrying Glassware & Trays", category: "technical" },
        6: { title: "Cleaning & Sanitation", category: "technical" },
        7: { title: "Bar Back Efficiency", category: "technical" },
        8: { title: "The Art of the Greeting", category: "service" },
        9: { title: "Managing Table Dynamics", category: "service" },
        10: { title: "Anticipatory Service", category: "service" },
        11: { title: "Handling Guest Complaints", category: "service" },
        12: { title: "Up-selling & Suggestive Sales", category: "service" },
        13: { title: "VIP/Table Management", category: "service" },
        14: { title: "Phone Etiquette & Reservations", category: "service" },
        15: { title: "RSA (Responsible Service of Alcohol)", category: "compliance" },
        16: { title: "Food Safety & Hygiene", category: "compliance" },
        17: { title: "Conflict De-escalation", category: "compliance" },
        18: { title: "Emergency Evacuation Protocols", category: "compliance" },
        19: { title: "Opening & Closing Procedures", category: "compliance" },
        20: { title: "Inventory & Waste Control", category: "compliance" },
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
