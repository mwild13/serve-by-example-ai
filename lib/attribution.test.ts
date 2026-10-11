import { describe, expect, it } from "vitest";
import {
  ATTRIBUTION_COOKIE,
  attributionFromRequest,
  attributionFromUrl,
  attributionToStripeMetadata,
  decodeAttribution,
  encodeAttribution,
} from "@/lib/attribution";

describe("attribution", () => {
  it("reads campaign parameters from a landing URL", () => {
    const url = new URL("https://servebyexample.co/for-venues?utm_source=meta&utm_campaign=launch&fbclid=abc&other=1");
    const attribution = attributionFromUrl(url, new Date("2026-10-12T00:00:00Z"));
    expect(attribution).toEqual({
      utm_source: "meta",
      utm_campaign: "launch",
      fbclid: "abc",
      landing_path: "/for-venues",
      captured_at: "2026-10-12T00:00:00.000Z",
    });
  });

  it("returns null for a URL with no campaign parameters", () => {
    expect(attributionFromUrl(new URL("https://servebyexample.co/pricing?billing=yearly"))).toBeNull();
  });

  it("survives the cookie round trip and reaches Stripe metadata", () => {
    const attribution = attributionFromUrl(new URL("https://servebyexample.co/?utm_source=google&gclid=xyz"));
    const req = new Request("https://servebyexample.co/api/billing/checkout", {
      headers: { cookie: `other=1; ${ATTRIBUTION_COOKIE}=${encodeURIComponent(encodeAttribution(attribution!))}` },
    });
    expect(attributionToStripeMetadata(attributionFromRequest(req))).toEqual({
      utm_source: "google",
      gclid: "xyz",
      landing_path: "/",
    });
  });

  it("drops unknown keys, non-string values and malformed cookies", () => {
    const tampered = JSON.stringify({ utm_source: "x", userId: "someone-else", gclid: 5 });
    expect(decodeAttribution(tampered)).toEqual({ utm_source: "x" });
    expect(decodeAttribution("{not-json")).toBeNull();
    expect(decodeAttribution("a".repeat(5000))).toBeNull();
    expect(attributionToStripeMetadata(null)).toEqual({});
  });
});
