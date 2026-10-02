import { describe, expect, it } from "vitest";
import { rankCategories } from "./module-navigator";

describe("rankCategories", () => {
  it("ranks the weakest placement category first", () => {
    const ranks = rankCategories({ technical: 80, service: 40, compliance: 60 });
    expect(ranks.get("service")).toBe(0);
    expect(ranks.get("compliance")).toBe(1);
    expect(ranks.get("technical")).toBe(2);
  });

  it("orders old Elo-scale results the same way as percentages", () => {
    const elo = rankCategories({ technical: 1380, service: 1140, compliance: 1260 });
    const pct = rankCategories({ technical: 80, service: 40, compliance: 60 });
    expect([...elo.entries()]).toEqual([...pct.entries()]);
  });

  it("is empty when there's no usable result", () => {
    expect(rankCategories(null).size).toBe(0);
    expect(rankCategories({ technical: "high" }).size).toBe(0);
  });
});
