/**
 * Module System Types
 * Defines all TypeScript interfaces for the 40-module adaptive learning platform
 */

type Category = 'technical' | 'service' | 'compliance';

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
