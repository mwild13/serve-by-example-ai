/**
 * Domain Terminology Translation Layer
 *
 * Bridges user-facing domain language with the Supabase database schema.
 * The database schema is correct and well-designed; this layer ensures
 * internal code and external documentation use consistent terminology.
 *
 * NO DATABASE CHANGES REQUIRED.
 *
 * Quick reference:
 *   UI term "AI Scenario" (Arena) → DB scenarios.scenario_type = 'roleplay'
 *   UI term "Quiz"               → DB scenarios.scenario_type = 'quiz'
 *   UI term "Descriptor"         → DB scenarios.scenario_type IN ('descriptor_l2', 'descriptor_l3')
 *   UI term "Challenge"          → user_challenges table (separate from scenarios)
 */

/**
 * Raw database enum for scenarios.scenario_type.
 * Matches the CHECK constraint in supabase/migrations/20260421_2_create_scenarios.sql.
 */
export type DbScenarioType = 'quiz' | 'descriptor_l2' | 'descriptor_l3' | 'roleplay';

/**
 * User-facing domain terminology for scenario types.
 * Use this throughout UI code and comments; map to DbScenarioType for DB queries.
 *
 * L1 rapid-fire true/false   → 'quiz'
 * L2 pick 2 of 5             → 'descriptor_l2'
 * L3 pick 3 of 5             → 'descriptor_l3'
 * L4 AI-evaluated roleplay   → 'ai_roleplay' (stored as 'roleplay' in DB)
 */
export type DomainScenarioType =
  | 'quiz'
  | 'descriptor_l2'
  | 'descriptor_l3'
  | 'ai_roleplay';

/**
 * Convert a database scenario_type value to its domain/UI equivalent.
 * Safe to call on any valid DbScenarioType.
 */
export function mapDbToUi(dbType: DbScenarioType): DomainScenarioType {
  if (dbType === 'roleplay') return 'ai_roleplay';
  return dbType;
}

/**
 * Convert a domain scenario type back to the database column value.
 * Always use this before storing or querying the scenarios table.
 */
export function mapUiToDb(uiType: DomainScenarioType): DbScenarioType {
  if (uiType === 'ai_roleplay') return 'roleplay';
  return uiType;
}

/**
 * Navigation sections in the staff dashboard.
 * Used by DashboardShell to dispatch to the correct view component.
 *
 * Database relationships per nav item:
 *   home       → PreShiftHome: daily dashboard (no direct scenario fetch)
 *   module     → DynamicModuleNav: browse 40 modules
 *   rapid-fire → RapidFirePage: scenario_type = 'quiz'
 *   stage4     → DiagnosticFlow: scenario_type IN ('descriptor_l2', 'descriptor_l3')
 *   scenarios  → ArenaPage: scenario_type = 'roleplay' (ai_roleplay in domain terms)
 *   challenges → ChallengesPage: user_challenges table (NOT the scenarios table)
 *   cocktails  → CocktailLibrary: static content in lib/cocktails.ts
 *   knowledge  → KnowledgeBase: static content in lib/knowledge-base.ts
 *   progress   → ProgressOverview: aggregated from scenario_mastery table
 *   badges     → BadgesView: achievements from badges table
 *   settings   → StaffSettingsPanel: profile, notifications, venue join
 */
export type DomainNavigation =
  | 'home'
  | 'module'
  | 'rapid-fire'
  | 'stage4'
  | 'scenarios'
  | 'challenges'
  | 'cocktails'
  | 'knowledge'
  | 'progress'
  | 'badges'
  | 'settings';
