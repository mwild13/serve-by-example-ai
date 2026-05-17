/**
 * Module Navigator
 * Filters and recommends modules based on user role, tier, venue, and Elo ratings
 */

import { createSupabaseAdminClient } from "./supabase-admin";
import { resolveAccess } from "./session";
import { SCENARIO_COUNTS } from "./mastery";

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
    console.log(`[getAvailableModules] Fetching modules for user: ${userId}`);

    // Get user's profile for platform_version and role info
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id, plan, tier, platform_version")
      .eq("id", userId)
      .maybeSingle(); // Use maybeSingle to handle new users without a profile yet

    if (profileError) {
      console.error(`[getAvailableModules] Profile error:`, profileError);
      throw new Error(`Profile query failed: ${profileError.message}`);
    }

    // Use default profile if not found (new user on v2)
    const userProfile = profile || {
      id: userId,
      plan: "free",
      tier: "individual",
      platform_version: 2,
    };

    // Force platform_version = 2 for individual/free users (legacy default was 1)
    // Only keep v1 for B2B venue users who need diagnostic
    const isB2BUser = userProfile.plan === "single-venue" || userProfile.plan === "multi-venue";
    const platformVersion = isB2BUser ? userProfile.platform_version : 2;

    console.log(`[getAvailableModules] User profile: plan=${userProfile.plan}, is_b2b=${isB2BUser}, platform_version=${platformVersion}`);

    // Resolve access (tier-based module filtering)
    let access;
    try {
      access = await resolveAccess(admin, userId, userEmail);
    } catch (accessError) {
      console.error(`[getAvailableModules] Error resolving access:`, accessError);
      // Fallback for access resolution
      access = {
        tier: "individual",
        allowedModules: Array.from({ length: 40 }, (_, i) => i + 1),
        maxSeats: 10,
        isSponsored: false,
      };
    }

    // If platform_version = 1 (legacy B2B), return only old 3 modules
    if (platformVersion === 1) {
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
    console.log(`[getAvailableModules] Fetching all modules from database`);
    const { data: allModules, error: modulesError } = await admin
      .from("modules")
      .select("id, title, description, category, difficulty_level")
      .order("id", { ascending: true });

    if (modulesError) {
      console.error(`[getAvailableModules] Modules error:`, modulesError);
      throw new Error(`Modules query failed: ${modulesError.message}`);
    }

    if (!allModules || allModules.length === 0) {
      console.error(`[getAvailableModules] No modules found in database`);
      throw new Error("No modules found in database");
    }

    console.log(`[getAvailableModules] Found ${allModules.length} modules`);

    // Get user's Elo ratings from module_elo_baseline (optional - new users won't have this)
    const { data: diagnosticResult, error: diagnosticError } = await admin
      .from("module_elo_baseline")
      .select("category_scores")
      .eq("user_id", userId)
      .maybeSingle(); // Use maybeSingle instead of single to handle 0 rows gracefully

    if (diagnosticError) {
      console.error(`[getAvailableModules] Diagnostic error:`, diagnosticError);
      // Don't fail - diagnostic data is optional for new users
    }

    const categoryScores = diagnosticResult?.category_scores || {
      technical: 1200,
      service: 1200,
      compliance: 1200,
    };

    console.log(`[getAvailableModules] Using category scores:`, categoryScores);

    // Get user's mastery progress for each module
    console.log(`[getAvailableModules] Fetching mastery data for user`);
    const { data: masteryData, error: masteryError } = await admin
      .from("scenario_mastery")
      .select("module_id, mastery_level, elo_rating, is_mastered")
      .eq("user_id", userId);

    if (masteryError) {
      console.error(`[getAvailableModules] Mastery error:`, masteryError);
      // Don't fail - mastery data is optional
    }

    const masteryByModule: Record<
      number,
      { mastery_level: number; elo_rating: number; is_mastered: boolean }[]
    > = {};
    (masteryData || []).forEach((m) => {
      // Skip records without module_id (legacy data)
      if (!m.module_id) {
        console.log(`[getAvailableModules] Skipping mastery record without module_id`);
        return;
      }
      if (!masteryByModule[m.module_id]) {
        masteryByModule[m.module_id] = [];
      }
      masteryByModule[m.module_id].push({
        mastery_level: m.mastery_level,
        elo_rating: m.elo_rating,
        is_mastered: m.is_mastered === true,
      });
    });

    console.log(`[getAvailableModules] Processed ${Object.keys(masteryByModule).length} modules with mastery data`);

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

      // Calculate mastery percentage
      // Verified modules (passed the verify quiz) are always 100%
      const isVerified = moduleMasteryRecords.some((m) => m.is_mastered);
      const masteredScenarios = moduleMasteryRecords.filter(
        (m) => m.mastery_level === 3
      ).length;
      const scenarioTotal = SCENARIO_COUNTS[`module_${moduleId}`] ?? 10;
      const masteryPct = isVerified
        ? 100
        : masteredScenarios > 0
        ? Math.round((masteredScenarios / scenarioTotal) * 100)
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in getAvailableModules:", errorMessage);
    console.error("Full error:", error);

    // FALLBACK: Return all 40 modules with default Elo if query fails
    // Ordered by difficulty_level ascending (most important / foundational first)
    console.warn("[getAvailableModules] Returning fallback response with all 40 modules");

    const defaultModules = [
      // ── Difficulty 1: Day-one survival (show these first) ──────────────────
      { id: 18, title: "Emergency Evacuation Protocols",                    description: "Fire safety, emergency exits, mustering, communicating with guests calmly, and working with emergency services.",                category: "compliance", difficulty_level: 1 },
      { id: 21, title: 'The "Behind!" Rule: Spatial Awareness & Safety',   description: 'Vocal commands ("Behind!", "Corner!", "Coming through!") and the compressed walk to move safely through a crowded venue.',         category: "compliance", difficulty_level: 1 },
      { id: 22, title: 'The "Glass in Well" Emergency: The Burn Protocol', description: "How to identify a glass break in the ice well and execute the mandatory hot-water Burn Protocol.",                                  category: "compliance", difficulty_level: 1 },
      { id: 24, title: "Ice is Food: The Sacred Rules of the Scoop",       description: "Ice is a food product. Covers the handle-up rule, why bare hands are banned, and keeping the machine lid closed.",                  category: "compliance", difficulty_level: 1 },
      { id: 6,  title: "Cleaning & Sanitation",                            description: "Proper cleaning procedures, sanitisation standards, chemical safety, and maintaining a hygienic workspace.",                         category: "technical",  difficulty_level: 1 },
      { id: 8,  title: "The Art of the Greeting",                          description: "First impressions, welcoming guests, reading body language, and setting the tone for a great experience.",                           category: "service",    difficulty_level: 1 },
      { id: 5,  title: "Carrying Glassware & Trays",                       description: "Safe and professional techniques for carrying glassware, trays, and plates without spills or breakage.",                             category: "technical",  difficulty_level: 1 },
      { id: 23, title: "The Swivel Head: Identifying Needs from 10 Meters",description: "Train your eyes to constantly scan the room for dead soldiers, raised hands, and the lost look on a guest's face.",                 category: "service",    difficulty_level: 1 },
      { id: 36, title: "The Two-Minute Check: The Critical Window",        description: "Timing the check-back to the guest's first bite catches a cold steak or missing sauce before it becomes a complaint.",               category: "service",    difficulty_level: 1 },
      { id: 38, title: 'The "Dead Soldier": Clearing & Resetting',         description: "The art of pre-bussing — constantly removing clutter so the guest always feels they are in a clean, high-end environment.",           category: "service",    difficulty_level: 1 },

      // ── Difficulty 2: Core operations ──────────────────────────────────────
      { id: 15, title: "RSA (Responsible Service of Alcohol)",             description: "Australian RSA compliance — identifying intoxication, refusing service, legal obligations, and documentation.",                      category: "compliance", difficulty_level: 2 },
      { id: 16, title: "Food Safety & Hygiene",                            description: "HACCP principles, allergen awareness, temperature control, cross-contamination prevention, and safe food handling.",                  category: "compliance", difficulty_level: 2 },
      { id: 25, title: "The Allergy Shield: Communicating Dietary Danger", description: "The protocol for marking a ticket, alerting the kitchen, and double-checking the plate before it reaches the table.",                category: "compliance", difficulty_level: 2 },
      { id: 19, title: "Opening & Closing Procedures",                     description: "Venue opening checklist, closing tasks, cash handling, security lock-up, and handover procedures.",                                   category: "compliance", difficulty_level: 2 },
      { id: 20, title: "Inventory & Waste Control",                        description: "Stock counting, variance tracking, waste reduction, ordering processes, and preventing shrinkage.",                                   category: "compliance", difficulty_level: 2 },
      { id: 31, title: "The 30ml Truth: Precision vs. Profit",             description: "Why the jigger is the most important tool for venue survival — reading the meniscus and the financial impact of a heavy hand.",        category: "compliance", difficulty_level: 2 },
      { id: 35, title: "The Golden Standard Close: Cleaning for Tomorrow", description: "Coffee machine purge, speed rail sanitisation, and dry-store layout. A perfect close is the greatest gift to the morning shift.",     category: "compliance", difficulty_level: 2 },
      { id: 1,  title: "Pouring the Perfect Beer",                         description: "Master beer pouring techniques — angle, head ratio, temperature, glassware matching.",                                               category: "technical",  difficulty_level: 2 },
      { id: 4,  title: "Coffee/Barista Basics",                            description: "Espresso extraction, milk steaming, latte ratios, grind consistency, temperature, customer preferences.",                            category: "technical",  difficulty_level: 2 },
      { id: 7,  title: "Bar Back Efficiency",                              description: "Stocking, restocking, ice management, glassware cycling, and supporting the bar team effectively.",                                   category: "technical",  difficulty_level: 2 },
      { id: 26, title: "The Soda Gun: Muscle Memory & Troubleshooting",    description: "Learning the button layout by feel, clearing the warm line, and what to do when the bag-in-box syrup runs out mid-service.",          category: "technical",  difficulty_level: 2 },
      { id: 27, title: "Economy of Motion: Two Hands, One Flow",           description: "Expert bartenders move less, not faster. Two-handed service eliminates dead time in every movement.",                                 category: "technical",  difficulty_level: 2 },
      { id: 28, title: "The Mid-Shift Reload: Mise en Place Maintenance",  description: "The 3-minute reload — replenishing citrus, ice, and glassware in the tiny windows of silence between service waves.",                category: "technical",  difficulty_level: 2 },
      { id: 34, title: "Glassware Geometry: Weight, Balance, and Grip",    description: "The Pinch and the Stack — techniques to move high volumes of glassware safely without touching the rim.",                             category: "technical",  difficulty_level: 2 },
      { id: 39, title: "Bar-Back Synergy: The Lifeblood of the Front",     description: "How to be invisible — refilling ice and restocking without disrupting the bartender. Communicating needs before you run out.",          category: "technical",  difficulty_level: 2 },
      { id: 10, title: "Anticipatory Service",                             description: "Spotting guest needs before they ask — refills, adjustments, timing, and proactive care.",                                           category: "service",    difficulty_level: 2 },
      { id: 12, title: "Up-selling & Suggestive Sales",                    description: "Recommend with confidence — premium spirits, add-ons, specials — without being pushy.",                                               category: "service",    difficulty_level: 2 },
      { id: 14, title: "Phone Etiquette & Reservations",                   description: "Professional phone manner, taking reservations, handling enquiries, and managing booking systems.",                                   category: "service",    difficulty_level: 2 },
      { id: 29, title: "Deciphering the Docket: From Printer to Plate",    description: "Instantly recognise POS abbreviations (M/R, G/F, 86) and prioritise the order of operations from the moment a ticket prints.",        category: "service",    difficulty_level: 2 },
      { id: 30, title: 'Taming "The Weed": Mental Fortitude Under Pressure',description: "Acknowledge every guest, work tickets in order, and remember — slow is smooth, smooth is fast.",                                   category: "service",    difficulty_level: 2 },
      { id: 37, title: 'The Pivot: Dealing with "No" and "Out of Stock"',  description: "Instantly suggest a similar alternative so the guest never feels let down by an unavailable item.",                                   category: "service",    difficulty_level: 2 },

      // ── Difficulty 3: Advanced / pro level (show these last) ───────────────
      { id: 2,  title: "Wine Knowledge & Service",                         description: "Wine classification, tasting notes, pairing, service temperature, proper pouring, upselling.",                                       category: "technical",  difficulty_level: 3 },
      { id: 3,  title: "Cocktail Fundamentals",                            description: "Cocktail technique, measurement, spirit knowledge, classic recipes, garnish, and riffing.",                                          category: "technical",  difficulty_level: 3 },
      { id: 32, title: "The Waiter's Friend: Mechanical Wine Mastery",     description: "The two-step lever system, cutting the foil below the lip, and the silent extraction of the cork.",                                   category: "technical",  difficulty_level: 3 },
      { id: 33, title: "The Cellar Sprint: Kegs, Gas, and Gurgles",        description: "Changing a coupler safely, identifying an empty gas bottle, and clearing air from the line to restore the pour.",                    category: "technical",  difficulty_level: 3 },
      { id: 9,  title: "Managing Table Dynamics",                          description: "Reading the table, pacing service, handling group dynamics, and delivering consistent experiences.",                                  category: "service",    difficulty_level: 3 },
      { id: 11, title: "Handling Guest Complaints",                        description: "De-escalation, empathy, solution-focused responses, and turning complaints into loyalty.",                                            category: "service",    difficulty_level: 3 },
      { id: 13, title: "VIP/Table Management",                             description: "High-value guest handling, reservation management, seating strategy, and special requests.",                                         category: "service",    difficulty_level: 3 },
      { id: 40, title: "The Natural Upsell: Suggesting, Not Pushing",      description: "The Power of Three — suggesting a specific premium brand or complementary side that makes guests feel cared for, not sold to.",        category: "service",    difficulty_level: 3 },
      { id: 17, title: "Conflict De-escalation",                           description: "Managing aggressive guests, verbal techniques, when to involve security, and post-incident procedures.",                               category: "compliance", difficulty_level: 3 },
    ];

    return {
      modules: defaultModules.map((m, i) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        category: m.category as "technical" | "service" | "compliance",
        difficulty_level: m.difficulty_level,
        current_elo: 1200,
        mastery_pct: 0,
        completion_pct: 0,
        recommended: i < 3,
        recommendation_reason: i < 3 ? "Start here to build your foundation" : undefined,
      })),
      total_modules: 40,
      accessible_modules: 40,
      user_role: "individual",
      platform_version: 2,
    };
  }
}
