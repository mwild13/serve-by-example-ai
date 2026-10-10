/**
 * Browser calls for the server-graded verify quiz (desktop ModuleVerify and
 * mobile QuizScreen). The browser gets prompts only; every answer is graded
 * by /api/training/verify/answer. See lib/verify-quiz.ts.
 */

export type VerifyQuizQuestion = { position: number; prompt: string };

export type VerifyQuizStart = {
  attemptId: string;
  expiresAt: string;
  required: number;
  questions: VerifyQuizQuestion[];
};

export type VerifyAnswerResult = {
  correct: boolean;
  correctAnswer: "true" | "false";
  explanation: string;
  streak: number;
  required: number;
  /** "passed": the module is now mastered. "exhausted": out of questions, start again. */
  status: "active" | "passed" | "exhausted";
};

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

export function startVerifyQuiz(token: string, moduleId: number): Promise<VerifyQuizStart> {
  return post<VerifyQuizStart>("/api/training/verify/start", token, { moduleId });
}

export function submitVerifyAnswer(
  token: string,
  attemptId: string,
  position: number,
  answer: "true" | "false",
): Promise<VerifyAnswerResult> {
  return post<VerifyAnswerResult>("/api/training/verify/answer", token, { attemptId, position, answer });
}
