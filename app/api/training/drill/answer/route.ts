import { NextResponse } from "next/server";
import { logAnswer } from "@/lib/team-week";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getVerifiedUserFromRequest } from "@/lib/supabase-server";
import { validateSession } from "@/lib/session";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getCookieValue } from "@/lib/training-attempt";
import { readJsonBody } from "@/lib/ai-guard";
import { findQuestion } from "@/lib/question-bank";
import { answerFits, gradeAnswer, isAnswerShape, logVerifyRejection, questionView } from "@/lib/verify-quiz";
import { VENUE_MODULE_ID, advanceDrill, drillProgress, drillSummary, parseDrillQuestionId, type DrillState } from "@/lib/drill";
import type { Question } from "@/lib/question-bank";
import { asBankQuestion, readStoredQuestion, venueIdsForStaff } from "@/lib/venue-content";
import { loadShiftStreak, recordPreshiftDay } from "@/lib/shift-streak-store";

const MAX_BODY_BYTES = 1024;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * A venue question, while it's still approved and the person is still on
 * that venue's staff (or owns it). An item taken down mid-drill still grades.
 */
async function findVenueQuestion(admin: ReturnType<typeof createSupabaseAdminClient>, userId: string, questionId: string): Promise<Question | null> {
  if (!UUID_PATTERN.test(questionId)) return null;
  const { data, error } = await admin
    .from("venue_content_questions")
    .select("item_id, venue_id, question")
    .eq("id", questionId)
    .eq("status", "approved")
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const venues = await venueIdsForStaff(admin, userId);
  if (!venues.includes(data.venue_id as string)) return null;
  const stored = readStoredQuestion(data.question);
  return stored ? asBankQuestion(questionId, data.item_id as string, stored) : null;
}

type DrillRow = {
  user_id: string;
  position: number;
  correct: number;
  status: "active" | "finished";
  kind: "mixed" | "preshift";
  expires_at: string;
  run_state: DrillState;
};

/**
 * Grades one mixed drill answer and returns the next question, or the
 * drill's summary after the last one. The client says which drill, which
 * position and which answer; everything else comes from the server. See
 * lib/drill.ts.
 */
