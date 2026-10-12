// The plans Stripe sells and how a subscription maps to an account's tier.
// Shared by checkout, the billing portal and the webhook so the three cannot
// disagree about what a price is worth.

export const B2B_TIERS = new Set(["boutique", "commercial", "enterprise"]);

export const B2B_PLANS = new Set(["boutique", "boutique_yearly", "commercial", "commercial_yearly", "enterprise"]);

// Default seat limits for venue tiers.
export const TIER_SEAT_LIMITS: Record<string, number> = {
  boutique: 15,
  commercial: 35,
  enterprise: 9999,
};

// Tier + seat_limit embedded in Stripe metadata at checkout
export const PLAN_METADATA: Record<string, { tier: string; seat_limit: string }> = {
  pro:                  { tier: "pro",        seat_limit: "1" },
  pro_yearly:           { tier: "pro",        seat_limit: "1" },
  boutique:             { tier: "boutique",   seat_limit: "15" },
  boutique_yearly:      { tier: "boutique",   seat_limit: "15" },
  commercial:           { tier: "commercial", seat_limit: "35" },
  commercial_yearly:    { tier: "commercial", seat_limit: "35" },
  enterprise:           { tier: "enterprise", seat_limit: "9999" },
  // Legacy plan keys — kept so existing bookmarked links and emails still resolve
  single_venue:         { tier: "boutique",   seat_limit: "15" },
  single_venue_yearly:  { tier: "boutique",   seat_limit: "15" },
  multi_venue:          { tier: "commercial", seat_limit: "35" },
  multi_venue_yearly:   { tier: "commercial", seat_limit: "35" },
};

export function getPriceIds(): Record<string, string | undefined> {
  return {
    pro:                  process.env.STRIPE_PRICE_PRO,
    pro_yearly:           process.env.STRIPE_PRICE_PRO_YEARLY,
    boutique:             process.env.STRIPE_PRICE_BOUTIQUE,
    boutique_yearly:      process.env.STRIPE_PRICE_BOUTIQUE_YEARLY,
    commercial:           process.env.STRIPE_PRICE_COMMERCIAL,
    commercial_yearly:    process.env.STRIPE_PRICE_COMMERCIAL_YEARLY,
    enterprise:           process.env.STRIPE_PRICE_ENTERPRISE,
    // Legacy price IDs — kept for backward compat with existing subscribers
    single_venue:         process.env.STRIPE_PRICE_SINGLE_VENUE,
    single_venue_yearly:  process.env.STRIPE_PRICE_SINGLE_VENUE_YEARLY,
    multi_venue:          process.env.STRIPE_PRICE_MULTI_VENUE,
    multi_venue_yearly:   process.env.STRIPE_PRICE_MULTI_VENUE_YEARLY,
  };
}

/** Stripe price id → tier, for every price whose variable is set. */
export function priceToTierMap(priceIds = getPriceIds()): Record<string, string> {
  const map: Record<string, string> = {};
  for (const [plan, priceId] of Object.entries(priceIds)) {
    if (priceId) map[priceId] = PLAN_METADATA[plan].tier;
  }
  return map;
}

/**
 * The tier and seat limit a subscription is worth.
 *
 * The price decides, not the metadata. Metadata is written once at checkout;
 * a plan changed afterwards (in the billing portal, or by hand in the Stripe
 * dashboard) changes the price and leaves the metadata saying the old tier.
 * Metadata is the fallback for a price this build has no variable for.
 */
export function planForSubscription(
  priceId: string | undefined,
  metadata: Record<string, string> | null | undefined,
  priceToTier: Record<string, string>,
): { tier: string; seatLimit: number } | null {
  const tier = (priceId ? priceToTier[priceId] : undefined) ?? metadata?.tier;
  if (!tier) return null;
  // The metadata seat limit only still applies if it was written for this tier.
  const metadataSeats = metadata?.tier === tier ? parseInt(metadata.seat_limit ?? "", 10) : NaN;
  return { tier, seatLimit: Number.isFinite(metadataSeats) ? metadataSeats : (TIER_SEAT_LIMITS[tier] ?? 0) };
}

// Plans a paying member can move up to from the pricing board. Enterprise is
// sold by conversation, and the legacy keys are not offered any more.
const UPGRADE_PLANS = new Set(["boutique", "boutique_yearly", "commercial", "commercial_yearly"]);
const TIER_RANK: Record<string, number> = { pro: 1, boutique: 2, commercial: 3 };

/** True when moving from `currentTier` to `plan` is a step up that the portal may confirm. */
export function isUpgrade(currentTier: string, plan: string): boolean {
  if (!UPGRADE_PLANS.has(plan)) return false;
  const from = TIER_RANK[currentTier];
  const to = TIER_RANK[PLAN_METADATA[plan].tier];
  return from !== undefined && to > from;
}
