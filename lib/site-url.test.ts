import { afterEach, describe, expect, it, vi } from "vitest";
import { emailLinkOrigin } from "./site-url";

describe("emailLinkOrigin", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("keeps a preview's emails on the preview", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "servebyexample.co");
    const req = new Request("https://preview-applicant-testing.serve-by-example-ai.pages.dev/api/management/applicants");
    expect(emailLinkOrigin(req)).toBe("https://preview-applicant-testing.serve-by-example-ai.pages.dev");
  });

  it("uses the site address everywhere else, whatever the request says", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "servebyexample.co");
    for (const url of [
      "https://servebyexample.co/api/x",
      "https://evil.pages.dev/api/x",
      "https://x.serve-by-example-ai.pages.dev.evil.com/api/x",
      "http://preview-x.serve-by-example-ai.pages.dev/api/x",
    ]) {
      expect(emailLinkOrigin(new Request(url))).toBe("https://servebyexample.co");
    }
  });
});
