import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isKnownCrawler, shouldApplyGeoBlock } from "@/lib/geo-config";

const GOOGLEBOT = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
const ADS_REVIEW = "AdsBot-Google (+http://www.google.com/adsbot.html)";
const META_PREVIEW = "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)";
const BROWSER = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15";

describe("geo-block", () => {
  beforeEach(() => vi.stubEnv("NODE_ENV", "production"));
  afterEach(() => vi.unstubAllEnvs());

  it("lets Australian visitors through and blocks everyone else", () => {
    expect(shouldApplyGeoBlock("/pricing", "AU", BROWSER)).toBe(false);
    expect(shouldApplyGeoBlock("/pricing", "US", BROWSER)).toBe(true);
    expect(shouldApplyGeoBlock("/pricing", undefined, BROWSER)).toBe(true);
  });

  it("opens the home page to every country, and nothing beyond it", () => {
    expect(shouldApplyGeoBlock("/", "US", BROWSER)).toBe(false);
    expect(shouldApplyGeoBlock("/", undefined, BROWSER)).toBe(false);
    expect(shouldApplyGeoBlock("/login", "US", BROWSER)).toBe(true);
    expect(shouldApplyGeoBlock("/membership", "US", BROWSER)).toBe(true);
  });

  it("lets crawlers read marketing pages from outside Australia", () => {
    for (const agent of [GOOGLEBOT, ADS_REVIEW, META_PREVIEW]) {
      expect(isKnownCrawler(agent)).toBe(true);
      expect(shouldApplyGeoBlock("/", "US", agent)).toBe(false);
      expect(shouldApplyGeoBlock("/pricing", "US", agent)).toBe(false);
      expect(shouldApplyGeoBlock("/for-venues", undefined, agent)).toBe(false);
    }
  });

  it("never opens the product or account screens to a crawler user-agent", () => {
    for (const path of ["/login", "/dashboard", "/mobile/home", "/management/dashboard", "/onboarding", "/auth"]) {
      expect(shouldApplyGeoBlock(path, "US", GOOGLEBOT)).toBe(true);
    }
  });

  it("does not treat an ordinary browser as a crawler", () => {
    expect(isKnownCrawler(BROWSER)).toBe(false);
    expect(isKnownCrawler(null)).toBe(false);
  });
});
