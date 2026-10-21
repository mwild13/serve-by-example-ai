import { describe, expect, it } from "vitest";
import { homeClock, homeHero, keepGoingModule, stepHref } from "./home-feed";
import type { NextStep, StepModule } from "./next-step";

function mod(id: number, opts: Partial<StepModule> = {}): StepModule {
  return {
    id,
    title: `Module ${id}`,
    category: "technical",
    difficulty_level: 1,
    mastery_pct: 0,
    completion_pct: 0,
    recommended: false,
    ...opts,
  };
}

const PRESHIFT: NextStep = { kind: "preshift" };
const DRILL: NextStep = { kind: "drill" };
const FRI_SAT = [5, 6];

describe("homeHero", () => {
  it("leads with the step while today's drill isn't done", () => {
    const streak = { doneToday: false, shiftDays: FRI_SAT };
    expect(homeHero({ hasModuleAccess: true, streak, weekday: 5, step: PRESHIFT, alt: DRILL })).toEqual({ kind: "step", step: PRESHIFT });
  });

  it("celebrates a finished drill on a shift day and offers the next thing", () => {
    const streak = { doneToday: true, shiftDays: FRI_SAT };
    expect(homeHero({ hasModuleAccess: true, streak, weekday: 5, step: DRILL, alt: null })).toEqual({ kind: "ready", next: DRILL });
  });

  it("never offers the drill that's already done as the next thing", () => {
    const streak = { doneToday: true, shiftDays: FRI_SAT };
    expect(homeHero({ hasModuleAccess: true, streak, weekday: 5, step: PRESHIFT, alt: DRILL })).toEqual({ kind: "ready", next: DRILL });
  });

  it("doesn't celebrate on a day off", () => {
    const streak = { doneToday: true, shiftDays: FRI_SAT };
    expect(homeHero({ hasModuleAccess: true, streak, weekday: 2, step: DRILL, alt: null }).kind).toBe("step");
  });

  it("treats no chosen days as every day", () => {
    const streak = { doneToday: true, shiftDays: [] };
    expect(homeHero({ hasModuleAccess: true, streak, weekday: 2, step: DRILL, alt: null }).kind).toBe("ready");
  });

  it("doesn't celebrate without module access or a streak", () => {
    const step: NextStep = { kind: "challenge" };
    expect(homeHero({ hasModuleAccess: false, streak: { doneToday: true, shiftDays: [] }, weekday: 2, step, alt: null }).kind).toBe("step");
    expect(homeHero({ hasModuleAccess: true, streak: null, weekday: 2, step, alt: null }).kind).toBe("step");
  });
});

describe("stepHref", () => {
  it("opens each step on its mobile screen", () => {
    expect(stepHref({ kind: "challenge" })).toBe("/mobile/challenges");
    expect(stepHref(PRESHIFT)).toBe("/mobile/drill?mode=preshift");
    expect(stepHref({ kind: "review" })).toBe("/mobile/drill");
    expect(stepHref(DRILL)).toBe("/mobile/drill");
    expect(stepHref({ kind: "live-guest" })).toBe("/mobile/live-guest");
  });

  it("opens a module's quiz with its title", () => {
    const wine = mod(7, { title: "Wine & Food" });
    expect(stepHref({ kind: "continue-module", module: wine })).toBe("/mobile/quiz?moduleId=7&moduleTitle=Wine%20%26%20Food");
  });
});

describe("keepGoingModule", () => {
  const started = { completion_pct: 100 };

  it("picks a module part way through, the recommended one first", () => {
    const modules = [mod(1, started), mod(2, { ...started, recommended: true }), mod(3)];
    expect(keepGoingModule(modules, DRILL)?.id).toBe(2);
  });

  it("skips mastered and untouched modules", () => {
    const modules = [mod(1, { ...started, mastery_pct: 100 }), mod(2)];
    expect(keepGoingModule(modules, DRILL)).toBeNull();
  });

  it("never repeats the module already on the hero card", () => {
    const modules = [mod(1, started), mod(2, started)];
    expect(keepGoingModule(modules, { kind: "continue-module", module: modules[0] })?.id).toBe(2);
  });
});

describe("homeClock", () => {
  it("reads Sydney time, not the phone's", () => {
    // 07:30 UTC on Wednesday 21 October 2026 is 6:30pm in Sydney (AEDT).
    expect(homeClock(new Date("2026-10-21T07:30:00Z"))).toEqual({ greeting: "Evening", date: "Wednesday 21 October", weekday: 3 });
  });

  it("says morning before noon and afternoon until five", () => {
    expect(homeClock(new Date("2026-10-20T22:00:00Z")).greeting).toBe("Morning");
    expect(homeClock(new Date("2026-10-21T03:00:00Z")).greeting).toBe("Afternoon");
  });
});
