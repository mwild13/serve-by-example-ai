/**
 * Diagnostic Assessment Engine
 * Scores the placement check per category (percent correct).
 * The result only orders recommendations (lib/module-navigator.ts); it is
 * not a compliance or mastery signal. It used to be converted to Elo-style
 * ratings and seeded into scenario_mastery (audit Phase 5 retired both).
 */

/**
 * The questions the placement check asks, in the order they are shown.
 * Two per category, so each category scores 0, 50 or 100 and none outweighs
 * the others. The bank (diagnostic_questions) still holds all ten: q1, q3
 * and q7 only suit bar staff and q2 was the weakest of the service three.
 * Opens with the easiest question and ends on the two compliance ones.
 */
export const PLACEMENT_QUESTION_KEYS = ["q6", "q5", "q10", "q9", "q4", "q8"] as const;

export interface DiagnosticAnswer {
  questionId: string;
  selected: string | boolean;
}

interface CategoryScore {
  category: string;
  score: number; // 0-100 % correct (same value as percentage; kept for response compatibility)
  percentage: number; // 0-100 % correct
}

export interface DiagnosticResult {
  category_scores: Record<string, number>; // {technical: 80, service: 60, ...} percent correct
  detailed_scores: CategoryScore[];
  success: boolean;
  message: string;
}

/**
 * Maps module IDs to their categories
 * Used to pick recommended modules from the weakest category
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
 * Maps question IDs to correct answers for scoring. Each string must match
 * the option text stored in diagnostic_questions character for character.
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
  "q10": "Ask clarifying questions (dry vs. fruity? Any preferences?), offer to show options, suggest a few light options",
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
 * Returns percent correct per category
 */
function calculateCategoryScores(
  answers: Record<string, string | boolean>
): CategoryScore[] {
  const categories: Record<string, { correct: number; total: number }> = {
    technical: { correct: 0, total: 0 },
    service: { correct: 0, total: 0 },
    compliance: { correct: 0, total: 0 },
  };

  // Score each asked question and tally by category. Anything else in the
  // payload is ignored (a tab still open on the old ten-question build
  // submits all ten).
  PLACEMENT_QUESTION_KEYS.forEach((questionId) => {
    const selectedAnswer = answers[questionId];
    const category = QUESTION_CATEGORY_MAP[questionId];
    if (!category || selectedAnswer === undefined) return;

    categories[category].total += 1;

    const isCorrect = scoreAnswer(questionId, selectedAnswer);
    if (isCorrect) {
      categories[category].correct += 1;
    }
  });

  const categoryScores: CategoryScore[] = Object.entries(categories).map(
    ([categoryName, stats]) => {
      const percentage = Math.round(stats.total > 0 ? (stats.correct / stats.total) * 100 : 0);
      return { category: categoryName, score: percentage, percentage };
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
    // Validate every asked question has an answer
    const answeredCount = PLACEMENT_QUESTION_KEYS.filter((id) => answers[id] !== undefined).length;

    if (answeredCount !== PLACEMENT_QUESTION_KEYS.length) {
      return {
        category_scores: {},
        detailed_scores: [],
        success: false,
        message: `Incomplete diagnostic: expected ${PLACEMENT_QUESTION_KEYS.length} answers, got ${answeredCount}`,
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
  // Sort categories by score (ascending = lowest first)
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
      // Shortened 2026-08-24 (docs/Module-Title-Renames-Proposal.md) — 2-3
      // word titles so the Learn Hub's 2-column module grid and the
      // Practice & Scenarios single-line tiles both fit without truncation.
      const moduleNames: Record<number, string> = {
        1: "Beer Pouring",
        2: "Wine Service",
        3: "Cocktail Fundamentals",
        4: "Barista Basics",
        5: "Tray Carrying",
        6: "Sanitation Basics",
        7: "Bar-Back Efficiency",
        8: "The Greeting",
        9: "Table Dynamics",
        10: "Anticipatory Service",
        11: "Guest Complaints",
        12: "Suggestive Selling",
        13: "VIP Management",
        14: "Phone Etiquette",
        15: "RSA Compliance",
        16: "Food Safety",
        17: "Conflict De-escalation",
        18: "Evacuation Protocols",
        19: "Opening & Closing",
        20: "Inventory Control",
      };

      const categoryScore = categoryScores[category] ?? 50;
      const reason =
        categoryScore < 50
          ? `Low score in ${category}; start here to build foundation`
          : categoryScore < 75
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
