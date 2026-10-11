import { describe, expect, it } from "vitest";
import { brandedEmailHtml, emailFieldTableHtml, emailNoteHtml, escapeHtml } from "@/lib/email-template";

describe("emailFieldTableHtml", () => {
  it("renders a row per field and leaves out the empty ones", () => {
    const html = emailFieldTableHtml([
      ["Name", "Mia Murphy"],
      ["Venue", ""],
      ["Staff", "0"],
    ]);
    expect(html).toContain("Mia Murphy");
    expect(html).not.toContain("Venue");
    expect(html.match(/<tr>/g)).toHaveLength(2);
  });
});

describe("the shared shell", () => {
  it("wraps a note in the branded layout without unescaping it", () => {
    const html = brandedEmailHtml({
      heading: "New contact enquiry",
      bodyHtml: emailNoteHtml("Message", escapeHtml('<a href="https://example.com">Reset</a>')),
    });
    expect(html).toContain("New contact enquiry");
    expect(html).toContain("&lt;a href=");
    expect(html).not.toContain('<a href="https://example.com">');
  });
});
