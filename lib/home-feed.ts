import { isMastered, isShiftDay, isStarted, type NextStep, type StepModule } from "@/lib/next-step";

// What leads mobile Home, and where each step goes
// (docs/STAFF_MOBILE_REDESIGN_PLAN.md section 3). The step itself is the
// staff desktop's (pickNextSteps() in lib/next-step.ts), so both surfaces
// always offer the same next thing. Pure, so tested in lib/home-feed.test.ts.

export type HomeHero =
  /** The next step, on the stack card. */
  | { kind: "step"; step: NextStep }
  /** Today's pre-shift drill is done on a shift day: celebrate, then offer the next step. */
  | { kind: "ready"; next: NextStep | null };

export function homeHero(input: {
  hasModuleAccess: boolean;
  streak: { doneToday: boolean; shiftDays: number[] } | null;
  weekday: number;
  step: NextStep;
  alt: NextStep | null;
}): HomeHero {
  const { hasModuleAccess, streak, weekday, step, alt } = input;
  if (hasModuleAccess && streak?.doneToday && isShiftDay(streak.shiftDays, weekday)) {
    return { kind: "ready", next: step.kind === "preshift" ? alt : step };
  }
  return { kind: "step", step };
}

export function moduleHref(module: { id: number; title: string }): string {
  return `/mobile/quiz?moduleId=${module.id}&moduleTitle=${encodeURIComponent(module.title)}`;
}

/** Where a step opens on mobile. */
export function stepHref(step: NextStep): string {
  switch (step.kind) {
    case "challenge":
      return "/mobile/challenges";
    case "first-module":
    case "continue-module":
    case "next-module":
      return moduleHref(step.module);
    case "preshift":
      return "/mobile/drill?mode=preshift";
    case "review":
    case "drill":
      return "/mobile/drill";
    case "live-guest":
      return "/mobile/live-guest";
  }
}

/**
 * The module for "Keep going": one the person is part way through, the
 * navigator's pick first, and never the one already on the hero card.
 */
export function keepGoingModule(modules: StepModule[], heroStep: NextStep | null): StepModule | null {
  const onHero = heroStep && "module" in heroStep ? heroStep.module.id : null;
  const going = modules.filter((m) => isStarted(m) && !isMastered(m) && m.id !== onHero);
  return going.find((m) => m.recommended) ?? going[0] ?? null;
}

/** The greeting and date at the top of Home, in Sydney time. */
export function homeClock(at: Date): { greeting: string; date: string; weekday: number } {
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Sydney",
    hour: "numeric",
    hourCycle: "h23",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).formatToParts(at);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const hour = Number(get("hour"));
  const weekdayName = get("weekday");
  return {
    greeting: hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening",
    date: `${weekdayName} ${get("day")} ${get("month")}`,
    weekday: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(weekdayName),
  };
}
