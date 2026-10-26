// How many applicant tests an account can send a month (docs/APPLICANT_TESTING.md
// §1). Venue plans only. Counted per paying account per Sydney month by
// claim_applicant_test() in the database, when an invite is sent.
// The numbers are the owner's call: change them here and nowhere else.
import { normalizeTier, type Tier } from "@/lib/session";

export const APPLICANT_TESTS_PER_MONTH: Record<Tier, number> = {
  free: 0,
  pro: 0,
  boutique: 10,
  venue_single: 10,
  commercial: 40,
  venue_multi: 40,
  enterprise: 200,
};

/** During a trial, whatever the trial's plan. */
export const TRIAL_APPLICANT_TESTS = 2;

export function monthlyApplicantTests(tier: Tier | null, onTrial: boolean): number {
  if (!tier) return 0;
  const plan = APPLICANT_TESTS_PER_MONTH[normalizeTier(tier)] ?? 0;
  return onTrial ? Math.min(plan, TRIAL_APPLICANT_TESTS) : plan;
}

/** The first day of `now`'s month in Sydney, "YYYY-MM-01": the usage row's key. */
export function sydneyMonthStart(now: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney", year: "numeric", month: "2-digit" }).formatToParts(now);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  return `${year}-${month}-01`;
}
