// The one step Today offers, and a second choice beside it
// (docs/STAFF_APP.md section 8). Pure, so the order of
// the rules is tested in lib/next-step.test.ts.

/** A module as /api/training/modules returns it (lib/module-navigator.ts). */
export type StepModule = {
  id: number;
  title: string;
  category: string;
  difficulty_level: number;
  /** 100 once the module quiz is passed. */
  mastery_pct: number;
  /** 100 once the person has started it at all, else 0. */
  completion_pct: number;
  recommended: boolean;
  recommendation_reason?: string;
};

export type NextStepInput = {
  /** False on the free plan: modules and drills are locked. */
  hasModuleAccess: boolean;
  modules: StepModule[];
  /** The shift streak, or null when it couldn't be loaded. */
  streak: { doneToday: boolean; shiftDays: number[] } | null;
  /** Today in Sydney, 0 Sunday to 6 Saturday. */
  weekday: number;
  /** Mastered modules due for review. */
  reviewDue: number;
  /** Venue plans and sponsored staff (hasLiveGuest()). */
  liveGuestOpen: boolean;
};

export type NextStep =
  | { kind: "challenge" }
  | { kind: "first-module"; module: StepModule }
  | { kind: "preshift" }
  | { kind: "continue-module"; module: StepModule }
  | { kind: "review" }
  | { kind: "next-module"; module: StepModule }
  | { kind: "live-guest" }
  | { kind: "drill" };

/** The mixed drill needs this many started modules (lib/drill.ts). */
export const DRILL_MIN_STARTED = 3;
/** Live Guest is offered as the step once this many modules are mastered. */
const LIVE_GUEST_AFTER = 5;

export function isMastered(module: StepModule): boolean {
  return module.mastery_pct >= 100;
}

export function isStarted(module: StepModule): boolean {
  return module.completion_pct > 0;
}

export function isShiftDay(shiftDays: number[], weekday: number): boolean {
  return shiftDays.length === 0 || shiftDays.includes(weekday);
}

/** The next module to begin: the navigator's recommendation, else the most foundational. */
function nextNewModule(modules: StepModule[]): StepModule | null {
  const fresh = modules.filter((m) => !isStarted(m) && !isMastered(m));
  const recommended = fresh.find((m) => m.recommended);
  if (recommended) return recommended;
  return [...fresh].sort((a, b) => a.difficulty_level - b.difficulty_level || a.id - b.id)[0] ?? null;
}

/** The module the person is part way through, recommended first. */
function moduleInProgress(modules: StepModule[]): StepModule | null {
  const going = modules.filter((m) => isStarted(m) && !isMastered(m));
  return going.find((m) => m.recommended) ?? going[0] ?? null;
}

/** Every step that applies today, best first. */
function candidateSteps(input: NextStepInput): NextStep[] {
  if (!input.hasModuleAccess) return [{ kind: "challenge" }];

  const started = input.modules.filter(isStarted);
  const next = nextNewModule(input.modules);
  if (started.length === 0) return next ? [{ kind: "first-module", module: next }] : [{ kind: "challenge" }];

  const steps: NextStep[] = [];
  if (input.streak && !input.streak.doneToday && isShiftDay(input.streak.shiftDays, input.weekday)) {
    steps.push({ kind: "preshift" });
  }
  const going = moduleInProgress(input.modules);
  if (going) steps.push({ kind: "continue-module", module: going });
  if (input.reviewDue > 0 && started.length >= DRILL_MIN_STARTED) steps.push({ kind: "review" });
  if (input.liveGuestOpen && input.modules.filter(isMastered).length >= LIVE_GUEST_AFTER) {
    steps.push({ kind: "live-guest" });
  }
  if (next) steps.push({ kind: "next-module", module: next });
  if (started.length >= DRILL_MIN_STARTED) steps.push({ kind: "drill" });
  if (steps.length === 0) steps.push(input.liveGuestOpen ? { kind: "live-guest" } : { kind: "challenge" });
  return steps;
}

/** The step to lead with, and a second choice of a different kind (or null). */
export function pickNextSteps(input: NextStepInput): [NextStep, NextStep | null] {
  const steps = candidateSteps(input);
  const first = steps[0];
  // A review and a drill both open the mixed drill, so one can't be the other's alternative.
  const drillish = (s: NextStep) => s.kind === "review" || s.kind === "drill";
  const second = steps.find((s) => s.kind !== first.kind && !(drillish(s) && drillish(first))) ?? null;
  return [first, second];
}

/** 0 Sunday to 6 Saturday, in Sydney, for a moment in time. */
export function sydneyWeekday(at: Date): number {
  const short = new Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Sydney", weekday: "short" }).format(at);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(short.slice(0, 3));
}
