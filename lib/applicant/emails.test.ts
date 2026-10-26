import { describe, expect, it } from "vitest";
import { applicantFinishedEmail, applicantInviteEmail, defaultIntro, senderNameFor } from "./emails";

const DASH = /[–—]/;

describe("applicant emails", () => {
  it("escapes everything a manager or applicant typed", () => {
    const { html, subject } = applicantInviteEmail({
      venueName: "The <b>Royal</b>",
      applicantName: "<script>Sam</script> Lee",
      intro: "Hi there\n\n<a href=\"https://evil\">Click</a>",
      url: "https://servebyexample.co/apply/abc",
      expiresAt: new Date("2026-11-09T00:00:00Z"),
    });
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<a href=\"https://evil\">");
    expect(html).toContain("&lt;b&gt;Royal&lt;/b&gt;");
    expect(subject).toBe("The <b>Royal</b>: your next step");
    expect(html).toContain("https://servebyexample.co/apply/abc");
  });

  it("says what is collected, for how long, and how to have it deleted", () => {
    const { html } = applicantInviteEmail({
      venueName: "The Royal",
      applicantName: "Sam",
      intro: defaultIntro("The Royal"),
      url: "https://x/apply/abc",
      expiresAt: new Date("2026-11-09T00:00:00Z"),
    });
    expect(html).toContain("12 months");
    expect(html).toContain("delete");
    expect(html).toContain("Monday 9 November");
  });

  it("keeps the sender name plain and short", () => {
    expect(senderNameFor("The \"Royal\" <Hotel>\n")).toBe("The Royal Hotel via Serve By Example");
    expect(senderNameFor("  ")).toBe("Serve By Example");
    expect(senderNameFor("x".repeat(80)).length).toBeLessThanOrEqual(70);
  });

  it("never uses a dash in text people read", () => {
    const invite = applicantInviteEmail({ venueName: "V", applicantName: "Sam", intro: defaultIntro("V"), url: "https://x", expiresAt: new Date() });
    const finished = applicantFinishedEmail({ venueName: "V", applicantName: "Sam", trackLabel: "Bar", url: "https://x" });
    for (const text of [invite.html, invite.subject, finished.html, finished.subject, defaultIntro("V")]) {
      expect(DASH.test(text)).toBe(false);
    }
  });
});
