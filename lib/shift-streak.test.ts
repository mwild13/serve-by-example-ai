import { describe, expect, it } from "vitest";
import { FREEZES, cleanReminderTime, cleanShiftDays, computeShiftStreak, reminderTimeText, shiftDaysText } from "./shift-streak";

// 2026-10-16 is a Friday.
const FRI_SAT_SUN = [5, 6, 0];

describe("computeShiftStreak", () => {
  it("is 0 with nothing done", () => {
    expect(computeShiftStreak(FRI_SAT_SUN, [], "2026-10-20")).toEqual({ count: 0, freezesLeft: FREEZES, doneToday: false, shiftDays: FRI_SAT_SUN, weekDone: [] });
  });

  it("lets a Friday to Sunday casual keep a streak across the week", () => {
    const days = ["2026-10-09", "2026-10-10", "2026-10-11", "2026-10-16", "2026-10-17", "2026-10-18"];
    const streak = computeShiftStreak(FRI_SAT_SUN, days, "2026-10-22");
    expect(streak.count).toBe(6);
    expect(streak.freezesLeft).toBe(FREEZES);
  });

  it("uses a freeze for a missed shift, and holds the streak", () => {
    // Missed Saturday 17th.
    const streak = computeShiftStreak(FRI_SAT_SUN, ["2026-10-09", "2026-10-10", "2026-10-11", "2026-10-16", "2026-10-18"], "2026-10-19");
    expect(streak.count).toBe(5);
    expect(streak.freezesLeft).toBe(FREEZES - 1);
  });

  it("survives a missed week on one freeze, and a second missed week on the other", () => {
    // Worked the weekend of the 9th, missed the whole weekend of the 16th (three shifts).
    const oneWeek = computeShiftStreak(FRI_SAT_SUN, ["2026-10-09", "2026-10-10", "2026-10-11"], "2026-10-20");
    expect(oneWeek).toMatchObject({ count: 3, freezesLeft: 1 });
    // Missed the weekend of the 23rd as well: the second freeze.
    const twoWeeks = computeShiftStreak(FRI_SAT_SUN, ["2026-10-09", "2026-10-10", "2026-10-11"], "2026-10-27");
    expect(twoWeeks).toMatchObject({ count: 3, freezesLeft: 0 });
    // And a third missed weekend ends it.
    const threeWeeks = computeShiftStreak(FRI_SAT_SUN, ["2026-10-09", "2026-10-10", "2026-10-11"], "2026-11-03");
    expect(threeWeeks).toMatchObject({ count: 0, freezesLeft: FREEZES });
  });

  it("never counts today as missed", () => {
    expect(computeShiftStreak([2], ["2026-10-13"], "2026-10-20")).toMatchObject({ count: 1, freezesLeft: FREEZES, doneToday: false });
    expect(computeShiftStreak([2], ["2026-10-13", "2026-10-20"], "2026-10-20")).toMatchObject({ count: 2, doneToday: true });
  });

  it("counts a drill on an extra shift, and days off never break it", () => {
    // Fri, Sat, Sun shifts plus an extra Wednesday.
    const streak = computeShiftStreak(FRI_SAT_SUN, ["2026-10-16", "2026-10-17", "2026-10-18", "2026-10-21"], "2026-10-22");
    expect(streak.count).toBe(4);
    expect(streak.freezesLeft).toBe(FREEZES);
  });

  it("earns a freeze back after five shifts kept in a row", () => {
    // Daily shifts: miss the 3rd (freeze used), then keep five in a row.
    const days = ["2026-10-01", "2026-10-02", "2026-10-04", "2026-10-05", "2026-10-06", "2026-10-07", "2026-10-08"];
    const streak = computeShiftStreak([], days, "2026-10-08");
    expect(streak.count).toBe(7);
    expect(streak.freezesLeft).toBe(FREEZES);
  });

  it("treats no shift days as every day", () => {
    // Missed the 19th to the 25th: one gap, one freeze.
    expect(computeShiftStreak([], ["2026-10-17", "2026-10-18"], "2026-10-26")).toMatchObject({ count: 2, freezesLeft: 1 });
  });

  it("ignores days after today", () => {
    expect(computeShiftStreak([], ["2026-10-25"], "2026-10-20").count).toBe(0);
  });
});

describe("shift days", () => {
  it("cleans the list", () => {
    expect(cleanShiftDays([6, 5, 0, 5])).toEqual([0, 5, 6]);
    expect(cleanShiftDays([])).toEqual([]);
    expect(cleanShiftDays([7])).toBeNull();
    expect(cleanShiftDays([1.5])).toBeNull();
    expect(cleanShiftDays("Fri")).toBeNull();
  });

  it("reads them out", () => {
    expect(shiftDaysText([0, 5, 6])).toBe("Sun, Fri and Sat");
    expect(shiftDaysText([3])).toBe("Wed");
    expect(shiftDaysText([])).toBe("every day");
  });
});

describe("reminder times", () => {
  it("accepts HH:MM or null, nothing else", () => {
    expect(cleanReminderTime("16:30")).toBe("16:30");
    expect(cleanReminderTime("07:00")).toBe("07:00");
    expect(cleanReminderTime(null)).toBeNull();
    expect(cleanReminderTime("24:00")).toBeUndefined();
    expect(cleanReminderTime("4:30pm")).toBeUndefined();
    expect(cleanReminderTime(1630)).toBeUndefined();
  });

  it("reads them the Australian way", () => {
    expect(reminderTimeText("16:30")).toBe("4:30pm");
    expect(reminderTimeText("07:00")).toBe("7am");
    expect(reminderTimeText("12:00")).toBe("12pm");
    expect(reminderTimeText("00:30")).toBe("12:30am");
  });
});

describe("weekDone", () => {
  // 2026-10-21 is a Wednesday; its week runs Monday 19 to Sunday 25.
  it("lists this week's drilled weekdays, Monday on", () => {
    const streak = computeShiftStreak([], ["2026-10-17", "2026-10-19", "2026-10-21"], "2026-10-21");
    expect(streak.weekDone).toEqual([1, 3]);
  });

  it("counts Sunday as the end of the week, not the start", () => {
    const streak = computeShiftStreak([], ["2026-10-19", "2026-10-25"], "2026-10-25");
    expect(streak.weekDone).toEqual([0, 1]);
  });

  it("is empty on a Monday before the drill", () => {
    expect(computeShiftStreak([], ["2026-10-18"], "2026-10-19").weekDone).toEqual([]);
  });
});
