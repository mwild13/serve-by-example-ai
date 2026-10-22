import { NextResponse } from "next/server";
import { logAnswer } from "@/lib/team-week";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getVerifiedUserFromRequest } from "@/lib/supabase-server";
import { validateSession } from "@/lib/session";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getCookieValue } from "@/lib/training-attempt";
import { readJsonBody } from "@/lib/ai-guard";
import { moduleIdToString } from "@/lib/mastery";
import { findQuestion, liveQuestions } from "@/lib/question-bank";
import {
  advanceRun,
  afterModuleMastered,
  answerFits,
  gradeAnswer,
  isAnswerShape,
  logVerifyRejection,
  progressOf,
  questionView,
  type RunState,
} from "@/lib/verify-quiz";

const MAX_BODY_BYTES = 1024;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type AttemptRow = {
  user_id: string;
  module_id: number;
  position: number;
  streak: number;
  status: "active" | "passed" | "exhausted";
  expires_at: string;
  /** Null for runs started by the old True/False engine. */
  run_state: RunState | null;
};

type AdvanceResult = { status: "active" | "passed" | "exhausted"; alreadyMastered: boolean };

/**
 * Grades one quiz answer and returns the next question. The client says which
 * run, which position and which answer; which question sits at that position,
 * whether the answer is right, and the run's progress all come from the
 * server. See lib/verify-quiz.ts.
 */
