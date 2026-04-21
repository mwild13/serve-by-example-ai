/**
 * Module Navigator
 * Filters and recommends modules based on user role, tier, venue, and Elo ratings
 */

import { createSupabaseAdminClient } from "./supabase-admin";
import { resolveAccess } from "./session";

export interface Module {
  id: number;
  title: string;
  description: string;
  category: "technical" | "service" | "compliance";
  difficulty_level: number;
  current_elo: number;
  mastery_pct: number;
  completion_pct: number;
  recommended: boolean;
  recommendation_reason?: string;
}

export interface AvailableModulesResponse {
  modules: Module[];
  total_modules: number;
  accessible_modules: number;
  user_role: string;
  platform_version: number;
}

/**
 * Get all modules available to a user
 * Filtered by: role, tier, venue settings, user Elo
 * Recommended by: lowest Elo (start where struggling)
 */
export async function getAvailableModules(
  userId: string,
  userEmail: string
): Promise<AvailableModulesResponse> {
  const admin = createSupabaseAdminClient();

  try {
    // Get user's profile for platform_version and role info
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id, plan, tier, platform_version")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      throw new Error("User profile not found");
    }

    // Resolve access (tier-based module filtering)
    const access = await resolveAccess(admin, userId, userEmail);

    // If platform_version = 1 (legacy), return only old 3 modules
    if (profile.platform_version === 1) {
      return {
        modules: [
          {
            id: 1,
            title: "Bartending (Legacy)",
            description: "Legacy module",
            category: "technical",
            difficulty_level: 2,
            current_elo: 1200,
            mastery_pct: 0,
            completion_pct: 0,
            recommended: true,
            recommendation_reason: "Start here",
          },
        ],
        total_modules: 3,
        accessible_modules: access.allowedModules.length,
        user_role: access.tier || "unknown",
        platform_version: 1,
      };
    }

    // Platform v2: Fetch all modules from database
    const { data: allModules, error: modulesError } = await admin
      .from("modules")
      .select("id, title, description, category, difficulty_level")
      .order("id", { ascending: true });

    if (modulesError || !allModules) {
      throw new Error("Failed to fetch modules");
    }

    // Get user's Elo ratings from module_elo_baseline
    const { data: diagnosticResult } = await admin
      .from("module_elo_baseline")
      .select("category_scores")
      .eq("user_id", userId)
      .single();

    const categoryScores = diagnosticResult?.category_scores || {
      technical: 1200,
      service: 1200,
      compliance: 1200,
    };

    // Get user's mastery progress for each module
    const { data: masteryData } = await admin
      .from("scenario_mastery")
      .select("module_id, mastery_level, elo_rating")
      .eq("user_id", userId);

    const masteryByModule: Record<
      number,
      { mastery_level: number; elo_rating: number }[]
    > = {};
    (masteryData || []).forEach((m) => {
      if (!masteryByModule[m.module_id]) {
        masteryByModule[m.module_id] = [];
      }
      masteryByModule[m.module_id].push({
        mastery_level: m.mastery_level,
        elo_rating: m.elo_rating,
      });
    });

    // Check venue module restrictions
    let enabledModuleIds: number[] | null = null;
    if (access.sponsorManagerId || access.tier?.includes("venue")) {
      const { data: venueData } = await admin
        .from("venues")
        .select("enabled_module_ids")
        .eq("owner_user_id", userId)
        .single();

      enabledModuleIds = venueData?.enabled_module_ids || null;
    }

    // Calculate module Elo and mastery percentage
    const modulesWithProgress = allModules.map((module) => {
      const moduleId = module.id;
      const moduleMasteryRecords = masteryByModule[moduleId] || [];

      // Calculate module-level Elo (average of scenarios, or baseline)
      const moduleElo =
        moduleMasteryRecords.length > 0
          ? Math.round(
              moduleMasteryRecords.reduce((sum, m) => sum + m.elo_rating, 0) /
                moduleMasteryRecords.length
            )
          : categoryScores[module.category] || 1200;

      // Calculate mastery percentage (% of scenarios at level 3)
      const masteredScenarios = moduleMasteryRecords.filter(
        (m) => m.mastery_level === 3
      ).length;
      const masteryPct =
        moduleMasteryRecords.length > 0
          ? Math.round((masteredScenarios / moduleMasteryRecords.length) * 100)
          : 0;

      // Calculate completion percentage (% attempted)
      const completionPct =
        moduleMasteryRecords.length > 0 ? 100 : 0; // TODO: derive from scenario count

      return {
        id: moduleId,
        title: module.title,
        description: module.description,
        category: module.category as "technical" | "service" | "compliance",
        difficulty_level: module.difficulty_level,
        current_elo: moduleElo,
        mastery_pct: masteryPct,
        completion_pct: completionPct,
        recommended: false, // Will set based on Elo
        recommendation_reason: undefined,
      };
    });

    // Sort by Elo (ascending) and mark lowest 3 as recommended
    const sortedByElo = [...modulesWithProgress].sort(
      (a, b) => a.current_elo - b.current_elo
    );

    const recommendedModuleIds = new Set(
      sortedByElo.slice(0, 3).map((m) => m.id)
    );

    const finalModules = modulesWithProgress.map((module) => {
      const isRecommended = recommendedModuleIds.has(module.id);
      let recommendation_reason: string | undefined;

      if (isRecommended) {
        if (module.current_elo < 1150) {
          recommendation_reason = `Focus area: ${module.category} needs attention`;
        } else if (module.current_elo < 1250) {
          recommendation_reason = `Next challenge: improve your ${module.category} skills`;
        } else {
          recommendation_reason = `Strengthen your expertise in ${module.title}`;
        }
      }

      return {
        ...module,
        recommended: isRecommended,
        recommendation_reason,
      };
    });

    return {
      modules: finalModules,
      total_modules: allModules.length,
      accessible_modules: finalModules.length, // v2 all accessible if auth'd
      user_role: access.tier || "individual",
      platform_version: 2,
    };
  } catch (error) {
    console.error("Error in getAvailableModules:", error);
    throw error;
  }
}

/**
 * Get modules in a specific category
 */
export async function getModulesByCategory(
  category: "technical" | "service" | "compliance"
): Promise<Record<string, unknown>[]> {
  const admin = createSupabaseAdminClient();

  const { data: modules, error } = await admin
    .from("modules")
    .select("*")
    .eq("category", category)
    .order("id", { ascending: true });

  if (error) {
    throw error;
  }

  return modules || [];
}

/**
 * Get a specific module by ID
 */
export async function getModuleById(moduleId: number): Promise<Record<string, unknown>> {
  const admin = createSupabaseAdminClient();

  const { data: module, error } = await admin
    .from("modules")
    .select("*")
    .eq("id", moduleId)
    .single();

  if (error) {
    throw error;
  }

  return module;
}
