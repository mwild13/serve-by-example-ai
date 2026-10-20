import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getUserFromRequest } from "@/lib/supabase-server";
import { resolveAccess, validateSession } from "@/lib/session";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getCookieValue } from "@/lib/training-attempt";
import { readJsonBody } from "@/lib/ai-guard";
import { findQuestion, liveQuestions } from "@/lib/question-bank";
import { logVerifyRejection, questionView } from "@/lib/verify-quiz";
import {
  DRILL_START_WINDOW_MINUTES,
  DRILL_TTL_MINUTES,
  MAX_DRILL_STARTS_PER_WINDOW,
  MIN_DRILL_MODULES,
  VENUE_MODULE_ID,
  drillGoal,
  drillProgress,
  parseDrillQuestionId,
  planDrill,
  type DrillModule,
  type DrillState,
} from "@/lib/drill";
import type { Question } from "@/lib/question-bank";
import { asBankQuestion, readStoredQuestion, sydneyToday, venueIdsForStaff } from "@/lib/venue-content";

const MAX_BODY_BYTES = 256;
/** Drills older than this are deleted, except the latest. */
const KEEP_DAYS = 7;
/** Newest approved venue questions a drill can draw on. */
const VENUE_QUESTION_LIMIT = 40;

type VenueQuestionRow = {
  id: string;
  item_id: string;
  question: unknown;
  venue_content_items: { archived_at: string | null; ends_on: string | null } | null;
};

/**
 * Approved questions from the person's venues, newest first, leaving out
 * items taken down or past their end date. One title covers them all.
 */
async function venueSource(admin: ReturnType<typeof createSupabaseAdminClient>, userId: string): Promise<{ module: DrillModule; title: string } | null> {
  const venueIds = await venueIdsForStaff(admin, userId);
  if (venueIds.length === 0) return null;
  const [{ data, error }, { data: venues }] = await Promise.all([
    admin
      .from("venue_content_questions")
      .select("id, item_id, question, venue_content_items!inner(archived_at, ends_on)")
      .in("venue_id", venueIds)
      .eq("status", "approved")
      .order("reviewed_at", { ascending: false })
      .limit(VENUE_QUESTION_LIMIT),
    admin.from("venues").select("name").in("id", venueIds),
  ]);
  if (error) throw error;
  const today = sydneyToday();
  const questions: Question[] = [];
  for (const row of (data ?? []) as unknown as VenueQuestionRow[]) {
    const item = row.venue_content_items;
    if (!item || item.archived_at !== null || (item.ends_on !== null && item.ends_on < today)) continue;
    const stored = readStoredQuestion(row.question);
    if (stored) questions.push(asBankQuestion(row.id, row.item_id, stored));
  }
  if (questions.length === 0) return null;
  const names = (venues ?? []).map((v) => v.name as string).filter(Boolean);
  return { module: { moduleId: VENUE_MODULE_ID, questions, priority: true }, title: names.length === 1 ? names[0] : "Your venue" };
}

/**
 * Starts a mixed drill from the modules the person has started or mastered
 * and returns its first question, without the answer. Each answer is graded
 * by /api/training/drill/answer, which sends the next question. See
 * lib/drill.ts.
 */
