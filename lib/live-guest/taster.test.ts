import { describe, expect, it } from "vitest";
import { TASTER_GUEST_ID } from "./taster";
import { findGuest } from "./guests";

describe("the taster guest", () => {
  it("is a reviewed guest with every dial in play", () => {
    const guest = findGuest(TASTER_GUEST_ID);
    expect(guest?.reviewed).toBe(true);
    expect(guest?.stakes.speed).toBe(true);
    expect(guest?.stakes.safety).not.toBeNull();
    expect(guest?.stakes.money.length).toBeGreaterThan(0);
  });
});
