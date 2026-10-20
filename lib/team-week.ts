/**
 * team-week.ts – Team features (Rich update, Phase 16), without shaming
 * anyone.
 *
 *   The venue goal: the manager sets one thing to count for the week
 *   (correct answers, days trained, Live Guest passes or Saturday Rush
 *   shifts) and a target. Staff see the team's total on Home. No names, no
 *   ranking.
 *   The guest of the week: one Live Guest guest the manager picks for the
 *   whole team. It's first in everyone's Live Guest list, with how many of
 *   the team have sorted it.
 *   The briefing card: one page for the pre-shift meeting. The last seven
 *   days in team totals, and the questions the team missed most, each with
 *   the right answer and one line to say about it. A question only shows
 *   once two or more people have missed it.
 *
 * Weeks run Monday to Sunday, Sydney time. Stored in venue_weeks and
 * quiz_answer_log (20261029_team_week.sql). Routes:
 * /api/training/team-week (staff) and /api/management/team-week.
 */

import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { findQuestion, type Question } from "@/lib/question-bank";
import { VENUE_MODULE_ID } from "@/lib/drill";
import { asBankQuestion, readStoredQuestion, sydneyToday } from "@/lib/venue-content";
import { findGuest } from "@/lib/live-guest/guests";
import { GOAL_KINDS, type Briefing, type BriefingMiss, type GoalKind, type GuestOfWeek, type TeamGoal } from "@/lib/team-week-shared";

/** The briefing shows this many of the most-missed questions. */
const BRIEFING_MISSES = 3;
/** A question is only shown once this many different people have missed it. */
const MIN_PEOPLE = 2;
/** Answers read for the briefing; a big team's week is well under this. */
const ANSWER_READ_LIMIT = 10000;
const LINE_MAX = 220;

/** A target to start from: roughly what a steady week looks like per person. */
const PER_PERSON: Record<GoalKind, number> = {
  correct_answers: 20,
  training_days: 3,
  live_guest_passes: 1,
  rush_shifts: 2,
};

export function isGoalKind(value: unknown): value is GoalKind {
  return typeof value === "string" && (GOAL_KINDS as readonly string[]).includes(value);
}

