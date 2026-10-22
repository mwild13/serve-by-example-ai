import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

// The limiter every public and signed-in API route calls before doing any
// work (forgot-password, contact, management, training). Buckets are
// module-wide, so every test uses its own key.

let keyCounter = 0;
const freshKey = () => `rate-test-${++keyCounter}`;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-22T09:00:00Z"));
});
afterEach(() => vi.useRealTimers());

describe("rateLimit", () => {
  it("allows exactly `limit` requests in a window, then refuses", () => {
    const key = freshKey();
    const results = Array.from({ length: 6 }, () => rateLimit(key, 5));
    expect(results).toEqual([true, true, true, true, true, false]);
  });

  it("opens again once the window has passed", () => {
    const key = freshKey();
    for (let i = 0; i < 5; i++) rateLimit(key, 5, 60_000);
    expect(rateLimit(key, 5, 60_000)).toBe(false);
    vi.advanceTimersByTime(59_999);
    expect(rateLimit(key, 5, 60_000)).toBe(false);
    vi.advanceTimersByTime(1);
    expect(rateLimit(key, 5, 60_000)).toBe(true);
  });

  it("keeps separate counts per key, so one address can't use up another's", () => {
    const attacker = freshKey();
    const venue = freshKey();
    for (let i = 0; i < 10; i++) rateLimit(attacker, 3);
    expect(rateLimit(attacker, 3)).toBe(false);
    expect(rateLimit(venue, 3)).toBe(true);
  });

  it("honours a longer window, as the forgot-password and bug-report routes use", () => {
    const key = freshKey();
    for (let i = 0; i < 5; i++) expect(rateLimit(key, 5, 10 * 60_000)).toBe(true);
    vi.advanceTimersByTime(5 * 60_000);
    expect(rateLimit(key, 5, 10 * 60_000)).toBe(false);
  });
});

describe("getClientIp", () => {
  const req = (headers: Record<string, string>) => new Request("http://test/", { headers });

  it("prefers Cloudflare's connecting IP, which the client can't set", () => {
    expect(getClientIp(req({ "cf-connecting-ip": "203.0.113.7", "x-forwarded-for": "198.51.100.1" }))).toBe("203.0.113.7");
  });

  it("falls back to the first x-forwarded-for address", () => {
    expect(getClientIp(req({ "x-forwarded-for": " 198.51.100.1 , 10.0.0.1" }))).toBe("198.51.100.1");
  });

  it("returns a shared 'unknown' bucket when neither header is present", () => {
    expect(getClientIp(req({}))).toBe("unknown");
  });
});
