export type TrialStatus = "active" | "expired" | "converted" | "none";

export interface OrgTrialFields {
  trial_tier: string | null;
  trial_ends_at: string | null;
  trial_converted: boolean;
}

export function getTrialStatus(org: OrgTrialFields | null | undefined): TrialStatus {
  if (!org?.trial_tier) return "none";
  if (org.trial_converted) return "converted";
  if (!org.trial_ends_at) return "none";
  return new Date(org.trial_ends_at) > new Date() ? "active" : "expired";
}

export function getDaysRemaining(trialEndsAt: string): number {
  const ms = new Date(trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

// Tiers eligible for a self-serve 14-day trial.
// enterprise is explicitly excluded (sales-assisted).
// pro is explicitly excluded (entry paid tier — filters for intent).
// Do NOT derive from B2B_TIERS — that grouping includes enterprise.
export const TRIAL_ELIGIBLE_TIERS = [
  "boutique",
  "commercial",
  "venue_single",
  "venue_multi",
] as const;

export type TrialEligibleTier = (typeof TRIAL_ELIGIBLE_TIERS)[number];

export function isTrialEligibleTier(tier: string): tier is TrialEligibleTier {
  return (TRIAL_ELIGIBLE_TIERS as readonly string[]).includes(tier);
}
