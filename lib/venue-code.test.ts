import { describe, expect, it } from "vitest";
import { VENUE_CODE_ALPHABET, generateVenueCode, normalizeVenueCode } from "@/lib/venue-code";

describe("venue codes", () => {
  it("generates 6 characters from the unambiguous alphabet, matching the DB check", () => {
    const dbCheck = /^([0-9]{4}|[ABCDEFGHJKMNPQRSTUVWXYZ2-9]{6})$/;
    for (let i = 0; i < 2000; i++) {
      const code = generateVenueCode();
      expect(code).toMatch(dbCheck);
      expect(code).toHaveLength(6);
      for (const ch of code) expect(VENUE_CODE_ALPHABET).toContain(ch);
    }
  });

  it("uses every character of the alphabet", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 2000; i++) for (const ch of generateVenueCode()) seen.add(ch);
    expect(seen.size).toBe(VENUE_CODE_ALPHABET.length);
  });

  it("accepts typed codes case-insensitively, with spaces or dashes", () => {
    expect(normalizeVenueCode("k7p3qx")).toBe("K7P3QX");
    expect(normalizeVenueCode(" K7P-3QX ")).toBe("K7P3QX");
  });

  it("keeps existing 4-digit codes working, as a string or a number", () => {
    expect(normalizeVenueCode("4821")).toBe("4821");
    expect(normalizeVenueCode(4821)).toBe("4821");
  });

  it("rejects anything that can't be a code", () => {
    for (const bad of ["", "482", "48210", "K7P3Q", "K7P3QXY", "O0I1LX", "K7P3Q!", null, undefined, {}, 12.5]) {
      expect(normalizeVenueCode(bad)).toBeNull();
    }
  });
});