export async function POST(req: Request) {
  try {
    // Checked in the Worker, as for module quiz answers
    // (app/api/training/verify/answer).
    const user = await getVerifiedUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const ip = getClientIp(req);
    if (!rateLimit(`drill-answer:user:${user.id}`, 60)) {
      logVerifyRejection("verify_answer_rejected", "drill_rate_limited", user.id, null, ip);
      return NextResponse.json({ error: "Too many requests. Try again in a minute.", code: "RATE_LIMITED" }, { status: 429 });
    }

    const read = await readJsonBody(req, MAX_BODY_BYTES);
    if (!read.ok) return read.response;
    const { drillId, position, answer } = read.body;

    if (
      typeof drillId !== "string" || !UUID_PATTERN.test(drillId) ||
      typeof position !== "number" || !Number.isInteger(position) || position < 0 ||
      !isAnswerShape(answer)
    ) {
      logVerifyRejection("verify_answer_rejected", "drill_malformed", user.id, null, ip);
      return NextResponse.json({ error: "Invalid answer.", code: "INVALID_ANSWER" }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const browserSessionId = getCookieValue(req, "sbe_session_id");
    if (!browserSessionId) {
      return NextResponse.json({ error: "Missing active session. Please sign in again.", code: "SESSION_REQUIRED" }, { status: 401 });
    }
    const [sessionValidation, { data, error }] = await Promise.all([
      validateSession(admin, user.id, browserSessionId),
      admin
        .from("drill_runs")
        .select("user_id, position, correct, status, kind, expires_at, run_state")
        .eq("id", drillId)
        .maybeSingle(),
    ]);
    if (!sessionValidation.valid) {
      return NextResponse.json({ error: "Session conflict detected. Please resume this device.", code: "SESSION_CONFLICT" }, { status: 409 });
    }
    if (error) throw error;
    const drill = data as DrillRow | null;

    // Someone else's drill looks the same as a missing one.
    if (!drill || drill.user_id !== user.id) {
      logVerifyRejection("verify_answer_rejected", "drill_not_found", user.id, null, ip);
      return NextResponse.json({ error: "This drill has ended. Please start again.", code: "DRILL_NOT_FOUND" }, { status: 404 });
    }
    if (drill.status !== "active") {
      return NextResponse.json({ error: "This drill has already finished.", code: "DRILL_CLOSED" }, { status: 409 });
    }
    if (new Date(drill.expires_at).getTime() <= Date.now()) {
      return NextResponse.json({ error: "This drill timed out. Please start again.", code: "DRILL_EXPIRED" }, { status: 410 });
    }
    if (position !== drill.position) {
      logVerifyRejection("verify_answer_rejected", "drill_position_mismatch", user.id, null, ip);
      return NextResponse.json({ error: "That question was already answered.", code: "DRILL_POSITION_MISMATCH" }, { status: 409 });
    }

    const state = drill.run_state;
    const ref = state.queue[position] === undefined ? null : parseDrillQuestionId(state.queue[position]);
    const lookup = (moduleId: number, questionId: string) =>
      moduleId === VENUE_MODULE_ID ? findVenueQuestion(admin, user.id, questionId) : Promise.resolve(findQuestion(moduleId, questionId));
    const question = ref ? await lookup(ref.moduleId, ref.questionId) : null;
    if (!ref || !question) {
      return NextResponse.json({ error: "This drill has ended. Please start again.", code: "DRILL_NOT_FOUND" }, { status: 404 });
    }
    if (!answerFits(question, answer)) {
      logVerifyRejection("verify_answer_rejected", "drill_wrong_shape", user.id, ref.moduleId, ip);
      return NextResponse.json({ error: "Invalid answer.", code: "INVALID_ANSWER" }, { status: 400 });
    }

    const graded = gradeAnswer(question, answer);
    const advanced = advanceDrill(state, position, ref.moduleId, graded.correct);

    // Saved only if nothing else answered this question first.
    const { data: saved, error: saveError } = await admin
      .from("drill_runs")
      .update({
        run_state: advanced.state,
        position: position + 1,
        correct: drill.correct + (graded.correct ? 1 : 0),
        status: advanced.status,
        completed_at: advanced.status === "finished" ? new Date().toISOString() : null,
      })
      .eq("id", drillId)
      .eq("user_id", user.id)
      .eq("position", position)
      .eq("status", "active")
      .select("id");
    if (saveError) throw saveError;
    if (!saved || saved.length === 0) {
      return NextResponse.json({ error: "That question was already answered.", code: "DRILL_POSITION_MISMATCH" }, { status: 409 });
    }
    // For the venue goal and the manager's briefing card (lib/team-week.ts).
    await logAnswer(admin, { userId: user.id, moduleId: ref.moduleId, questionId: ref.questionId, correct: graded.correct, source: "drill" });

    let next = null;
    if (advanced.status === "active") {
      const nextRef = parseDrillQuestionId(advanced.state.queue[position + 1] ?? "");
      const nextQuestion = nextRef ? await lookup(nextRef.moduleId, nextRef.questionId) : null;
      if (nextRef && nextQuestion) {
        next = { ...questionView(nextQuestion, position + 1), moduleTitle: advanced.state.titles[String(nextRef.moduleId)] };
      }
    }

    // A finished pre-shift drill counts today towards the shift streak.
    let streak;
    if (advanced.status === "finished" && drill.kind === "preshift") {
      await recordPreshiftDay(admin, user.id);
      streak = await loadShiftStreak(admin, user.id);
    }

    return NextResponse.json({
      correct: graded.correct,
      correctAnswer: graded.correctAnswer,
      explanation: graded.explanation,
      status: advanced.status,
      progress: drillProgress(advanced.state),
      next,
      summary: advanced.status === "finished" ? { ...drillSummary(advanced.state), ...(streak ? { streak } : {}) } : undefined,
    });
  } catch (error) {
    console.error("drill/answer error:", error);
    return NextResponse.json({ error: "Could not check that answer. Please try again.", code: "DRILL_ANSWER_FAILED" }, { status: 500 });
  }
}
