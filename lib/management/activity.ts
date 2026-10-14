import type { TrainingActivityDay } from "@/lib/management/types";

/** Days of training activity the manager snapshot carries, today included. */
export const ACTIVITY_DAYS = 14;

const SYDNEY_DAY = new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney" });

/** YYYY-MM-DD for a moment in Sydney time, matching training_activity_daily.day. */
export function sydneyDay(at: Date): string {
  return SYDNEY_DAY.format(at);
}

/** The last `count` Sydney dates, oldest first, ending today. Steps back by
 *  calendar date, so a daylight-saving change cannot skip or repeat a day. */
export function recentDays(count: number, now: Date = new Date()): string[] {
  const today = new Date(`${sydneyDay(now)}T00:00:00Z`);
  const days: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const day = new Date(today);
    day.setUTCDate(today.getUTCDate() - i);
    days.push(day.toISOString().slice(0, 10));
  }
  return days;
}

export type DayTotals = {
  day: string;
  /** Staff who did anything that day. */
  people: number;
  quizAnswers: number;
  scenarios: number;
  quizzesPassed: number;
};

/** Per-day totals for the given staff ids, one entry per day in `days`. */
export function totalsByDay(activity: TrainingActivityDay[], staffIds: Set<string>, days: string[]): DayTotals[] {
  const byDay = new Map<string, DayTotals & { who: Set<string> }>(
    days.map((day) => [day, { day, people: 0, quizAnswers: 0, scenarios: 0, quizzesPassed: 0, who: new Set<string>() }]),
  );
  for (const row of activity) {
    const entry = byDay.get(row.day);
    if (!entry || !staffIds.has(row.staffId)) continue;
    entry.who.add(row.staffId);
    entry.quizAnswers += row.quizAnswers;
    entry.scenarios += row.scenarios + row.aiScenarios;
    entry.quizzesPassed += row.quizzesPassed;
  }
  return days.map((day) => {
    const { who, ...totals } = byDay.get(day)!;
    return { ...totals, people: who.size };
  });
}

/** Distinct staff who trained on any of the given days. */
export function peopleOn(activity: TrainingActivityDay[], staffIds: Set<string>, days: string[]): number {
  const wanted = new Set(days);
  const who = new Set<string>();
  for (const row of activity) if (wanted.has(row.day) && staffIds.has(row.staffId)) who.add(row.staffId);
  return who.size;
}