function parseDay(day: string): number {
  const [y, m, d] = day.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function formatDay(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function addDays(day: string, days: number): string {
  return formatDay(parseDay(day) + days * 86_400_000);
}

/** The Monday of the week a Sydney date falls in. */
export function weekStartOf(day: string): string {
  const weekday = new Date(parseDay(day)).getUTCDay();
  return addDays(day, -((weekday + 6) % 7));
}

/** Sydney's offset from UTC in minutes at a moment: 600 or 660. */
function sydneyOffsetMinutes(at: Date): number {
  const name = new Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Sydney", timeZoneName: "longOffset" })
    .formatToParts(at)
    .find((p) => p.type === "timeZoneName")?.value;
  const match = name ? /GMT([+-])(\d{2}):?(\d{2})?/.exec(name) : null;
  if (!match) return 600;
  return (match[1] === "-" ? -1 : 1) * (Number(match[2]) * 60 + Number(match[3] ?? 0));
}

/** The moment a Sydney day starts, as an ISO timestamp. */
export function sydneyMidnight(day: string): string {
  const utcMidnight = parseDay(day);
  return new Date(utcMidnight - sydneyOffsetMinutes(new Date(utcMidnight)) * 60_000).toISOString();
}

export function suggestedTargets(teamSize: number): Record<GoalKind, number> {
  const people = Math.max(1, teamSize);
  const target = (kind: GoalKind) => {
    const raw = PER_PERSON[kind] * people;
    // Round numbers read better on a whiteboard: 85, not 84.
    return raw >= 10 ? Math.round(raw / 5) * 5 : raw;
  };
  return { correct_answers: target("correct_answers"), training_days: target("training_days"), live_guest_passes: target("live_guest_passes"), rush_shifts: target("rush_shifts") };
}

/** The right answer, in words. */
export function correctAnswerText(q: Question): string {
  switch (q.format) {
    case "true_false":
      return q.answer === "true" ? "True" : "False";
    case "order_steps":
      return q.steps.map((s) => s.text).join(", then ");
    case "number":
      return `${q.answer}${q.unit ? ` ${q.unit}` : ""}`;
    default:
      return q.options.find((o) => o.id === q.answer)?.text ?? "";
  }
}

/** One line to say: the explanation's first sentence. */
export function oneLine(explanation: string): string {
  const first = explanation.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? explanation;
  return first.length <= LINE_MAX ? first : `${first.slice(0, LINE_MAX - 3).trimEnd()}...`;
}

export type AnswerRow = { user_id: string; module_id: number; question_id: string; correct: boolean };

/** The most-missed questions, by how many different people missed them, then how often. Two people at least. */
export function mostMissed(rows: AnswerRow[], limit = BRIEFING_MISSES): { moduleId: number; questionId: string; people: number; misses: number }[] {
  const byQuestion = new Map<string, { moduleId: number; questionId: string; people: Set<string>; misses: number }>();
  for (const r of rows) {
    if (r.correct) continue;
    const key = `${r.module_id}:${r.question_id}`;
    const entry = byQuestion.get(key) ?? { moduleId: r.module_id, questionId: r.question_id, people: new Set<string>(), misses: 0 };
    entry.people.add(r.user_id);
    entry.misses += 1;
    byQuestion.set(key, entry);
  }
  return [...byQuestion.values()]
    .filter((e) => e.people.size >= MIN_PEOPLE)
    .sort((a, b) => b.people.size - a.people.size || b.misses - a.misses)
    .slice(0, limit)
    .map((e) => ({ moduleId: e.moduleId, questionId: e.questionId, people: e.people.size, misses: e.misses }));
}

/** Records one quiz or drill answer. Never stops the answer: a failure is only logged. */
export async function logAnswer(
  admin: SupabaseClient,
  row: { userId: string; moduleId: number; questionId: string; correct: boolean; source: "quiz" | "drill" },
): Promise<void> {
  const { error } = await admin.from("quiz_answer_log").insert({
    user_id: row.userId,
    module_id: row.moduleId,
    question_id: row.questionId.slice(0, 100),
    correct: row.correct,
    source: row.source,
  });
  if (error) console.error("quiz_answer_log insert failed:", error.message);
}

/** The team: the venue's staff with an account, not marked inactive. */
export async function teamUserIds(admin: SupabaseClient, venueId: string): Promise<string[]> {
  const { data, error } = await admin.from("venue_staff").select("staff_user_id, status").eq("venue_id", venueId).not("staff_user_id", "is", null);
  if (error) throw error;
  const ids = (data ?? []).filter((r) => r.status !== "inactive").map((r) => r.staff_user_id as string);
  return [...new Set(ids)];
}

/** A count, or 0 if the table isn't there yet (a migration not run). */
async function count(query: PromiseLike<{ count: number | null; error: { code?: string; message?: string } | null }>): Promise<number> {
  const { count: n, error } = await query;
  if (error) {
    console.error("team-week count failed:", error.message);
    return 0;
  }
  return n ?? 0;
}

/** How far the team has got towards a goal since `fromDay` (a Sydney date). */
async function goalProgress(admin: SupabaseClient, kind: GoalKind, userIds: string[], fromDay: string): Promise<number> {
  if (userIds.length === 0) return 0;
  const since = sydneyMidnight(fromDay);
  switch (kind) {
    case "correct_answers":
      return count(admin.from("quiz_answer_log").select("id", { count: "exact", head: true }).in("user_id", userIds).eq("correct", true).gte("answered_at", since));
    case "training_days":
      return count(admin.from("training_activity_daily").select("day", { count: "exact", head: true }).in("user_id", userIds).gte("day", fromDay));
    case "live_guest_passes":
      return count(
        admin.from("live_guest_sessions").select("id", { count: "exact", head: true }).in("user_id", userIds).gte("created_at", since).eq("result->>passed", "true"),
      );
    case "rush_shifts":
      return count(admin.from("rush_runs").select("id", { count: "exact", head: true }).in("user_id", userIds).gte("created_at", since));
  }
}

/** The guest of the week, and how many of the team have talked to and sorted them. */
export async function guestOfWeek(admin: SupabaseClient, guestId: string | null, userIds: string[], fromDay: string): Promise<GuestOfWeek | null> {
  const brief = guestId ? findGuest(guestId) : undefined;
  if (!brief) return null;
  let tried = 0;
  let sorted = 0;
  if (userIds.length > 0) {
    const { data, error } = await admin
      .from("live_guest_sessions")
      .select("user_id, passed:result->passed")
      .eq("guest_id", brief.id)
      .in("user_id", userIds)
      .neq("status", "active")
      .gte("created_at", sydneyMidnight(fromDay));
    if (error) throw error;
    const rows = (data ?? []) as unknown as { user_id: string; passed: unknown }[];
    tried = new Set(rows.map((r) => r.user_id)).size;
    sorted = new Set(rows.filter((r) => r.passed === true).map((r) => r.user_id)).size;
  }
  return { id: brief.id, title: brief.title, setting: brief.setting, sorted, tried };
}

type WeekRow = { goal_kind: string | null; goal_target: number | null; guest_id: string | null };

/** This week's row for a venue, or null when nothing's set (or the migration isn't run). */
export async function loadWeekRow(admin: SupabaseClient, venueId: string, weekStart: string): Promise<WeekRow | null> {
  const { data, error } = await admin.from("venue_weeks").select("goal_kind, goal_target, guest_id").eq("venue_id", venueId).eq("week_start", weekStart).maybeSingle();
  if (error) {
    console.error("venue_weeks read failed:", error.message);
    return null;
  }
  return (data as WeekRow | null) ?? null;
}

export async function teamGoal(admin: SupabaseClient, row: WeekRow | null, userIds: string[], weekStart: string): Promise<TeamGoal | null> {
  if (!row || !isGoalKind(row.goal_kind) || !row.goal_target) return null;
  return { kind: row.goal_kind, target: row.goal_target, progress: await goalProgress(admin, row.goal_kind, userIds, weekStart) };
}

/** The question behind a log row, for the briefing. Venue questions must belong to this venue. */
async function questionFor(admin: SupabaseClient, venueId: string, moduleId: number, questionId: string): Promise<Question | null> {
  if (moduleId !== VENUE_MODULE_ID) return findQuestion(moduleId, questionId);
  const { data, error } = await admin.from("venue_content_questions").select("id, item_id, question").eq("id", questionId).eq("venue_id", venueId).maybeSingle();
  if (error || !data) return null;
  const stored = readStoredQuestion(data.question);
  return stored ? asBankQuestion(data.id as string, data.item_id as string, stored) : null;
}

/** The briefing card: the last seven days, team totals only. */
export async function briefing(admin: SupabaseClient, venueId: string, userIds: string[], today: string = sydneyToday()): Promise<Briefing> {
  const from = addDays(today, -6);
  const empty: Briefing = { from, to: today, daysTrained: 0, answered: 0, correct: 0, guestTalks: 0, guestPasses: 0, rushShifts: 0, missed: [] };
  if (userIds.length === 0) return empty;
  const since = sydneyMidnight(from);

  const [days, answers, talks, passes, rush] = await Promise.all([
    count(admin.from("training_activity_daily").select("day", { count: "exact", head: true }).in("user_id", userIds).gte("day", from)),
    admin.from("quiz_answer_log").select("user_id, module_id, question_id, correct").in("user_id", userIds).gte("answered_at", since).limit(ANSWER_READ_LIMIT),
    count(admin.from("live_guest_sessions").select("id", { count: "exact", head: true }).in("user_id", userIds).neq("status", "active").gte("created_at", since)),
    count(admin.from("live_guest_sessions").select("id", { count: "exact", head: true }).in("user_id", userIds).gte("created_at", since).eq("result->>passed", "true")),
    count(admin.from("rush_runs").select("id", { count: "exact", head: true }).in("user_id", userIds).gte("created_at", since)),
  ]);
  const rows = answers.error ? [] : ((answers.data ?? []) as AnswerRow[]);
  if (answers.error) console.error("quiz_answer_log read failed:", answers.error.message);

  const top = mostMissed(rows);
  const moduleIds = [...new Set(top.map((t) => t.moduleId).filter((id) => id !== VENUE_MODULE_ID))];
  const titles = new Map<number, string>();
  if (moduleIds.length > 0) {
    const { data } = await admin.from("modules").select("id, title").in("id", moduleIds);
    for (const m of data ?? []) titles.set(m.id as number, m.title as string);
  }
  const missed: BriefingMiss[] = [];
  for (const t of top) {
    const q = await questionFor(admin, venueId, t.moduleId, t.questionId);
    if (!q) continue;
    missed.push({
      moduleTitle: t.moduleId === VENUE_MODULE_ID ? "Your venue" : (titles.get(t.moduleId) ?? `Module ${t.moduleId}`),
      prompt: q.prompt,
      answer: correctAnswerText(q),
      line: oneLine(q.explanation),
      people: t.people,
    });
  }

  return {
    from,
    to: today,
    daysTrained: days,
    answered: rows.length,
    correct: rows.filter((r) => r.correct).length,
    guestTalks: talks,
    guestPasses: passes,
    rushShifts: rush,
    missed,
  };
}
