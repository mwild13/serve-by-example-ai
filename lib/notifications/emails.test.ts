import { describe, expect, it } from "vitest";
import { shortDate, sundayReminderEmail, weeklyDigestEmail, type NotificationStats } from "./emails";

const LINKS = {
  trainingUrl: "https://servebyexample.co/dashboard",
  unsubscribeUrl: "https://servebyexample.co/notifications/unsubscribe?u=1&k=digest&t=abc",
};

const BUSY: NotificationStats = {
  displayName: "jo smith",
  daysTrained: 4,
  quizAnswers: 37,
  quizzesPassed: 2,
  scenarios: 5,
  modulesMastered: 9,
  reviewsDue: 3,
};

const QUIET: NotificationStats = {
  displayName: null,
  daysTrained: 0,
  quizAnswers: 0,
  quizzesPassed: 0,
  scenarios: 0,
  modulesMastered: 0,
  reviewsDue: 0,
};

const RANGE = { from: "2026-10-12", to: "2026-10-18" };

describe("shortDate", () => {
  it("formats a day without shifting it by time zone", () => {
    expect(shortDate("2026-10-12")).toBe("Mon 12 Oct");
  });
});

describe("weeklyDigestEmail", () => {
  it("reports a busy week with its numbers", () => {
    const email = weeklyDigestEmail(BUSY, RANGE, LINKS);
    expect(email.subject).toBe("Your week in training: 4 days, 2 modules passed");
    expect(email.html).toContain("Hi jo,");
    expect(email.html).toContain("4 of 7");
    expect(email.html).toContain("37");
    expect(email.html).toContain("You have mastered 9 of 40 modules.");
    expect(email.html).toContain("3 scenarios are due for review.");
    expect(email.html).toContain("Mon 12 Oct");
    expect(email.html).toContain("Sun 18 Oct");
  });

  it("nudges after a quiet week and leaves the table out", () => {
    const email = weeklyDigestEmail(QUIET, RANGE, LINKS);
    expect(email.subject).toBe("Your weekly training summary");
    expect(email.html).toContain("Hi,");
    expect(email.html).toContain("No training was logged");
    expect(email.html).not.toContain("Days trained");
    expect(email.html).toContain("Start this week");
  });

  it("uses singular words for one", () => {
    const email = weeklyDigestEmail({ ...BUSY, daysTrained: 1, quizzesPassed: 1, reviewsDue: 1 }, RANGE, LINKS);
    expect(email.subject).toBe("Your week in training: 1 day, 1 module passed");
    expect(email.html).toContain("1 scenario is due for review.");
  });

  it("escapes the display name", () => {
    const email = weeklyDigestEmail({ ...BUSY, displayName: "<a href=x>Jo</a>" }, RANGE, LINKS);
    expect(email.html).not.toContain("<a href=x>");
    expect(email.html).toContain("&lt;a");
  });

  it("carries the unsubscribe link and the reason for the email", () => {
    const email = weeklyDigestEmail(BUSY, RANGE, LINKS);
    expect(email.html).toContain("Unsubscribe");
    expect(email.html).toContain("u=1&amp;k=digest&amp;t=abc");
    expect(email.html).toContain("turned on the weekly progress digest");
  });

  it("has no em dashes", () => {
    expect(weeklyDigestEmail(BUSY, RANGE, LINKS).html).not.toContain("—");
    expect(weeklyDigestEmail(QUIET, RANGE, LINKS).html).not.toContain("—");
  });
});

describe("sundayReminderEmail", () => {
  it("leads with reviews when some are due", () => {
    const email = sundayReminderEmail(BUSY, LINKS);
    expect(email.subject).toBe("Get set for the week ahead");
    expect(email.html).toContain("You have 3 scenarios due for review.");
    expect(email.html).toContain("You trained on 4 days in the last week.");
  });

  it("points a new starter at their first module", () => {
    expect(sundayReminderEmail(QUIET, LINKS).html).toContain("your first module");
  });

  it("asks for one more module when some are mastered and none are due", () => {
    expect(sundayReminderEmail({ ...BUSY, reviewsDue: 0 }, LINKS).html).toContain("You have mastered 9 of 40 modules. One more this week?");
  });

  it("recognises someone who has mastered everything", () => {
    expect(sundayReminderEmail({ ...BUSY, reviewsDue: 0, modulesMastered: 40 }, LINKS).html).toContain("all 40 modules");
  });

  it("names the reminder in the footer", () => {
    expect(sundayReminderEmail(BUSY, LINKS).html).toContain("turned on Sunday training reminders");
  });
});
