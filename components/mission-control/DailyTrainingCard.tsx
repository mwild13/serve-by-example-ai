"use client";

import type { ManagementSnapshot, TrainingActivityDay } from "@/lib/management/types";
import { ACTIVITY_DAYS, peopleOn, recentDays, totalsByDay } from "@/lib/management/activity";

// "Daily training" on the Overview tab (2026-10-14): how many staff trained on
// each of the last 14 days, from training_activity_daily. Until that table
// existed only each person's last-active date was stored, so there was no
// trend to show. The bars count people, not answers, so one keen bartender
// cannot make a quiet day look busy.

const DAY_LABEL = new Intl.DateTimeFormat("en-AU", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
const WEEKDAY_INITIAL = new Intl.DateTimeFormat("en-AU", { weekday: "narrow", timeZone: "UTC" });

function plural(count: number, one: string, many = `${one}s`) {
  return `${count} ${count === 1 ? one : many}`;
}

export function DailyTrainingCard({
  venueStaff,
  activity,
}: {
  venueStaff: ManagementSnapshot["staff"];
  activity: TrainingActivityDay[];
}) {
  const staffIds = new Set(venueStaff.map((member) => member.id));
  const days = recentDays(ACTIVITY_DAYS);
  const totals = totalsByDay(activity, staffIds, days);
  const thisWeek = days.slice(-7);
  const lastWeek = days.slice(0, 7);
  const peopleThisWeek = peopleOn(activity, staffIds, thisWeek);
  const peopleLastWeek = peopleOn(activity, staffIds, lastWeek);
  const weekTotals = totals.slice(-7).reduce(
    (sum, d) => ({ answers: sum.answers + d.quizAnswers, scenarios: sum.scenarios + d.scenarios, passed: sum.passed + d.quizzesPassed }),
    { answers: 0, scenarios: 0, passed: 0 },
  );
  const tallest = Math.max(1, ...totals.map((d) => d.people));
  const anyActivity = totals.some((d) => d.people > 0);
  const today = days[days.length - 1];

  return (
    <div className="mc-panel">
      <div className="mc-panel-head">
        <div>
          <p className="mc-panel-title">Daily training</p>
          <p className="mc-panel-desc">Staff who trained each day, last {ACTIVITY_DAYS} days</p>
        </div>
        <span className="mc-panel-count">{peopleThisWeek} this week</span>
      </div>
      <div className="mc-panel-body">
        {!anyActivity ? (
          <p className="mc-panel-empty">No training recorded in the last {ACTIVITY_DAYS} days.</p>
        ) : (
          <>
            <ol className="mc-trend" aria-label={`Staff who trained each day, last ${ACTIVITY_DAYS} days`}>
              {totals.map((d) => {
                const date = new Date(`${d.day}T00:00:00Z`);
                const label = `${d.day === today ? "Today" : DAY_LABEL.format(date)}: ${plural(d.people, "person", "people")}, ${plural(d.quizAnswers, "quiz answer")}, ${plural(d.scenarios, "scenario")}`;
                return (
                  <li key={d.day} className="mc-trend-day" aria-label={label} title={label}>
                    <span className="mc-trend-value" aria-hidden="true">{d.people > 0 ? d.people : ""}</span>
                    <span className="mc-trend-slot" aria-hidden="true">
                      <span
                        className={d.people > 0 ? "mc-trend-bar" : "mc-trend-bar mc-trend-bar-empty"}
                        style={{ height: d.people > 0 ? `${(d.people / tallest) * 100}%` : undefined }}
                      />
                    </span>
                    <span className={d.day === today ? "mc-trend-label mc-trend-label-today" : "mc-trend-label"} aria-hidden="true">
                      {WEEKDAY_INITIAL.format(date)}
                    </span>
                  </li>
                );
              })}
            </ol>
            <p className="mc-trend-summary">
              This week: {plural(weekTotals.answers, "quiz answer")}, {plural(weekTotals.scenarios, "scenario")} and{" "}
              {plural(weekTotals.passed, "module")} passed. {plural(peopleLastWeek, "person", "people")} trained the week before.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
