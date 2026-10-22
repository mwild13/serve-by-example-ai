import { describe, expect, it } from "vitest";
import { findGuest } from "@/lib/live-guest/guests";
import {
  DEMO_GUEST,
  DEMO_TURNS,
  START_STATE,
  applyChoice,
  calmsFound,
  newCalmsByTurn,
  scoreChoices,
} from "@/lib/demo-guest";

const brief = findGuest(DEMO_GUEST.id)!;

describe("the /demo script matches Sharon's brief", () => {
  it("uses the real guest", () => {
    expect(brief).toBeDefined();
    expect(brief.reviewed).toBe(true);
    expect(DEMO_GUEST.name).toBe(brief.name);
    expect(DEMO_GUEST.opening).toBe(brief.opening);
    expect(DEMO_GUEST.setting).toBe(brief.setting);
    expect(DEMO_GUEST.wants).toBe(brief.wants);
    expect(DEMO_GUEST.startMood).toBe(brief.startMood);
    expect(DEMO_GUEST.startSafety).toBe(brief.stakes.safety);
    expect([...DEMO_GUEST.calms]).toEqual(brief.calms);
    expect([...DEMO_GUEST.setsOff]).toEqual(brief.setsOff);
    expect(DEMO_GUEST.money.map((m) => [m.id, m.dollars])).toEqual(brief.stakes.money.map((m) => [m.id, m.dollars]));
  });

  it("only credits what the brief lists", () => {
    const moneyIds = brief.stakes.money.map((m) => m.id);
    for (const choice of DEMO_TURNS.flat()) {
      for (const h of choice.helped) expect(brief.calms).toContain(h);
      for (const s of choice.setOff) expect(brief.setsOff).toContain(s);
      for (const m of choice.money) expect(moneyIds).toContain(m);
    }
  });

  it("has three turns of three replies, one of each grade", () => {
    expect(DEMO_TURNS).toHaveLength(3);
    for (const turn of DEMO_TURNS) {
      expect(turn.map((c) => c.points).sort((a, b) => a - b)).toEqual([15, 55, 100]);
    }
  });

  it("never lifts her mood on a reply that set her off", () => {
    for (const choice of DEMO_TURNS.flat()) {
      if (choice.setOff.length > 0 && choice.helped.length === 0) expect(choice.moodDelta).toBeLessThanOrEqual(0);
    }
  });
});

describe("scoring", () => {
  const best = DEMO_TURNS.map((turn) => turn.find((c) => c.points === 100)!);
  const worst = DEMO_TURNS.map((turn) => turn.find((c) => c.points === 15)!);

  it("the best path passes, finds every calm and leaves Sharon happy", () => {
    const end = best.reduce(applyChoice, START_STATE);
    expect(scoreChoices(best, end)).toEqual({ score: 100, passed: true, capped: false });
    expect(calmsFound(best)).toEqual([...DEMO_GUEST.calms]);
    expect(end.mood).toBeGreaterThanOrEqual(4);
    expect(end.money).toEqual(["fresh-parmy", "on-the-house"]);
  });

  it("the worst path fails, and sending the chicken back out unsafe caps the score", () => {
    const end = worst.reduce(applyChoice, START_STATE);
    expect(end.safety).toBeLessThanOrEqual(2);
    const { score, passed } = scoreChoices(worst, end);
    expect(passed).toBe(false);
    expect(score).toBeLessThanOrEqual(40);
  });

  it("only says the safety cap applied when it lowered the score", () => {
    // Two good replies, then the heat lamp: 72 on average, capped to 40.
    const picks = [best[0], best[1], worst[2]];
    const end = picks.reduce(applyChoice, START_STATE);
    expect(scoreChoices(picks, end)).toEqual({ score: 40, passed: false, capped: true });
    expect(scoreChoices(worst, worst.reduce(applyChoice, START_STATE)).capped).toBe(false);
  });

  it("credits each calm once, on the reply that first found it", () => {
    const fresh = newCalmsByTurn(best);
    expect(fresh.flat()).toEqual([...new Set(fresh.flat())]);
    expect(fresh.flat().sort()).toEqual([...DEMO_GUEST.calms].sort());
  });

  it("counts each money item once", () => {
    const end = best.reduce(applyChoice, START_STATE);
    expect(new Set(end.money).size).toBe(end.money.length);
  });
});
