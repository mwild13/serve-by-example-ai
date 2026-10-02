/**
 * Module Navigator
 * Lists the module catalog with the user's progress and recommends what to
 * do next: modules already in progress first, then the weakest category
 * from the placement check, then the most foundational modules. (Average
 * Elo used to drive this; retired in audit Phase 5, 2026-10.)
 */

import { createSupabaseAdminClient } from "./supabase-admin";
import { resolveAccess } from "./session";
import { SCENARIO_COUNTS } from "./mastery";

interface Module {
  id: number;
  title: string;
  description: string;
  category: "technical" | "service" | "compliance";
  difficulty_level: number;
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
 * Recommended: see the file header.
 */
export async function getAvailableModules(
  userId: string,
  userEmail: string
): Promise<AvailableModulesResponse> {
  const admin = createSupabaseAdminClient();

  try {
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

    // NOTE: platform_version no longer gates the module catalog. It previously
    // short-circuited here with a single hardcoded "Bartending (Legacy)" stub
    // for any B2B user still on platform_version === 1, on the assumption
    // they'd complete the diagnostic (which auto-bumps them to v2) almost
    // immediately. In practice the diagnostic overlay had a rendering bug
    // that made it effectively unusable, so anyone who hadn't finished it
    // got permanently stuck seeing 1 module instead of all 40. Diagnostic
    // completion should only affect personalization (category_scores /
    // recommendations below), never whether the real catalog loads.

    // Fetch all modules from database
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

    // Placement check result (optional — not everyone has taken it). Only the
    // ORDER of the three category scores is used, so rows saved on the old
    // Elo scale (1000-1500) and the current percentage scale (0-100) rank
    // the same way.
    const { data: diagnosticResult, error: diagnosticError } = await admin
      .from("module_elo_baseline")
      .select("category_scores")
      .eq("user_id", userId)
      .maybeSingle();

    if (diagnosticError) {
      console.error(`[getAvailableModules] Diagnostic error:`, diagnosticError);
    }

    const categoryRank = rankCategories(diagnosticResult?.category_scores);
    const weakestCategory = diagnosticResult ? [...categoryRank.entries()].find(([, rank]) => rank === 0)?.[0] : undefined;

    // Get user's mastery progress for each module
    const { data: masteryData, error: masteryError } = await admin
      .from("scenario_mastery")
      .select("module_id, mastery_level, is_mastered")
      .eq("user_id", userId)
      .is("archived_at", null);

    if (masteryError) {
      console.error(`[getAvailableModules] Mastery error:`, masteryError);
      // Don't fail - mastery data is optional
    }

    const masteryByModule: Record<number, { mastery_level: number; is_mastered: boolean }[]> = {};
    (masteryData || []).forEach((m) => {
      // Skip records without module_id (legacy data)
      if (!m.module_id) return;
      (masteryByModule[m.module_id] ??= []).push({
        mastery_level: m.mastery_level,
        is_mastered: m.is_mastered === true,
      });
    });

    const modulesWithProgress = allModules.map((module) => {
      const moduleMasteryRecords = masteryByModule[module.id] || [];

      // Verified modules (passed the verify quiz) are always 100%
      const isVerified = moduleMasteryRecords.some((m) => m.is_mastered);
      const masteredScenarios = moduleMasteryRecords.filter((m) => m.mastery_level === 3).length;
      const scenarioTotal = SCENARIO_COUNTS[`module_${module.id}`] ?? 10;
      const masteryPct = isVerified
        ? 100
        : Math.min(Math.round((masteredScenarios / scenarioTotal) * 100), 100);

      return {
        id: module.id,
        title: module.title,
        description: module.description,
        category: module.category as "technical" | "service" | "compliance",
        difficulty_level: module.difficulty_level,
        mastery_pct: masteryPct,
        completion_pct: moduleMasteryRecords.length > 0 ? 100 : 0, // started at all
        recommended: false,
        recommendation_reason: undefined as string | undefined,
      };
    });

    const recommended = modulesWithProgress
      .filter((m) => m.mastery_pct < 100)
      .sort(
        (a, b) =>
          b.completion_pct - a.completion_pct || // in progress first
          (categoryRank.get(a.category) ?? 1) - (categoryRank.get(b.category) ?? 1) ||
          a.difficulty_level - b.difficulty_level ||
          a.id - b.id,
      )
      .slice(0, 3);
    const recommendedIds = new Set(recommended.map((m) => m.id));

    const finalModules = modulesWithProgress.map((module) => {
      if (!recommendedIds.has(module.id)) return module;
      let recommendation_reason: string;
      if (module.completion_pct > 0) {
        recommendation_reason = "Continue where you left off";
      } else if (module.category === weakestCategory) {
        recommendation_reason = `Focus area: ${module.category} was your lowest placement score`;
      } else if (module.difficulty_level <= 1) {
        recommendation_reason = "Start here to build your foundation";
      } else {
        recommendation_reason = `Next up in ${module.category}`;
      }
      return { ...module, recommended: true, recommendation_reason };
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

    // FALLBACK: Return all 40 modules if the query fails
    // Ordered by difficulty_level ascending (most important / foundational first)
    console.warn("[getAvailableModules] Returning fallback response with all 40 modules");

    // Titles shortened 2026-08-24 (docs/Module-Title-Renames-Proposal.md) —
    // 2-3 word titles so the Learn Hub's 2-column module grid and the
    // Practice & Scenarios single-line tiles both fit without truncation.
    const defaultModules = [
      // ── Difficulty 1: Day-one survival (show these first) ──────────────────
      { id: 18, title: "Evacuation Protocols",     description: "Fire safety, emergency exits, mustering, communicating with guests calmly, and working with emergency services.",                category: "compliance", difficulty_level: 1 },
      { id: 21, title: "Call Behind",              description: 'Vocal commands ("Behind!", "Corner!", "Coming through!") and the compressed walk to move safely through a crowded venue.',         category: "compliance", difficulty_level: 1 },
      { id: 22, title: "Ice Well Burn",            description: "How to identify a glass break in the ice well and execute the mandatory hot-water Burn Protocol.",                                  category: "compliance", difficulty_level: 1 },
      { id: 24, title: "Ice Is Food",              description: "Ice is a food product. Covers the handle-up rule, why bare hands are banned, and keeping the machine lid closed.",                  category: "compliance", difficulty_level: 1 },
      { id: 6,  title: "Sanitation Basics",        description: "Proper cleaning procedures, sanitisation standards, chemical safety, and maintaining a hygienic workspace.",                         category: "technical",  difficulty_level: 1 },
      { id: 8,  title: "The Greeting",             description: "First impressions, welcoming guests, reading body language, and setting the tone for a great experience.",                           category: "service",    difficulty_level: 1 },
      { id: 5,  title: "Tray Carrying",            description: "Safe and professional techniques for carrying glassware, trays, and plates without spills or breakage.",                             category: "technical",  difficulty_level: 1 },
      { id: 23, title: "The Swivel Head",          description: "Train your eyes to constantly scan the room for dead soldiers, raised hands, and the lost look on a guest's face.",                 category: "service",    difficulty_level: 1 },
      { id: 36, title: "Two-Minute Check",         description: "Timing the check-back to the guest's first bite catches a cold steak or missing sauce before it becomes a complaint.",               category: "service",    difficulty_level: 1 },
      { id: 38, title: "Clearing Dead Soldiers",   description: "The art of pre-bussing — constantly removing clutter so the guest always feels they are in a clean, high-end environment.",           category: "service",    difficulty_level: 1 },

      // ── Difficulty 2: Core operations ──────────────────────────────────────
      { id: 15, title: "RSA Compliance",           description: "Australian RSA compliance — identifying intoxication, refusing service, legal obligations, and documentation.",                      category: "compliance", difficulty_level: 2 },
      { id: 16, title: "Food Safety",              description: "HACCP principles, allergen awareness, temperature control, cross-contamination prevention, and safe food handling.",                  category: "compliance", difficulty_level: 2 },
      { id: 25, title: "Allergy Shield",           description: "The protocol for marking a ticket, alerting the kitchen, and double-checking the plate before it reaches the table.",                category: "compliance", difficulty_level: 2 },
      { id: 19, title: "Opening & Closing",        description: "Venue opening checklist, closing tasks, cash handling, security lock-up, and handover procedures.",                                   category: "compliance", difficulty_level: 2 },
      { id: 20, title: "Inventory Control",        description: "Stock counting, variance tracking, waste reduction, ordering processes, and preventing shrinkage.",                                   category: "compliance", difficulty_level: 2 },
      { id: 31, title: "Jigger Precision",         description: "Why the jigger is the most important tool for venue survival — reading the meniscus and the financial impact of a heavy hand.",        category: "compliance", difficulty_level: 2 },
      { id: 35, title: "The Clean Close",          description: "Coffee machine purge, speed rail sanitisation, and dry-store layout. A perfect close is the greatest gift to the morning shift.",     category: "compliance", difficulty_level: 2 },
      { id: 1,  title: "Beer Pouring",             description: "Master beer pouring techniques — angle, head ratio, temperature, glassware matching.",                                               category: "technical",  difficulty_level: 2 },
      { id: 4,  title: "Barista Basics",           description: "Espresso extraction, milk steaming, latte ratios, grind consistency, temperature, customer preferences.",                            category: "technical",  difficulty_level: 2 },
      { id: 7,  title: "Bar-Back Efficiency",      description: "Stocking, restocking, ice management, glassware cycling, and supporting the bar team effectively.",                                   category: "technical",  difficulty_level: 2 },
      { id: 26, title: "Soda Gun Speed",           description: "Learning the button layout by feel, clearing the warm line, and what to do when the bag-in-box syrup runs out mid-service.",          category: "technical",  difficulty_level: 2 },
      { id: 27, title: "Two-Handed Flow",          description: "Expert bartenders move less, not faster. Two-handed service eliminates dead time in every movement.",                                 category: "technical",  difficulty_level: 2 },
      { id: 28, title: "Mid-Shift Reset",          description: "The 3-minute reload — replenishing citrus, ice, and glassware in the tiny windows of silence between service waves.",                category: "technical",  difficulty_level: 2 },
      { id: 34, title: "Tray & Glass Grip",        description: "The Pinch and the Stack — techniques to move high volumes of glassware safely without touching the rim.",                             category: "technical",  difficulty_level: 2 },
      { id: 39, title: "Bar-Back Synergy",         description: "How to be invisible — refilling ice and restocking without disrupting the bartender. Communicating needs before you run out.",          category: "technical",  difficulty_level: 2 },
      { id: 10, title: "Anticipatory Service",     description: "Spotting guest needs before they ask — refills, adjustments, timing, and proactive care.",                                           category: "service",    difficulty_level: 2 },
      { id: 12, title: "Suggestive Selling",       description: "Recommend with confidence — premium spirits, add-ons, specials — without being pushy.",                                               category: "service",    difficulty_level: 2 },
      { id: 14, title: "Phone Etiquette",          description: "Professional phone manner, taking reservations, handling enquiries, and managing booking systems.",                                   category: "service",    difficulty_level: 2 },
      { id: 29, title: "Docket Reading",           description: "Instantly recognise POS abbreviations (M/R, G/F, 86) and prioritise the order of operations from the moment a ticket prints.",        category: "service",    difficulty_level: 2 },
      { id: 30, title: "Beating the Weed",         description: "Acknowledge every guest, work tickets in order, and remember — slow is smooth, smooth is fast.",                                   category: "service",    difficulty_level: 2 },
      { id: 37, title: "The Out-of-Stock Pivot",   description: "Instantly suggest a similar alternative so the guest never feels let down by an unavailable item.",                                   category: "service",    difficulty_level: 2 },

      // ── Difficulty 3: Advanced / pro level (show these last) ───────────────
      { id: 2,  title: "Wine Service",             description: "Wine classification, tasting notes, pairing, service temperature, proper pouring, upselling.",                                       category: "technical",  difficulty_level: 3 },
      { id: 3,  title: "Cocktail Fundamentals",    description: "Cocktail technique, measurement, spirit knowledge, classic recipes, garnish, and riffing.",                                          category: "technical",  difficulty_level: 3 },
      { id: 32, title: "Wine Opener Mastery",      description: "The two-step lever system, cutting the foil below the lip, and the silent extraction of the cork.",                                   category: "technical",  difficulty_level: 3 },
      { id: 33, title: "Cellar & Kegs",            description: "Changing a coupler safely, identifying an empty gas bottle, and clearing air from the line to restore the pour.",                    category: "technical",  difficulty_level: 3 },
      { id: 9,  title: "Table Dynamics",           description: "Reading the table, pacing service, handling group dynamics, and delivering consistent experiences.",                                  category: "service",    difficulty_level: 3 },
      { id: 11, title: "Guest Complaints",         description: "De-escalation, empathy, solution-focused responses, and turning complaints into loyalty.",                                            category: "service",    difficulty_level: 3 },
      { id: 13, title: "VIP Management",           description: "High-value guest handling, reservation management, seating strategy, and special requests.",                                         category: "service",    difficulty_level: 3 },
      { id: 40, title: "Natural Upselling",        description: "The Power of Three — suggesting a specific premium brand or complementary side that makes guests feel cared for, not sold to.",        category: "service",    difficulty_level: 3 },
      { id: 17, title: "Conflict De-escalation",   description: "Managing aggressive guests, verbal techniques, when to involve security, and post-incident procedures.",                               category: "compliance", difficulty_level: 3 },
    ];

    return {
      modules: defaultModules.map((m, i) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        category: m.category as "technical" | "service" | "compliance",
        difficulty_level: m.difficulty_level,
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

/**
 * Rank of each category in a placement-check result, weakest = 0. Empty when
 * there's no result; callers treat a missing rank as neutral.
 */
export function rankCategories(scores: unknown): Map<string, number> {
  const ranks = new Map<string, number>();
  if (!scores || typeof scores !== "object") return ranks;
  const entries = Object.entries(scores as Record<string, unknown>)
    .filter((e): e is [string, number] => typeof e[1] === "number" && Number.isFinite(e[1]))
    .sort((a, b) => a[1] - b[1]);
  entries.forEach(([category], i) => ranks.set(category, i));
  return ranks;
}
