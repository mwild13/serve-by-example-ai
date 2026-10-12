import { describe, expect, it } from "vitest";
import { isUpgrade, planForSubscription, priceToTierMap } from "./billing-plans";

const PRICES = priceToTierMap({
  pro: "price_pro",
  boutique: "price_boutique",
  commercial_yearly: "price_commercial_y",
  multi_venue: "price_legacy_multi",
  enterprise: undefined,
});

describe("priceToTierMap", () => {
  it("maps each set price to its tier and skips unset ones", () => {
    expect(PRICES).toEqual({
      price_pro: "pro",
      price_boutique: "boutique",
      price_commercial_y: "commercial",
      price_legacy_multi: "commercial",
    });
  });
});

describe("planForSubscription", () => {
  it("uses the checkout metadata's seat limit when it matches the price's tier", () => {
    expect(planForSubscription("price_boutique", { tier: "boutique", seat_limit: "20" }, PRICES)).toEqual({
      tier: "boutique",
      seatLimit: 20,
    });
  });

  it("follows the price when a plan switch left the metadata on the old tier", () => {
    // A Pro member moved to Boutique in the portal: the metadata still says pro.
    expect(planForSubscription("price_boutique", { tier: "pro", seat_limit: "1" }, PRICES)).toEqual({
      tier: "boutique",
      seatLimit: 15,
    });
  });

  it("falls back to metadata for a price with no variable", () => {
    expect(planForSubscription("price_unknown", { tier: "enterprise", seat_limit: "9999" }, PRICES)).toEqual({
      tier: "enterprise",
      seatLimit: 9999,
    });
  });

  it("returns null when neither the price nor the metadata names a tier", () => {
    expect(planForSubscription("price_unknown", {}, PRICES)).toBeNull();
    expect(planForSubscription(undefined, null, PRICES)).toBeNull();
  });
});

describe("isUpgrade", () => {
  it("allows a step up", () => {
    expect(isUpgrade("pro", "boutique")).toBe(true);
    expect(isUpgrade("pro", "commercial_yearly")).toBe(true);
    expect(isUpgrade("boutique", "commercial")).toBe(true);
  });

  it("refuses a sideways move, a step down, and plans not sold this way", () => {
    expect(isUpgrade("boutique", "boutique_yearly")).toBe(false);
    expect(isUpgrade("commercial", "boutique")).toBe(false);
    expect(isUpgrade("pro", "enterprise")).toBe(false);
    expect(isUpgrade("pro", "pro_yearly")).toBe(false);
    expect(isUpgrade("free", "boutique")).toBe(false);
    expect(isUpgrade("pro", "not_a_plan")).toBe(false);
  });
});
