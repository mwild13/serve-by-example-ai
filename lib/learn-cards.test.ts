import { describe, expect, it } from "vitest";
import { LEARN_CARD_LOADERS, type LearnCard } from "./learn-cards";
import { VERIFY_QUESTIONS } from "./verify-questions";

async function allCards(): Promise<[number, LearnCard[]][]> {
  const entries = Object.entries(LEARN_CARD_LOADERS);
  return Promise.all(entries.map(async ([id, load]) => [Number(id), await load!()] as [number, LearnCard[]]));
}

describe("learn cards", () => {
  it("gives each module with cards 4 to 6 of them, with unique ids", async () => {
    for (const [moduleId, cards] of await allCards()) {
      expect(cards.length, `module ${moduleId}`).toBeGreaterThanOrEqual(4);
      expect(cards.length, `module ${moduleId}`).toBeLessThanOrEqual(6);
      const ids = cards.map((c) => c.id);
      expect(new Set(ids).size, `module ${moduleId}`).toBe(ids.length);
      for (const id of ids) expect(id, `module ${moduleId}`).toMatch(/^c\d+$/);
    }
  });

  it("teaches every statement in the module, and only real ones", async () => {
    for (const [moduleId, cards] of await allCards()) {
      const statements = VERIFY_QUESTIONS[moduleId].map((_, i) => `s${i}`);
      const taught = new Set(cards.flatMap((c) => c.concepts));
      for (const concept of taught) expect(statements, `module ${moduleId}`).toContain(concept);
      for (const s of statements) expect(taught.has(s), `module ${moduleId} ${s}`).toBe(true);
    }
  });

  it("keeps every card short enough to read in a few seconds", async () => {
    for (const [moduleId, cards] of await allCards()) {
      for (const c of cards) {
        const where = `module ${moduleId}/${c.id}`;
        expect(c.title.length, where).toBeLessThanOrEqual(40);
        expect(c.rule.length, where).toBeLessThanOrEqual(170);
        expect(c.why.length, where).toBeLessThanOrEqual(200);
      }
    }
  });
});

describe("learn card coverage", () => {
  it("has cards for every module", () => {
    for (const moduleId of Object.keys(VERIFY_QUESTIONS).map(Number)) {
      expect(LEARN_CARD_LOADERS[moduleId], `module ${moduleId}`).toBeDefined();
    }
  });
});
