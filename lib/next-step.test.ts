import { describe, expect, it } from "vitest";
import { pickNextSteps, sydneyWeekday, type NextStepInput, type StepModule } from "./next-step";

function mod(id: number, over: Partial<StepModule> = {}): StepModule {
  return {
    id,
    title: `Module ${id}`,
    category: "technical",
    difficulty_level: 1,
    mastery_pct: 0,
    completion_pct: 0,
    recommended: false,
    ...over,
  };
}

const started = (id: number, over: Partial<StepModule> = {}) => mod(id, { completion_pct: 100, ...over });
const mastered = (id: number) => mod(id, { completion_pct: 100, mastery_pct: 100 });

function input(over: Partial<NextStepInput> = {}): NextStepInput {
  return {
    hasModuleAccess: true,
    modules: [mod(1), mod(2), mod(3)],
    streak: { doneToday: false, shiftDays: [] },
    weekday: 5,
    reviewDue: 0,
    liveGuestOpen: true,
    ...over,
  };
}

describe("pickNextSteps", () => {
  it("offers a challenge on the free plan", () => {
    expect(pickNextSteps(input({ hasModuleAccess: false }))).toEqual([{ kind: "challenge" }, null]);
  });

  it("offers the recommended module on the first day, and nothing else", () => {
    const [first, second] = pickNextSteps(input({ modules: [mod(1), mod(7, { recommended: true })] }));
    expect(first).toEqual({ kind: "first-module", module: expect.objectContaining({ id: 7 }) });
    expect(second).toBeNull();
  });

  it("falls back to the most foundational module when nothing is recommended", () => {
    const [first] = pickNextSteps(input({ modules: [mod(4, { difficulty_level: 3 }), mod(9, { difficulty_level: 1 })] }));
    expect(first).toMatchObject({ kind: "first-module", module: { id: 9 } });
  });

  it("leads with the pre-shift drill on a shift day, with the module in progress beside it", () => {
    const [first, second] = pickNextSteps(input({ modules: [started(1), mod(2)], weekday: 5, streak: { doneToday: false, shiftDays: [5, 6] } }));
    expect(first).toEqual({ kind: "preshift" });
    expect(second).toMatchObject({ kind: "continue-module", module: { id: 1 } });
  });

  it("skips the pre-shift drill on a day off", () => {
    const [first] = pickNextSteps(input({ modules: [started(1)], weekday: 2, streak: { doneToday: false, shiftDays: [5, 6] } }));
    expect(first).toMatchObject({ kind: "continue-module" });
  });

  it("skips the pre-shift drill once it's done today", () => {
    const [first] = pickNextSteps(input({ modules: [started(1)], streak: { doneToday: true, shiftDays: [] } }));
    expect(first).toMatchObject({ kind: "continue-module" });
  });

  it("skips the pre-shift drill when the streak couldn't load", () => {
    const [first] = pickNextSteps(input({ modules: [started(1)], streak: null }));
    expect(first).toMatchObject({ kind: "continue-module" });
  });

  it("offers a review once three modules are started and reviews are due", () => {
    const modules = [mastered(1), mastered(2), mastered(3), mod(4)];
    const [first, second] = pickNextSteps(input({ modules, reviewDue: 2, streak: { doneToday: true, shiftDays: [] } }));
    expect(first).toEqual({ kind: "review" });
    expect(second).toMatchObject({ kind: "next-module", module: { id: 4 } });
  });

  it("never pairs a review with a drill", () => {
    const modules = [mastered(1), mastered(2), mastered(3)];
    const [first, second] = pickNextSteps(input({ modules, reviewDue: 1, liveGuestOpen: false, streak: { doneToday: true, shiftDays: [] } }));
    expect(first).toEqual({ kind: "review" });
    expect(second).toBeNull();
  });

  it("offers Live Guest after five modules are mastered, on a venue plan", () => {
    const modules = [1, 2, 3, 4, 5].map(mastered).concat(mod(6));
    const [first] = pickNextSteps(input({ modules, streak: { doneToday: true, shiftDays: [] } }));
    expect(first).toEqual({ kind: "live-guest" });
  });

  it("doesn't offer Live Guest off a venue plan", () => {
    const modules = [1, 2, 3, 4, 5].map(mastered).concat(mod(6));
    const [first, second] = pickNextSteps(input({ modules, liveGuestOpen: false, streak: { doneToday: true, shiftDays: [] } }));
    expect(first).toMatchObject({ kind: "next-module", module: { id: 6 } });
    expect(second).toEqual({ kind: "drill" });
  });

  it("offers a drill when every module is mastered and Live Guest is closed", () => {
    const modules = [1, 2, 3].map(mastered);
    const [first] = pickNextSteps(input({ modules, liveGuestOpen: false, streak: { doneToday: true, shiftDays: [] } }));
    expect(first).toEqual({ kind: "drill" });
  });
});

describe("sydneyWeekday", () => {
  it("uses Sydney's date, not UTC's", () => {
    // 2026-10-20 15:00 UTC is Wednesday 21 October, 2am in Sydney.
    expect(sydneyWeekday(new Date("2026-10-20T15:00:00Z"))).toBe(3);
  });
});
