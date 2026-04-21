/**
 * Module System Types
 * Defines all TypeScript interfaces for the 20-module adaptive learning platform
 */

export type Category = 'technical' | 'service' | 'compliance';
export type ScenarioType = 'quiz' | 'descriptor_l2' | 'descriptor_l3' | 'roleplay';

/**
 * Module Definition
 * Core metadata for each of the 20 learning modules
 */
export interface Module {
  id: number; // 1-20, immutable
  title: string; // e.g., "Pouring the Perfect Beer"
  description: string;
  category: Category;
  difficulty_level: number; // 1-5 scale
  current_elo: number; // User's current Elo in this module
  mastery_pct: number; // Percentage of scenarios at level 3
  completion_pct: number; // Percentage of scenarios attempted
  recommended: boolean; // Whether recommended for this user
  recommendation_reason?: string; // Why it's recommended
  // Optional fields for full module data
  subcategory?: string; // e.g., "beer", "wine", "cocktails"
  recommended_prereq_ids?: number[]; // e.g., [1, 2] for prerequisites
  required_role?: string; // e.g., 'bartender', 'manager', null for all
  min_elo_for_advanced?: number; // threshold to show harder scenarios (default 1500)
  created_at?: string;
  updated_at?: string;
}

/**
 * Quiz Content (L1)
 * True/false or simple recall format
 */
export interface QuizContent {
  question: string;
  answer: string; // The correct answer text
  explanation: string;
  option_type?: 'truefalse' | 'multiselect'; // For L1, typically true/false
}

/**
 * Descriptor Content (L2 & L3)
 * Pick N of 5 descriptors format
 */
export interface DescriptorContent {
  prompt: string;
  descriptors: string[]; // Exactly 5 options
  correctIndices: number[]; // Indices of correct descriptors
  explanation: string;
}

/**
 * Roleplay Content (L4)
 * Open-ended scenario evaluated by AI
 */
export interface RoleplayContent {
  prompt: string;
  evaluation_dimensions: string[]; // e.g., ["Communication", "Problem-Solving"]
  model_response_for_ai_grading?: string; // Optional example response
}

/**
 * Scenario
 * Individual question/scenario within a module
 */
export interface Scenario {
  id: string; // UUID
  module_id: number;
  scenario_index: number; // 0-based within the module
  scenario_type: ScenarioType;
  prompt: string; // Display text for the scenario
  content: QuizContent | DescriptorContent | RoleplayContent;
  difficulty: number; // 1-5 scale for adaptive selection
  tags: string[]; // e.g., ["beer", "pouring", "technique"]
  created_at: string;
  updated_at: string;
}

/**
 * Diagnostic Question
 * Global (non-customizable) assessment questions for onboarding
 */
export interface DiagnosticQuestion {
  id: string; // UUID
  question_text: string;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
  target_categories: Category[]; // Which module categories this assesses
  explanation: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Module ELO Baseline
 * Results from diagnostic assessment, seeds initial module Elo ratings
 */
export interface ModuleEloBaseline {
  id: string; // UUID
  user_id: string; // UUID from auth.users
  diagnostic_completed_at: string; // ISO timestamp
  answers: Record<string, string | boolean>; // {questionId: selectedOption}
  category_scores: Record<string, number>; // {technical: 1300, service: 1250, ...}
  created_at: string;
  updated_at: string;
}

/**
 * Module Progress (Computed)
 * Aggregated view of user's progress in a module
 * Computed from scenario_mastery table
 */
export interface ModuleProgress {
  module_id: number;
  module_title: string;
  completion_pct: number; // % of scenarios attempted
  mastery_pct: number; // % of scenarios at mastery_level=3
  avg_elo: number;
  scenarios_attempted: number;
  scenarios_mastered: number;
  avg_score: number;
  total_attempts: number;
  next_review_count: number; // Scenarios due for review (spaced rep)
}

/**
 * User Proficiency (Per Module)
 * Individual Elo rating for each module
 * Computed from scenario_mastery where module_id matches
 */
export interface UserModuleProficiency {
  user_id: string;
  module_id: number;
  module_title: string;
  elo_rating: number;
  confidence_score: number; // Average confidence across attempts
  last_tested_date: string;
  mastery_status: number; // 0-3 scale
}

/**
 * Available Modules Response
 * Returned by GET /api/training/modules
 * Filtered by user role, tier, venue, and recommended by Elo
 */
export interface AvailableModulesResponse {
  modules: {
    id: number;
    title: string;
    description: string;
    category: Category;
    difficulty_level: number;
    current_elo: number;
    mastery_pct: number;
    completion_pct: number;
    recommended: boolean; // True if should be prioritized
    recommendation_reason?: string;
  }[];
  total_modules: number;
  accessible_modules: number;
  user_role: string;
  platform_version: number;
}

/**
 * Module Navigator Config
 * Used by getAvailableModules() to filter and rank modules
 */
export interface ModuleNavigatorConfig {
  user_id: string;
  user_role: 'individual' | 'venue_staff' | 'manager';
  tier: string; // 'free', 'pro', 'venue_single', 'venue_multi'
  venue_id?: string;
  enabled_module_ids?: number[]; // null = all enabled
  user_elo_by_module: Record<number, number>; // {module_id: elo_rating}
}

/**
 * Scenario Load Response
 * Returned by GET /api/training/modules/:moduleId/scenarios
 */
export interface ScenarioLoadResponse {
  module: Module;
  scenarios: Scenario[];
  module_elo: number;
  module_mastery: number; // %
  user_progress: {
    scenarios_attempted: number;
    scenarios_mastered: number;
    avg_score: number;
  };
}

/**
 * Diagnostic Submit Request
 * Posted to /api/training/diagnostic/submit
 */
export interface DiagnosticSubmitRequest {
  diagnostic_id: string;
  answers: Record<string, string | boolean>; // {questionId: selected answer}
}

/**
 * Diagnostic Submit Response
 * Returns seeded Elo and recommended modules
 */
export interface DiagnosticSubmitResponse {
  success: boolean;
  category_scores: Record<string, number>; // {technical: 1350, service: 1250, ...}
  recommended_modules: {
    module_id: number;
    module_title: string;
    reason: string; // e.g., "Low score in this category; start here"
  }[];
  message: string;
}

/**
 * Training Save Request
 * Posted to /api/training/save
 * Extended to include moduleId
 */
export interface TrainingSaveRequest {
  module_id: number; // NEW: dynamic module selection
  scenario_index: number;
  overall_score: number; // 0-25
  confidence: number; // 0-100
  scenario_type: ScenarioType;
}

/**
 * Training Save Response
 * Returns updated mastery and Elo
 */
export interface TrainingSaveResponse {
  success: boolean;
  mastery_level: number; // 0-3
  elo_rating: number;
  elo_delta: number; // Change from previous
  consecutive_correct: number;
  next_review_at: string; // ISO timestamp
  bridge_triggered: boolean; // Suggested difficulty change
  message: string;
}

/**
 * Scenario Mastery Extended
 * Database record with module_id added
 */
export interface ScenarioMasteryRecord {
  user_id: string;
  module_id: number; // NEW: tracks which module
  scenario_index: number;
  mastery_level: number; // 0-3
  consecutive_correct: number;
  total_attempts: number;
  total_score_points: number;
  best_score: number;
  last_score: number;
  last_attempt_at: string;
  next_review_at: string;
  elo_rating: number;
  last_confidence: number;
  high_confidence_incorrect: number;
  low_confidence_correct: number;
  consecutive_fails: number;
}
