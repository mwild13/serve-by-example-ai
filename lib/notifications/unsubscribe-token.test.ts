import { describe, expect, it } from "vitest";
import {
  safeEqual,
  unsubscribeApiUrl,
  unsubscribePageUrl,
  unsubscribeToken,
  verifyUnsubscribeToken,
} from "./unsubscribe-token";

const SECRET = "test-secret-not-real";
const USER = "089b5485-e07e-451c-adf4-c5bbc49d4233";

describe("unsubscribe tokens", () => {
  it("verifies a token made for the same user and email", async () => {
    const token = await unsubscribeToken(SECRET, USER, "digest");
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(await verifyUnsubscribeToken(SECRET, USER, "digest", token)).toBe(true);
  });

  it("rejects a token for the other email, another user, another secret or nothing", async () => {
    const token = await unsubscribeToken(SECRET, USER, "digest");
    expect(await verifyUnsubscribeToken(SECRET, USER, "reminders", token)).toBe(false);
    expect(await verifyUnsubscribeToken(SECRET, "00000000-0000-0000-0000-000000000000", "digest", token)).toBe(false);
    expect(await verifyUnsubscribeToken("another-secret", USER, "digest", token)).toBe(false);
    expect(await verifyUnsubscribeToken(SECRET, USER, "digest", "")).toBe(false);
  });

  it("builds page and one-click URLs carrying the same three values", async () => {
    const token = await unsubscribeToken(SECRET, USER, "reminders");
    const page = new URL(unsubscribePageUrl("https://servebyexample.co", USER, "reminders", token));
    const api = new URL(unsubscribeApiUrl("https://servebyexample.co", USER, "reminders", token));
    expect(page.pathname).toBe("/notifications/unsubscribe");
    expect(api.pathname).toBe("/api/notifications/unsubscribe");
    for (const url of [page, api]) {
      expect(url.searchParams.get("u")).toBe(USER);
      expect(url.searchParams.get("k")).toBe("reminders");
      expect(url.searchParams.get("t")).toBe(token);
    }
  });
});

describe("safeEqual", () => {
  it("matches only identical strings", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
    expect(safeEqual("abc", "abcd")).toBe(false);
    expect(safeEqual("", "a")).toBe(false);
  });
});
