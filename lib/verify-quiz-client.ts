/**
 * Browser calls for the server-graded module quiz (desktop ModuleVerify and
 * mobile QuizScreen). The browser gets one question at a time and never the
 * answer key; every answer is graded by /api/training/verify/answer. See
 * lib/verify-quiz.ts.
 */

export type QuizFormat =
  | "true_false"
  | "best_line"
  | "multiple_choice"
  | "order_steps"
  | "spot_mistake"
  | "number"
  | "which_glass";

export type QuizOption = { id: string; text: string };

/** One question as the browser sees it. Which fields are set depends on the format. */
export type QuizQuestionView = {
  position: number;
  format: QuizFormat;
  prompt: string;
  /** Choice formats and True/False. */
  options?: QuizOption[];
  /** order_steps, shuffled. */
  steps?: QuizOption[];
  /** number. */
  unit?: string;
};

/** An option id, step ids in order, or a number, depending on the format. */
export type QuizAnswer = string | string[] | number;
export type QuizCorrectAnswer = string | string[] | number;

/** What it takes to master the module in this run. */
export type QuizGoal = {
  correct: number;
  formats: number;
  maxMisses: number;
  /** A short, hard run that masters the module straight away. */
  testOut?: boolean;
};

export type QuizProgress = {
  correct: number;
  formats: number;
  misses: number;
  /** Wrong answers still to be answered right in another form. */
  owed: number;
};

export type VerifyQuizStart = {
  attemptId: string;
  expiresAt: string;
  goal: QuizGoal;
  progress: QuizProgress;
  question: QuizQuestionView;
};

export type VerifyAnswerResult = {
  correct: boolean;
  correctAnswer: QuizCorrectAnswer;
  explanation: string;
  /** "passed": the module is now mastered. "exhausted": the run is over, start again. */
  status: "active" | "passed" | "exhausted";
  progress: QuizProgress;
  /** The next question while the run is active. */
  next: QuizQuestionView | null;
};

/** "Get 6 right across 3 question types to master this module." */
export function quizGoalText(goal: QuizGoal): string {
  if (goal.testOut) {
    const misses = goal.maxMisses - 1;
    return `Test out: get ${goal.correct} right${goal.formats > 1 ? ` across ${goal.formats} question types` : ""}, with ${misses === 1 ? "1 miss" : `${misses} misses`} allowed.`;
  }
  return goal.formats > 1
    ? `Get ${goal.correct} right across ${goal.formats} question types to master this module.`
    : `Get ${goal.correct} right to master this module.`;
}

class VerifyQuizError extends Error {
  constructor(message: string, readonly code: string | null, readonly status: number) {
    super(message);
    this.name = "VerifyQuizError";
  }
}

async function post<T>(url: string, token: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => null)) as (T & { error?: string; code?: string }) | null;
  if (!res.ok || !data) {
    throw new VerifyQuizError(data?.error ?? `Request failed (${res.status}).`, data?.code ?? null, res.status);
  }
  return data;
}

export function startVerifyQuiz(token: string, moduleId: number, testOut = false): Promise<VerifyQuizStart> {
  return post<VerifyQuizStart>("/api/training/verify/start", token, testOut ? { moduleId, mode: "test_out" } : { moduleId });
}

export function submitVerifyAnswer(
  token: string,
  attemptId: string,
  position: number,
  answer: QuizAnswer,
): Promise<VerifyAnswerResult> {
  return post<VerifyAnswerResult>("/api/training/verify/answer", token, { attemptId, position, answer });
}
