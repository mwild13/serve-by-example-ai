import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  hasLiveGuest,
  hasManagerConsoleAccess,
  isB2BTier,
  isMultiVenueTier,
  isOwnerLevelRole,
  normalizeTier,
  tierSeatLimit,
  validateSession,
} from "@/lib/session";

// The tier and role rules behind every access decision: the Manager Console
// gate (page and API), seat caps, Live Guest, and the one-device check.

describe("normalizeTier", () => {
  it("maps current and legacy names to one tier", () => {
    expect(normalizeTier("boutique")).toBe("boutique");
    expect(normalizeTier("single-venue")).toBe("venue_single");
    expect(normalizeTier("multi-venue")).toBe("venue_multi");
  });

  it.each([null, undefined, "", "Boutique", "admin", "enterprise "])("treats %j as free", (raw) => {
    expect(normalizeTier(raw)).toBe("free");
  });
});

describe("venue plan checks", () => {
  it("only venue tiers open the Manager Console", () => {
    for (const tier of ["boutique", "commercial", "enterprise", "venue_single", "venue_multi", "single-venue"]) {
      expect(isB2BTier(tier)).toBe(true);
    }
    for (const tier of ["free", "pro", null, "nonsense"]) expect(isB2BTier(tier)).toBe(false);
  });

  it("only Commercial and up get multi-venue controls", () => {
    expect(isMultiVenueTier("commercial")).toBe(true);
    expect(isMultiVenueTier("enterprise")).toBe(true);
    expect(isMultiVenueTier("venue_multi")).toBe(true);
    expect(isMultiVenueTier("boutique")).toBe(false);
    expect(isMultiVenueTier("venue_single")).toBe(false);
  });

  it("seat caps match the pricing page, and unknown tiers get none", () => {
    expect(tierSeatLimit("boutique")).toBe(15);
    expect(tierSeatLimit("venue_single")).toBe(15);
    expect(tierSeatLimit("commercial")).toBe(35);
    expect(tierSeatLimit("pro")).toBe(0);
    expect(tierSeatLimit("made-up")).toBe(0);
  });

  it("Live Guest is on venue plans only", () => {
    expect(hasLiveGuest({ tier: "boutique" })).toBe(true);
    expect(hasLiveGuest({ tier: "pro" })).toBe(false);
    expect(hasLiveGuest({ tier: "free" })).toBe(false);
  });
});

describe("role checks", () => {
  it("staff never reach the Manager Console; managers and duty managers do", () => {
    expect(hasManagerConsoleAccess("staff")).toBe(false);
    expect(hasManagerConsoleAccess(null)).toBe(false);
    expect(hasManagerConsoleAccess("Venue_Manager")).toBe(false);
    for (const role of ["venue_manager", "multi_venue_manager", "duty_manager", "admin"]) {
      expect(hasManagerConsoleAccess(role)).toBe(true);
    }
  });

  it("duty managers are not owner level, so Billing and Settings stay closed to them", () => {
    expect(isOwnerLevelRole("duty_manager")).toBe(false);
    expect(isOwnerLevelRole("staff")).toBe(false);
    expect(isOwnerLevelRole("venue_manager")).toBe(true);
    expect(isOwnerLevelRole("multi_venue_manager")).toBe(true);
  });
});

describe("validateSession (one device at a time)", () => {
  function admin(result: { data: { current_session_id: string | null } | null; error: { message: string } | null }) {
    const builder = { select: () => builder, eq: () => builder, single: async () => result };
    return { from: () => builder } as unknown as SupabaseClient;
  }

  it("refuses a missing session id outright", async () => {
    expect(await validateSession(admin({ data: { current_session_id: "a" }, error: null }), "u", null)).toEqual({ valid: false });
  });

  it("accepts the stored session and refuses an older device's", async () => {
    const db = admin({ data: { current_session_id: "newest" }, error: null });
    expect((await validateSession(db, "u", "newest")).valid).toBe(true);
    expect(await validateSession(db, "u", "older")).toEqual({ valid: false, currentSessionId: "newest" });
  });

  it("lets an account through before its first stamp", async () => {
    expect((await validateSession(admin({ data: { current_session_id: null }, error: null }), "u", "any")).valid).toBe(true);
  });

  it("lets the request through when the profile can't be read (documented fail-open)", async () => {
    expect((await validateSession(admin({ data: null, error: { message: "timeout" } }), "u", "any")).valid).toBe(true);
  });
});
