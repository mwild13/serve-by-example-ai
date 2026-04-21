/**
 * Diagnostic Assessment Engine
 * Processes user answers and generates baseline Elo ratings across module categories
 */

export interface DiagnosticAnswer {
  questionId: string;
  selected: string | boolean;
}

export interface CategoryScore {
  category: string;
  score: number; // Elo rating (base 1200, range 1000-1500)
  percentage: number; // 0-100 % correct
}

export interface DiagnosticResult {
  category_scores: Record<string, number>; // {technical: 1350, service: 1250, ...}
  detailed_scores: CategoryScore[];
  success: boolean;
  message: string;
}

/**
 * Maps module IDs to their categories
 * Used to seed Elo across modules based on diagnostic category scores
 */
const MODULE_CATEGORY_MAP: Record<number, string> = {
  // Technical (1-7)
  1: "technical", // Pouring Beer
  2: "technical", // Wine
  3: "technical", // Cocktails
  4: "technical", // Coffee
  5: "technical", // Carrying Glassware
  6: "technical", // Cleaning & Sanitation
  7: "technical", // Bar Back

  // Service (8-14)
  8: "service", // Greeting
  9: "service", // Table Dynamics
  10: "service", // Anticipatory Service
  11: "service", // Complaints
  12: "service", // Upselling
  13: "service", // VIP Management
  14: "service", // Phone Etiquette

  // Compliance (15-20)
  15: "compliance", // RSA
  16: "compliance", // Food Safety
  17: "compliance", // Conflict De-escalation
  18: "compliance", // Evacuation
  19: "compliance", // Opening/Closing
  20: "compliance", // Inventory & Waste
};

/**
 * Diagnostic Question Answers (hardcoded for mapping)
 * Maps question IDs to correct answers for scoring
 */
const DIAGNOSTIC_ANSWER_KEY: Record<string, string[] | string> = {
  // Q1: Beer pouring (Technical)
  "q1": ["The glass was dirty or wet before pouring", "The bartender poured too quickly or at wrong angle"],

  // Q2: First date service (Service)
  "q2": "Acknowledge both warmly, ask open questions, give them space",

  // Q3: Cocktail recipe (Technical)
  "q3": "Check a recipe reference or ask a senior bartender",

  // Q4: RSA - intoxicated guest (Compliance)
  "q4": "Assess their intoxication level and refuse service if impaired; offer water/food instead",

  // Q5: Complaint handling (Service)
  "q5": "Apologize, ask what's wrong, offer to remake it or suggest an alternative",

  // Q6: Food safety - dropped item (Technical)
  "q6": "Discard it immediately and use a fresh one",

  // Q7: Bar back priorities (Technical)
  "q7": "Support the bartender: keep ice full, clear used glasses, have bottles ready",

  // Q8: Conflict management (Compliance)
  "q8": "Monitor closely, stay calm, be ready to alert manager/security if escalates; try light intervention if safe",

  // Q9: Upselling (Service)
  "q9": "Ask about their taste preferences, suggest a beer they might enjoy, mention food pairings",

  // Q10: Wine recommendation (Technical)
  "q10": "Ask clarifying questions (dry vs. fruity?), offer to show options, suggest a few light options",
};

/**
 * Question to Category Mapping
 */
const QUESTION_CATEGORY_MAP: Record<string, string> = {
  "q1": "technical",
  "q2": "service",
  "q3": "technical",
  "q4": "compliance",
  "q5": "service",
  "q6": "technical",
  "q7": "technical",
  "q8": "compliance",
  "q9": "service",
  "q10": "technical",
};

/**
 * Score a diagnostic answer
 * Returns true if answer is correct, false otherwise
 */
function scoreAnswer(
  questionId: string,
  selectedAnswer: string | boolean
): boolean {
  const correctAnswer = DIAGNOSTIC_ANSWER_KEY[questionId];

  if (!correctAnswer) {
    console.warn(`Unknown question: ${questionId}`);
    return false;
  }

  // Multiple correct answers (array)
  if (Array.isArray(correctAnswer)) {
    if (typeof selectedAnswer !== "string") return false;
    return correctAnswer.includes(selectedAnswer);
  }

  // Single correct answer
  return selectedAnswer === correctAnswer;
}

/**
 * Calculate category scores from answers
 * Returns Elo-style ratings (1200 base, adjusted by performance)
 */
function calculateCategoryScores(
  answers: Record<string, string | boolean>
): CategoryScore[] {
  const categories: Record<string, { correct: number; total: number }> = {
    technical: { correct: 0, total: 0 },
    service: { correct: 0, total: 0 },
    compliance: { correct: 0, total: 0 },
  };

  // Score each answer and tally by category
  Object.entries(answers).forEach(([questionId, selectedAnswer]) => {
    const category = QUESTION_CATEGORY_MAP[questionId];
    if (!category) return;

    categories[category].total += 1;

    const isCorrect = scoreAnswer(questionId, selectedAnswer);
    if (isCorrect) {
      categories[category].correct += 1;
    }
  });

  // Convert to Elo-style ratings
  // Base: 1200
  // Range: 1000-1500 based on percentage correct
  const categoryScores: CategoryScore[] = Object.entries(categories).map(
    ([categoryName, stats]) => {
      const percentage = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;

      // Elo calculation: 1200 base + (percentage - 50) * 6
      // 50% correct = 1200 Elo
      // 100% correct = 1500 Elo
      // 0% correct = 900 Elo (clamped to 1000)
      const eloScore = Math.max(1000, Math.min(1500, 1200 + (percentage - 50) * 6));

      return {
        category: categoryName,
        score: Math.round(eloScore),
        percentage: Math.round(percentage),
      };
    }
  );

  return categoryScores;
}

