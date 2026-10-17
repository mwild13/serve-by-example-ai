import { describe, expect, it } from "vitest";
import { addDays, dueSends, sendFor, sydneyTime } from "./schedule";

describe("sydneyTime", () => {
  it("reads the Sydney date, weekday and hour in daylight saving (AEDT, UTC+11)", () => {
    // Sunday 2026-10-18 21:30 UTC is Monday 08:30 in Sydney.
    expect(sydneyTime(new Date("2026-10-18T21:30:00Z"))).toEqual({ date: "2026-10-19", weekday: 1, hour: 8 });
  });

  it("reads standard time (AEST, UTC+10)", () => {
    // Sunday 2026-06-14 22:00 UTC is Monday 08:00 in Sydney.
    expect(sydneyTime(new Date("2026-06-14T22:00:00Z"))).toEqual({ date: "2026-06-15", weekday: 1, hour: 8 });
  });

  it("gives midnight as hour 0, not 24", () => {
    expect(sydneyTime(new Date("2026-10-18T13:00:00Z")).hour).toBe(0);
  });
});

describe("addDays", () => {
  it("crosses month and year ends", () => {
    expect(addDays("2026-10-19", -7)).toBe("2026-10-12");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });
});

describe("sendFor", () => {
  it("covers the Monday-to-Sunday before a digest", () => {
    expect(sendFor("weekly_digest", "2026-10-19")).toEqual({
      kind: "weekly_digest", period: "2026-10-19", from: "2026-10-12", to: "2026-10-18",
    });
  });

  it("covers the seven days up to and including a reminder's Sunday", () => {
    expect(sendFor("sunday_reminder", "2026-10-18")).toEqual({
      kind: "sunday_reminder", period: "2026-10-18", from: "2026-10-12", to: "2026-10-18",
    });
  });
});

describe("dueSends", () => {
  it("sends the digest from 7am Monday Sydney time", () => {
    expect(dueSends(new Date("2026-10-18T19:59:00Z"))).toEqual([]); // Mon 06:59
    expect(dueSends(new Date("2026-10-18T20:00:00Z")).map((s) => s.kind)).toEqual(["weekly_digest"]); // Mon 07:00
  });

  it("stops the digest at noon Monday", () => {
    expect(dueSends(new Date("2026-10-19T00:59:00Z")).map((s) => s.kind)).toEqual(["weekly_digest"]); // Mon 11:59
    expect(dueSends(new Date("2026-10-19T01:00:00Z"))).toEqual([]); // Mon 12:00
  });

  it("sends the reminder from 6pm to 10pm Sunday", () => {
    expect(dueSends(new Date("2026-10-18T06:59:00Z"))).toEqual([]); // Sun 17:59
    expect(dueSends(new Date("2026-10-18T07:00:00Z"))).toEqual([sendFor("sunday_reminder", "2026-10-18")]); // Sun 18:00
    expect(dueSends(new Date("2026-10-18T10:59:00Z")).map((s) => s.kind)).toEqual(["sunday_reminder"]); // Sun 21:59
    expect(dueSends(new Date("2026-10-18T11:00:00Z"))).toEqual([]); // Sun 22:00
  });

  it("keeps the Sydney hours in standard time too", () => {
    expect(dueSends(new Date("2026-06-14T21:00:00Z")).map((s) => s.kind)).toEqual(["weekly_digest"]); // Mon 07:00 AEST
    expect(dueSends(new Date("2026-06-14T08:00:00Z")).map((s) => s.kind)).toEqual(["sunday_reminder"]); // Sun 18:00 AEST
  });

  it("has nothing due mid-week", () => {
    expect(dueSends(new Date("2026-10-16T22:00:00Z"))).toEqual([]); // Sat 09:00
  });

  it("falls entirely inside the cron's Sunday and Monday UTC schedule", () => {
    // Every quarter hour across a week: anything due must land on a UTC
    // Sunday (0) or Monday (1), or the cron would never call the route then.
    for (const start of ["2026-10-12T00:00:00Z", "2026-06-08T00:00:00Z"]) {
      for (let m = 0; m < 7 * 24 * 60; m += 15) {
        const at = new Date(Date.parse(start) + m * 60_000);
        if (dueSends(at).length > 0) expect([0, 1]).toContain(at.getUTCDay());
      }
    }
  });
});
