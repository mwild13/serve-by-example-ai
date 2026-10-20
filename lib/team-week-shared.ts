// Team features (Rich update, Phase 16): what the browser and the server
// share. The goal, the guest of the week and the briefing card are worked
// out in lib/team-week.ts.

export const GOAL_KINDS = ["correct_answers", "training_days", "live_guest_passes", "rush_shifts"] as const;
export type GoalKind = (typeof GOAL_KINDS)[number];

/** "300 correct answers between us". */
export const GOAL_LABEL: Record<GoalKind, { many: string; one: string; hint: string }> = {
  correct_answers: { many: "correct answers", one: "correct answer", hint: "Right answers in module quizzes and drills" },
  training_days: { many: "days trained", one: "day trained", hint: "Each person, each day they do any training" },
  live_guest_passes: { many: "Live Guest passes", one: "Live Guest pass", hint: "Conversations passed, 75 or more" },
  rush_shifts: { many: "Saturday Rush shifts", one: "Saturday Rush shift", hint: "Shifts finished in Saturday Rush" },
};

export type TeamGoal = { kind: GoalKind; target: number; progress: number };

export type GuestOfWeek = {
  id: string;
  title: string;
  setting: string;
  /** People in the team who've passed this guest this week. */
  sorted: number;
  /** People in the team who've talked to them this week. */
  tried: number;
};

/** What staff see on Home: the venue's week. */
export type TeamWeek = {
  venueName: string;
  /** The Monday, "2026-10-19". */
  weekStart: string;
  teamSize: number;
  goal: TeamGoal | null;
  guest: GuestOfWeek | null;
};

export type BriefingMiss = {
  moduleTitle: string;
  prompt: string;
  answer: string;
  /** One line to say about it, from the question's explanation. */
  line: string;
  /** Different people who missed it. Always 2 or more. */
  people: number;
};

/** The manager's one-page briefing: the last seven days, team totals only. */
export type Briefing = {
  /** The first of the seven days, "2026-10-14". */
  from: string;
  to: string;
  daysTrained: number;
  answered: number;
  correct: number;
  guestTalks: number;
  guestPasses: number;
  rushShifts: number;
  missed: BriefingMiss[];
};

/** A guest the manager can pick for the week. */
export type GuestOption = { id: string; title: string; level: 1 | 2 | 3; area: "technical" | "service" | "compliance" };

/** What the manager sees and sets. */
export type ManagerWeek = TeamWeek & {
  briefing: Briefing;
  /** A target to start from, for each kind of goal, from the team's size. */
  suggested: Record<GoalKind, number>;
};

/** "Week of 19 October". */
export function weekLabel(weekStart: string): string {
  const [y, m, d] = weekStart.split("-").map(Number);
  return `Week of ${new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-AU", { day: "numeric", month: "long", timeZone: "UTC" })}`;
}
