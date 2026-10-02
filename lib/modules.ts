/**
 * Module System Types
 * Defines all TypeScript interfaces for the 40-module adaptive learning platform
 */

type Category = 'technical' | 'service' | 'compliance';
type ScenarioType = 'quiz' | 'descriptor_l2' | 'descriptor_l3' | 'roleplay';

/**
 * Module Definition
 * Core metadata for each of the 40 learning modules
 */
export interface Module {
  id: number; // 1-40, immutable
  title: string; // e.g., "Beer Pouring"
  description: string;
  category: Category;
  difficulty_level: number; // 1-5 scale
  mastery_pct: number; // Percentage of scenarios at level 3
  completion_pct: number; // Percentage of scenarios attempted
  recommended: boolean; // Whether recommended for this user
  recommendation_reason?: string; // Why it's recommended
  // Optional fields for full module data
  subcategory?: string; // e.g., "beer", "wine", "cocktails"
  recommended_prereq_ids?: number[]; // e.g., [1, 2] for prerequisites
  required_role?: string; // e.g., 'bartender', 'manager', null for all
  created_at?: string;
  updated_at?: string;
}

/**
 * Quiz Content (L1)
 * True/false or simple recall format
 */
interface QuizContent {
  question: string;
  answer: string; // The correct answer text
  explanation: string;
  option_type?: 'truefalse' | 'multiselect'; // For L1, typically true/false
}

/**
 * Descriptor Content (L2 & L3)
 * Pick N of 5 descriptors format
 */
interface DescriptorContent {
  prompt: string;
  descriptors: string[]; // Exactly 5 options
  correctIndices: number[]; // Indices of correct descriptors
  explanation: string;
}

/**
 * Roleplay Content (L4)
 * Open-ended scenario evaluated by AI
 */
interface RoleplayContent {
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
 * Available Modules Response
 * Returned by GET /api/training/modules
 * Recommendations: see lib/module-navigator.ts
 */
export interface AvailableModulesResponse {
  modules: {
    id: number;
    title: string;
    description: string;
    category: Category;
    difficulty_level: number;
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
