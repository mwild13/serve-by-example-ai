import { describe, expect, it } from "vitest";
import { applicantTestUrl, createApplicantToken, hashApplicantToken, isApplicantTokenShape } from "./token";

describe("applicant link tokens", () => {
  it("makes a fresh token each time, with a hash that matches it", async () => {
    const a = await createApplicantToken();
    const b = await createApplicantToken();
    expect(a.token).not.toBe(b.token);
    expect(isApplicantTokenShape(a.token)).toBe(true);
    expect(a.hash).toMatch(/^[0-9a-f]{64}$/);
    expect(await hashApplicantToken(a.token)).toBe(a.hash);
    expect(a.hash).not.toContain(a.token);
  });

  it("rejects anything that isn't a token", () => {
    for (const value of ["", "short", "x".repeat(44), `${"a".repeat(42)}=`, `${"a".repeat(42)}/`, 42, null]) {
      expect(isApplicantTokenShape(value)).toBe(false);
    }
  });

  it("builds the link", () => {
    expect(applicantTestUrl("https://servebyexample.co/", "abc")).toBe("https://servebyexample.co/apply/abc");
  });
});
