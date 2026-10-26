import { describe, expect, it } from "vitest";
import { TRIAL_APPLICANT_TESTS, monthlyApplicantTests, sydneyMonthStart } from "./allowance";

describe("applicant test allowance", () => {
  it("is on venue plans only", () => {
    expect(monthlyApplicantTests(null, false)).toBe(0);
    expect(monthlyApplicantTests("pro", false)).toBe(0);
    expect(monthlyApplicantTests("boutique", false)).toBeGreaterThan(0);
    expect(monthlyApplicantTests("venue_single", false)).toBe(monthlyApplicantTests("boutique", false));
    expect(monthlyApplicantTests("commercial", false)).toBeGreaterThan(monthlyApplicantTests("boutique", false));
  });

  it("is capped during a trial", () => {
    expect(monthlyApplicantTests("commercial", true)).toBe(TRIAL_APPLICANT_TESTS);
  });
});

describe("sydneyMonthStart", () => {
  it("uses the month in Sydney, not UTC", () => {
    // 1 November 2026, 9am in Sydney (AEDT, UTC+11) is still 31 October in UTC.
    expect(sydneyMonthStart(new Date("2026-10-31T22:00:00Z"))).toBe("2026-11-01");
    expect(sydneyMonthStart(new Date("2026-10-15T00:00:00Z"))).toBe("2026-10-01");
  });
});
