import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getUserFromRequest } from "@/lib/supabase-server";
import { validateSession } from "@/lib/session";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getCookieValue } from "@/lib/training-attempt";
import { readJsonBody } from "@/lib/ai-guard";
import { moduleIdToString } from "@/lib/mastery";
import {
  VERIFY_STREAK_REQUIRED,
  afterModuleMastered,
  gradeAnswer,
  logVerifyRejection,
  type VerifyAnswer,
} from "@/lib/verify-quiz";

const MAX_BODY_BYTES = 1024;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type AttemptRow = {
  user_id: string;
  module_id: number;
  question_order: number[];
  position: number;
  streak: number;
  status: "active" | "passed" | "exhausted";
  expires_at: string;
};

type AdvanceResult = { streak: number; status: "active" | "passed" | "exhausted"; alreadyMastered: boolean };

/**
 * Grades one verify quiz answer. The client says which run, which position
 * and which answer; which question sits at that position, whether the answer
 * is right, and the streak all come from the server. See lib/verify-quiz.ts.
 */
export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    // A quick human answers one T/F question every second or two at most.
    const ip = getClientIp(req);
    if (!rateLimit(`verify-answer:user:${user.id}`, 60) || !rateLimit(`verify-answer:ip:${ip}`, 120)) {
      logVerifyRejection("verify_answer_rejected", "rate_limited", user.id, null, ip);
      return NextResponse.json({ error: "Too many requests. Try again in a minute.", code: "RATE_LIMITED" }, { status: 429 });
    }

    const read = await readJsonBody(req, MAX_BODY_BYTES);
    if (!read.ok) return read.response;
    const { attemptId, position, answer } = read.body;

    if (
      typeof attemptId !== "string" || !UUID_PATTERN.test(attemptId) ||
      typeof position !== "number" || !Number.isInteger(position) || position < 0 ||
      (answer !== "true" && answer !== "false")
    ) {
      logVerifyRejection("verify_answer_rejected", "malformed", user.id, null, ip);
      return NextResponse.json({ error: "Invalid quiz answer.", code: "INVALID_ANSWER" }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const browserSessionId = getCookieValue(req, "sbe_session_id");
    if (!browserSessionId) {
      return NextResponse.json({ error: "Missing active session. Please sign in again.", code: "SESSION_REQUIRED" }, { status: 401 });
    }
    const sessionValidation = await validateSession(admin, user.id, browserSessionId);
    if (!sessionValidation.valid) {
      return NextResponse.json({ error: "Session conflict detected. Please resume this device.", code: "SESSION_CONFLICT" }, { status: 409 });
    }

    const { data, error } = await admin
      .from("verify_attempts")
      .select("user_id, module_id, question_order, position, streak, status, expires_at")
      .eq("id", attemptId)
      .maybeSingle();
    if (error) throw error;
    const attempt = data as AttemptRow | null;

    // Someone else's run looks the same as a missing one.
    if (!attempt || attempt.user_id !== user.id) {
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

    const questionIndex = attempt.question_order[position];
    const graded = questionIndex === undefined ? null : gradeAnswer(attempt.module_id, questionIndex, answer as VerifyAnswer);
    if (!graded) {
      return NextResponse.json({ error: "This quiz has ended. Please start again.", code: "VERIFY_ATTEMPT_NOT_FOUND" }, { status: 404 });
    }

    // Re-checks status, expiry and position under a row lock, so two
    // concurrent answers to the same question can't both count.
    const { data: advanced, error: advanceError } = await admin.rpc("advance_verify_attempt", {
      p_attempt_id: attemptId,
      p_user_id: user.id,
      p_position: position,
      p_correct: graded.correct,
      p_required: VERIFY_STREAK_REQUIRED,
      p_module: moduleIdToString(attempt.module_id),
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
    const result = advanced as AdvanceResult;

    if (result.status === "passed") {
      await afterModuleMastered(admin, user, result.alreadyMastered);
    }

    return NextResponse.json({
      correct: graded.correct,
      correctAnswer: graded.correctAnswer,
      explanation: graded.explanation,
      streak: result.streak,
      required: VERIFY_STREAK_REQUIRED,
      status: result.status,
      moduleId: attempt.module_id,
    });
  } catch (error) {
    console.error("verify/answer error:", error);
    return NextResponse.json({ error: "Could not check that answer. Please try again.", code: "VERIFY_ANSWER_FAILED" }, { status: 500 });
  }
}