export async function POST(req: Request) {
  try {
    // Checked in the Worker, not with Supabase Auth: one round trip fewer on
    // every answer. A signed-out token still passes until it expires (an hour
    // at most), but only with this device's session cookie: signing in
    // anywhere else fails the one-device check below.
    const user = await getVerifiedUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    // A quick human answers one question every second or two at most.
    const ip = getClientIp(req);
    if (!rateLimit(`verify-answer:user:${user.id}`, 60)) {
      logVerifyRejection("verify_answer_rejected", "rate_limited", user.id, null, ip);
      return NextResponse.json({ error: "Too many requests. Try again in a minute.", code: "RATE_LIMITED" }, { status: 429 });
    }

    const read = await readJsonBody(req, MAX_BODY_BYTES);
    if (!read.ok) return read.response;
    const { attemptId, position, answer } = read.body;

    if (
      typeof attemptId !== "string" || !UUID_PATTERN.test(attemptId) ||
      typeof position !== "number" || !Number.isInteger(position) || position < 0 ||
      !isAnswerShape(answer)
    ) {
      logVerifyRejection("verify_answer_rejected", "malformed", user.id, null, ip);
      return NextResponse.json({ error: "Invalid quiz answer.", code: "INVALID_ANSWER" }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const browserSessionId = getCookieValue(req, "sbe_session_id");
    if (!browserSessionId) {
      return NextResponse.json({ error: "Missing active session. Please sign in again.", code: "SESSION_REQUIRED" }, { status: 401 });
    }
    // Independent reads, so they go to the database together: one round trip
    // instead of two on every answer.
    const [sessionValidation, { data, error }] = await Promise.all([
      validateSession(admin, user.id, browserSessionId),
      admin
        .from("verify_attempts")
        .select("user_id, module_id, position, streak, status, expires_at, run_state")
        .eq("id", attemptId)
        .maybeSingle(),
    ]);
    if (!sessionValidation.valid) {
      return NextResponse.json({ error: "You're signed in on another device. Sign in again to use this one.", code: "SESSION_CONFLICT" }, { status: 409 });
    }
    if (error) throw error;
    const attempt = data as AttemptRow | null;

    // Someone else's run looks the same as a missing one, and so does a run
    // from the old engine (they expire within 20 minutes of the release).
    if (!attempt || attempt.user_id !== user.id || !attempt.run_state) {
      logVerifyRejection("verify_answer_rejected", "not_found", user.id, null, ip);
      return NextResponse.json({ error: "This quiz has ended. Please start again.", code: "VERIFY_ATTEMPT_NOT_FOUND" }, { status: 404 });
    }
    if (attempt.status !== "active") {
      return NextResponse.json({ error: "This quiz has already finished.", code: "VERIFY_ATTEMPT_CLOSED", status: attempt.status }, { status: 409 });
    }
    if (new Date(attempt.expires_at).getTime() <= Date.now()) {
      logVerifyRejection("verify_answer_rejected", "expired", user.id, attempt.module_id, ip);
      return NextResponse.json({ error: "This quiz timed out. Please start again.", code: "VERIFY_ATTEMPT_EXPIRED" }, { status: 410 });
    }
    if (position !== attempt.position) {
      logVerifyRejection("verify_answer_rejected", "position_mismatch", user.id, attempt.module_id, ip);
      return NextResponse.json(
        { error: "That question was already answered.", code: "VERIFY_POSITION_MISMATCH", position: attempt.position, streak: attempt.streak },
        { status: 409 },
      );
    }

    const run = attempt.run_state;
    const questionId = run.queue[position];
    const question = questionId === undefined ? null : findQuestion(attempt.module_id, questionId);
    if (!question) {
      return NextResponse.json({ error: "This quiz has ended. Please start again.", code: "VERIFY_ATTEMPT_NOT_FOUND" }, { status: 404 });
    }
    if (!answerFits(question, answer)) {
      logVerifyRejection("verify_answer_rejected", "wrong_shape", user.id, attempt.module_id, ip);
      return NextResponse.json({ error: "Invalid quiz answer.", code: "INVALID_ANSWER" }, { status: 400 });
    }

    const graded = gradeAnswer(question, answer);
    const advanced = advanceRun(run, position, question, graded.correct, liveQuestions(attempt.module_id));
    const streak = graded.correct ? attempt.streak + 1 : 0;

    // Re-checks status, expiry and position under a row lock, so two
    // concurrent answers to the same question can't both count. Masters the
    // module when the run passes.
    const { data: saved, error: advanceError } = await admin.rpc("advance_quiz_run", {
      p_attempt_id: attemptId,
      p_user_id: user.id,
      p_position: position,
      p_run_state: advanced.state,
      p_streak: streak,
      p_status: advanced.status,
      p_module: moduleIdToString(attempt.module_id),
      p_score: advanced.state.correct,
    });
    if (advanceError) {
      const message = advanceError.message ?? "";
      if (message.includes("VERIFY_POSITION_MISMATCH") || message.includes("VERIFY_ATTEMPT_CLOSED")) {
        return NextResponse.json({ error: "That question was already answered.", code: "VERIFY_POSITION_MISMATCH" }, { status: 409 });
      }
      if (message.includes("VERIFY_ATTEMPT_EXPIRED")) {
        return NextResponse.json({ error: "This quiz timed out. Please start again.", code: "VERIFY_ATTEMPT_EXPIRED" }, { status: 410 });
      }
      throw advanceError;
    }
    const result = saved as AdvanceResult;
    // For the venue goal and the manager's briefing card (lib/team-week.ts).
    await logAnswer(admin, { userId: user.id, moduleId: attempt.module_id, questionId: question.id, correct: graded.correct, source: "quiz" });

    if (result.status === "passed") {
      await afterModuleMastered(admin, user, result.alreadyMastered);
    }

    const nextId = result.status === "active" ? advanced.state.queue[position + 1] : undefined;
    const nextQuestion = nextId === undefined ? null : findQuestion(attempt.module_id, nextId);

    return NextResponse.json({
      correct: graded.correct,
      correctAnswer: graded.correctAnswer,
      explanation: graded.explanation,
      status: result.status,
      progress: progressOf(advanced.state),
      next: nextQuestion ? questionView(nextQuestion, position + 1) : null,
      moduleId: attempt.module_id,
    });
  } catch (error) {
    console.error("verify/answer error:", error);
    return NextResponse.json({ error: "Could not check that answer. Please try again.", code: "VERIFY_ANSWER_FAILED" }, { status: 500 });
  }
}
