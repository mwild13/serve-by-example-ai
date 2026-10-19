import { describe, expect, it } from "vitest";
import { GUEST_BRIEFS, findGuest } from "./guests";
import { guestDifficulty, startMoodFor, suggestedGuestIds, type GuestProgress } from "./difficulty";

const progress = (mastered: number[], passed: string[] = []): GuestProgress => ({
  masteredModules: new Set(mastered),
  passedGuests: new Set(passed),
});

const dave = findGuest("flat-schooner")!; // module 1, starts annoyed (2)
const jess = findGuest("birthday-shots")!; // module 15, starts happy (4)
const live = GUEST_BRIEFS.filter((g) => g.reviewed);
const everyone = () => true;

describe("how hard the guest plays", () => {
  it("is patient for a beginner", () => {
    expect(guestDifficulty(dave, progress([]))).toBe(1);
  });

  it("plays as written once the module is mastered, or for someone experienced", () => {
    expect(guestDifficulty(dave, progress([1]))).toBe(2);
    expect(guestDifficulty(dave, progress([2, 3, 4, 5, 6, 7, 8, 9, 10, 11]))).toBe(2);
  });

  it("is tough once the module is mastered and the guest passed before", () => {
    expect(guestDifficulty(dave, progress([1], ["flat-schooner"]))).toBe(3);
    expect(guestDifficulty(dave, progress([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], ["flat-schooner"]))).toBe(3);
  });
});

describe("the opening mood", () => {
  it("is one step kinder for a patient guest, never above happy", () => {
    expect(startMoodFor(dave, 1)).toBe(3);
    expect(startMoodFor(jess, 1)).toBe(4);
  });

  it("is the brief's own mood as written", () => {
    expect(startMoodFor(dave, 2)).toBe(2);
  });

  it("is one step worse for a tough guest, but never opens fuming", () => {
    expect(startMoodFor(jess, 3)).toBe(3);
    expect(startMoodFor(dave, 3)).toBe(2);
  });
});

describe("suggested guests", () => {
  it("offers a beginner gentle guests only", () => {
    const ids = suggestedGuestIds(live, progress([]), everyone);
    expect(ids.size).toBeGreaterThan(0);
    expect(ids.size).toBeLessThanOrEqual(3);
    for (const id of ids) expect(findGuest(id)!.level).toBe(1);
  });

  it("puts modules the person has mastered first, and skips guests already passed", () => {
    const ids = suggestedGuestIds(live, progress([1, 37, 14], ["out-of-shiraz"]), everyone);
    expect(ids.has("flat-schooner")).toBe(true);
    expect(ids.has("out-of-shiraz")).toBe(false);
  });

  it("reaches the hard guests for someone experienced", () => {
    const ids = suggestedGuestIds(live, progress([2, 3, 4, 5, 6, 7, 8, 9, 10, 12]), everyone);
    expect([...ids].some((id) => findGuest(id)!.level === 3)).toBe(true);
  });

  it("never suggests a guest outside the person's plan", () => {
    expect(suggestedGuestIds(live, progress([]), () => false).size).toBe(0);
  });
});