/**
 * Main diagnostic processing function
 * Validates answers and returns category scores
 */
export async function processDiagnosticAnswers(
  answers: Record<string, string | boolean>
): Promise<DiagnosticResult> {
  try {
    // Validate we have all 10 answers
    const questionIds = Object.keys(DIAGNOSTIC_ANSWER_KEY);
    const providedIds = Object.keys(answers);

    if (providedIds.length !== questionIds.length) {
      return {
        category_scores: {},
        detailed_scores: [],
        success: false,
        message: `Incomplete diagnostic: expected ${questionIds.length} answers, got ${providedIds.length}`,
      };
    }

    // Calculate category scores
    const detailedScores = calculateCategoryScores(answers);

    // Build category_scores record for database storage
    const categoryScores: Record<string, number> = {};
    detailedScores.forEach((score) => {
      categoryScores[score.category] = score.score;
    });

    return {
      category_scores: categoryScores,
      detailed_scores: detailedScores,
      success: true,
      message: "Diagnostic assessment completed successfully",
    };
  } catch (error) {
    console.error("Error processing diagnostic answers:", error);
    return {
      category_scores: {},
      detailed_scores: [],
      success: false,
      message: "Error processing diagnostic assessment",
    };
  }
}

/**
 * Generate recommended modules based on diagnostic scores
 * Returns modules where user scored lowest (should start there)
 */
export function getRecommendedModules(
  categoryScores: Record<string, number>,
  count: number = 5
): Array<{ module_id: number; module_title: string; reason: string }> {
  // Sort categories by Elo (ascending = lowest first)
  const sortedCategories = Object.entries(categoryScores)
    .sort(([, scoreA], [, scoreB]) => scoreA - scoreB)
    .slice(0, 2); // Get lowest 2 categories

  const recommended: Array<{
    module_id: number;
    module_title: string;
    reason: string;
  }> = [];

  // Find modules matching lowest categories
  Object.entries(MODULE_CATEGORY_MAP).forEach(([moduleIdStr, category]) => {
    const moduleId = parseInt(moduleIdStr);
    const lowestCategory = sortedCategories[0]?.[0];

    if (category === lowestCategory && recommended.length < count) {
      const moduleNames: Record<number, string> = {
        1: "Pouring the Perfect Beer",
        2: "Wine Knowledge & Service",
        3: "Cocktail Fundamentals",
        4: "Coffee/Barista Basics",
        5: "Carrying Glassware & Trays",
        6: "Cleaning & Sanitation",
        7: "Bar Back Efficiency",
        8: "The Art of the Greeting",
        9: "Managing Table Dynamics",
        10: "Anticipatory Service",
        11: "Handling Guest Complaints",
        12: "Up-selling & Suggestive Sales",
        13: "VIP/Table Management",
        14: "Phone Etiquette & Reservations",
        15: "RSA (Responsible Service of Alcohol)",
        16: "Food Safety & Hygiene",
        17: "Conflict De-escalation",
        18: "Emergency Evacuation Protocols",
        19: "Opening & Closing Procedures",
        20: "Inventory & Waste Control",
      };

      const categoryScore = categoryScores[category] || 1200;
      const reason =
        categoryScore < 1150
          ? `Low score in ${category}; start here to build foundation`
          : categoryScore < 1250
          ? `Room to improve in ${category} skills`
          : `Strengthen your ${category} expertise`;

      recommended.push({
        module_id: moduleId,
        module_title: moduleNames[moduleId] || `Module ${moduleId}`,
        reason,
      });
    }
  });

  return recommended;
}

/**
 * Seed initial scenario_mastery records from diagnostic results
 * Creates Elo baseline for all modules based on category performance
 *
 * Called after diagnostic is submitted, before user accesses first module
 */
export function generateScenarioMasterySeeds(
  userId: string,
  categoryScores: Record<string, number>
): Array<{
  user_id: string;
  module_id: number;
  scenario_index: number;
  mastery_level: number;
  elo_rating: number;
  consecutive_correct: number;
  total_attempts: number;
  total_score_points: number;
  best_score: number;
  last_score: number;
  last_attempt_at: string;
  next_review_at: string;
}> {
  const now = new Date();
  const nextReview = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000); // 1 day

  const seeds: Array<{
    user_id: string;
    module_id: number;
    scenario_index: number;
    mastery_level: number;
    elo_rating: number;
    consecutive_correct: number;
    total_attempts: number;
    total_score_points: number;
    best_score: number;
    last_score: number;
    last_attempt_at: string;
    next_review_at: string;
  }> = [];

  // For each module, create a baseline seed record
  // This gives the mastery engine a starting point
  // Actual attempts override these seeds
  Object.entries(MODULE_CATEGORY_MAP).forEach(([moduleIdStr, category]) => {
    const moduleId = parseInt(moduleIdStr);
    const categoryElo = categoryScores[category] || 1200;

    // Create seed for this module
    seeds.push({
      user_id: userId,
      module_id: moduleId,
      scenario_index: 0, // Representative baseline
      mastery_level: 0, // Not yet attempted
      elo_rating: categoryElo, // Seed from diagnostic
      consecutive_correct: 0,
      total_attempts: 0,
      total_score_points: 0,
      best_score: 0,
      last_score: 0,
      last_attempt_at: now.toISOString(),
      next_review_at: nextReview.toISOString(),
    });
  });

  return seeds;
}