export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const ip = getClientIp(req);
    if (!rateLimit(`drill-start:user:${user.id}`, 10)) {
      logVerifyRejection("verify_start_rejected", "drill_rate_limited", user.id, null, ip);
      return NextResponse.json({ error: "Too many requests. Try again in a minute.", code: "RATE_LIMITED" }, { status: 429 });
    }

    const read = await readJsonBody(req, MAX_BODY_BYTES);
    if (!read.ok) return read.response;

    const browserSessionId = getCookieValue(req, "sbe_session_id");
    if (!browserSessionId) {
      return NextResponse.json({ error: "Missing active session. Please sign in again.", code: "SESSION_REQUIRED" }, { status: 401 });
    }
    const admin = createSupabaseAdminClient();
    const sessionValidation = await validateSession(admin, user.id, browserSessionId);
    if (!sessionValidation.valid) {
      return NextResponse.json({ error: "Session conflict detected. Please resume this device.", code: "SESSION_CONFLICT" }, { status: 409 });
    }

    const windowStart = new Date(Date.now() - DRILL_START_WINDOW_MINUTES * 60_000).toISOString();
    const [access, startedRes, recentRes, latestRes, venue] = await Promise.all([
      resolveAccess(admin, user.id, user.email ?? ""),
      admin.from("quiz_modules_started").select("module_id").eq("user_id", user.id),
      admin
        .from("drill_runs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", windowStart),
      admin
        .from("drill_runs")
        .select("id, run_state")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      venueSource(admin, user.id),
    ]);
    if (startedRes.error) throw startedRes.error;
    if (recentRes.error) throw recentRes.error;
    if (latestRes.error) throw latestRes.error;

    if ((recentRes.count ?? 0) >= MAX_DRILL_STARTS_PER_WINDOW) {
      logVerifyRejection("verify_start_rejected", "drill_start_limit", user.id, null, ip);
      return NextResponse.json(
        { error: "You've started several drills in a row. Take a short break and try again.", code: "RATE_LIMITED" },
        { status: 429 },
      );
    }

    const allowed = new Set(access.allowedModules);
    const started = [...new Set((startedRes.data ?? []).map((r) => r.module_id as number))].filter((id) => allowed.has(id));
    const modules: DrillModule[] = started.map((moduleId) => ({ moduleId, questions: liveQuestions(moduleId) }));
    if (venue) modules.unshift(venue.module);

    const latest = latestRes.data as { id: string; run_state: DrillState | null } | null;
    const previous = new Set(latest?.run_state?.queue ?? []);
    // Avoid the last drill's questions; if that leaves too few, allow them.
    const queue = planDrill(modules, previous) ?? planDrill(modules);
    if (!queue || queue.length === 0) {
      const count = started.length;
      // Venue questions count as one source.
      const needed = MIN_DRILL_MODULES - (venue ? 1 : 0);
      return NextResponse.json(
        {
          error: `Mixed drills open once you've started ${needed} modules. You've started ${count === 1 ? "1 module" : `${count} modules`} so far.`,
          code: "DRILL_NEEDS_MODULES",
          started: count,
          needed,
        },
        { status: 409 },
      );
    }

    const find = (moduleId: number, questionId: string) =>
      moduleId === VENUE_MODULE_ID ? (venue?.module.questions.find((q) => q.id === questionId) ?? null) : findQuestion(moduleId, questionId);
    const first = parseDrillQuestionId(queue[0]);
    const firstQuestion = first ? find(first.moduleId, first.questionId) : null;
    if (!first || !firstQuestion) throw new Error("planned drill has no first question");

    const moduleIds = [...new Set(queue.map((id) => parseDrillQuestionId(id)?.moduleId).filter((id): id is number => id !== undefined && id !== VENUE_MODULE_ID))];
    const { data: titleRows, error: titleError } = await admin.from("modules").select("id, title").in("id", moduleIds);
    if (titleError) throw titleError;
    const titles: Record<string, string> = {};
    for (const row of titleRows ?? []) titles[String(row.id)] = row.title as string;
    if (venue) titles[String(VENUE_MODULE_ID)] = venue.title;

    // Old drills go, but the latest stays so the next drill can avoid it.
    const cutoff = new Date(Date.now() - KEEP_DAYS * 24 * 60 * 60_000).toISOString();
    let cleanup = admin.from("drill_runs").delete().eq("user_id", user.id).lt("created_at", cutoff);
    if (latest) cleanup = cleanup.neq("id", latest.id);
    await cleanup;

    const state: DrillState = { queue, titles, results: [] };
    const expiresAt = new Date(Date.now() + DRILL_TTL_MINUTES * 60_000).toISOString();
    const { data: drill, error: insertError } = await admin
      .from("drill_runs")
      .insert({ user_id: user.id, run_state: state, expires_at: expiresAt })
      .select("id")
      .single();
    if (insertError || !drill) throw insertError ?? new Error("drill_runs insert returned no row");

    return NextResponse.json({
      attemptId: drill.id,
      expiresAt,
      goal: drillGoal(state),
      progress: drillProgress(state),
      question: { ...questionView(firstQuestion, 0), moduleTitle: titles[String(first.moduleId)] },
    });
  } catch (error) {
    console.error("drill/start error:", error);
    return NextResponse.json({ error: "Could not start the drill. Please try again.", code: "DRILL_START_FAILED" }, { status: 500 });
  }
}
