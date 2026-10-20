import { describe, expect, it } from "vitest";
import { TASTER_GUEST_ID } from "./taster";
import { findGuest } from "./guests";

describe("the taster guest", () => {
  it("is a reviewed, gentle guest with the speed and safety dials in play", () => {
    const guest = findGuest(TASTER_GUEST_ID);
    expect(guest?.reviewed).toBe(true);
    expect(guest?.level).toBe(1);
    expect(guest?.stakes.speed).toBe(true);
    expect(guest?.stakes.safety).not.toBeNull();
  });
});
