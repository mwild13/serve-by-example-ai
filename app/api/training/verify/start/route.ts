import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getUserFromRequest } from "@/lib/supabase-server";
import { resolveAccess, validateSession } from "@/lib/session";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getCookieValue } from "@/lib/training-attempt";
import { readJsonBody } from "@/lib/ai-guard";
import { findQuestion, liveQuestions } from "@/lib/question-bank";
import {
  MAX_STARTS_PER_WINDOW,
  START_WINDOW_MINUTES,
  VERIFY_ATTEMPT_TTL_MINUTES,
  logVerifyRejection,
  planRun,
  progressOf,
  questionView,
} from "@/lib/verify-quiz";

const MAX_BODY_BYTES = 1024;

/**
 * Starts a quiz run for one module and returns its first question, without
 * the answer. Each answer is graded by /api/training/verify/answer, which
 * sends the next question. See lib/verify-quiz.ts.
 */
export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const ip = getClientIp(req);
    if (!rateLimit(`verify-start:user:${user.id}`, 10)) {
      logVerifyRejection("verify_start_rejected", "rate_limited", user.id, null, ip);
      return NextResponse.json({ error: "Too many requests. Try again in a minute.", code: "RATE_LIMITED" }, { status: 429 });
    }

    const read = await readJsonBody(req, MAX_BODY_BYTES);
    if (!read.ok) return read.response;

    const moduleId = Number(read.body.moduleId);
    if (!Number.isInteger(moduleId) || moduleId < 1 || moduleId > 100) {
      return NextResponse.json({ error: "Invalid module.", code: "INVALID_MODULE" }, { status: 400 });
    }
    const run = planRun(liveQuestions(moduleId));
    const first = run ? findQuestion(moduleId, run.queue[0]) : null;
    if (!run || !first) {
      return NextResponse.json(
        { error: "This module does not yet have enough verification questions. Please check back soon.", code: "NO_QUESTIONS" },
        { status: 404 },
      );
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

    const access = await resolveAccess(admin, user.id, user.email ?? "");
    if (!access.allowedModules.includes(moduleId)) {
      return NextResponse.json(
        { error: "Your current plan does not include this module. Please upgrade.", code: "MODULE_ACCESS_DENIED" },
        { status: 403 },
      );
    }

    // Per-module cap in the database, which holds across Worker isolates
    // (the in-memory limit above doesn't).
    const windowStart = new Date(Date.now() - START_WINDOW_MINUTES * 60_000).toISOString();
    const { count: recentStarts, error: countError } = await admin
      .from("verify_attempts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("module_id", moduleId)
      .gte("created_at", windowStart);
    if (countError) throw countError;
    if ((recentStarts ?? 0) >= MAX_STARTS_PER_WINDOW) {
      logVerifyRejection("verify_start_rejected", "start_limit", user.id, moduleId, ip);
      return NextResponse.json(
        { error: "You've started this quiz several times in a row. Take a short break and try again.", code: "RATE_LIMITED" },
        { status: 429 },
      );
    }

    // Opportunistic cleanup of this user's old runs keeps the table small.
    await admin
      .from("verify_attempts")
      .delete()
      .eq("user_id", user.id)
      .lt("created_at", new Date(Date.now() - 24 * 60 * 60_000).toISOString());

    const expiresAt = new Date(Date.now() + VERIFY_ATTEMPT_TTL_MINUTES * 60_000).toISOString();
    const { data: attempt, error: insertError } = await admin
      .from("verify_attempts")
      // question_order is the old engine's column; runs now live in run_state.
      .insert({ user_id: user.id, module_id: moduleId, question_order: [], run_state: run, expires_at: expiresAt })
      .select("id")
      .single();
    if (insertError || !attempt) throw insertError ?? new Error("verify_attempts insert returned no row");

    return NextResponse.json({
      attemptId: attempt.id,
      expiresAt,
      goal: run.goal,
      progress: progressOf(run),
      question: questionView(first, 0),
    });
  } catch (error) {
    console.error("verify/start error:", error);
    return NextResponse.json({ error: "Could not start the quiz. Please try again.", code: "VERIFY_START_FAILED" }, { status: 500 });
  }
}
