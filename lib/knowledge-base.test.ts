import { describe, expect, it } from "vitest";
import { KB_CATEGORIES, KB_ENTRIES } from "@/lib/knowledge-base";

describe("Knowledge Base", () => {
  it("has 101 cards", () => {
    expect(KB_ENTRIES).toHaveLength(101);
  });

  it("has unique titles", () => {
    expect(new Set(KB_ENTRIES.map((e) => e.title)).size).toBe(KB_ENTRIES.length);
  });

  it("files every card under a listed subcategory with real content", () => {
    for (const e of KB_ENTRIES) {
      const slugs = KB_CATEGORIES[e.category].subCategories.map((s) => s.slug);
      expect(slugs, e.title).toContain(e.subCategory);
      expect(e.content.length, e.title).toBeGreaterThan(120);
      expect(e.keyFacts.length, e.title).toBeGreaterThanOrEqual(4);
      expect(e.tags.length, e.title).toBeGreaterThan(0);
    }
  });
});
