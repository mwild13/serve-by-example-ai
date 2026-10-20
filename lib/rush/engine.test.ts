import { describe, expect, it } from "vitest";
import { BARBACK_AWAY, RUSH_BREACH_MAX, RUSH_LENGTH, clockText, playRush, rushResult, type Moment, type RushMove, type Verdict } from "./engine";
import { MOMENTS } from "./moments";
import { seededRng } from "./random";

type Strategy = (moment: Moment, index: number, run: ReturnType<typeof playRush>) => RushMove;

function play(seed: number, strategy: Strategy) {
  const moves: RushMove[] = [];
  let run = playRush(seed, moves);
  while (run.current) {
    moves.push(strategy(run.current, moves.length, run));
    run = playRush(seed, moves);
  }
  return { run, moves, result: rushResult(run) };
}

const byVerdict = (verdict: Verdict) => (m: Moment) => m.choices.findIndex((c) => c.verdict === verdict);
const best: Strategy = (m, i, run) => ({
  pick: byVerdict("best")(m),
  barback: (run.state.ice <= 45 || run.state.glasses <= 45) && i >= run.state.barbackFreeAt,
});
const rank: Record<Verdict, number> = { best: 0, ok: 1, poor: 2, breach: 3 };
const worst: Strategy = (m) => ({ pick: m.choices.reduce((w, c, i) => (rank[c.verdict] > rank[m.choices[w].verdict] ? i : w), 0) });

describe("the moments", () => {
  it("each have one best call, and nothing too long to read in a few seconds", () => {
    for (const t of MOMENTS) {
      for (let seed = 1; seed <= 20; seed++) {
        const s = playRush(1, []).state;
        const made = t.make(seededRng(seed), { ...s, queue: 6, ice: 30, glasses: 30 });
        expect(made.choices.filter((c) => c.verdict === "best"), t.id).toHaveLength(1);
        expect(made.choices.length, t.id).toBeGreaterThanOrEqual(3);
        expect(made.situation.length, t.id).toBeLessThanOrEqual(220);
        for (const c of made.choices) expect(c.text.length, `${t.id}: ${c.text}`).toBeLessThanOrEqual(110);
        for (const text of [made.situation, made.why, ...made.choices.map((c) => c.text)]) expect(text, t.id).not.toMatch(/[–—]/);
      }
    }
    expect(new Set(MOMENTS.map((t) => t.id)).size).toBe(MOMENTS.length);
  });
});

describe("a shift", () => {
  it("is the same every time from the same seed and moves", () => {
    const a = play(42, best);
    expect(playRush(42, a.moves)).toEqual(a.run);
    expect(play(43, best).run.played.map((p) => p.moment.situation)).not.toEqual(a.run.played.map((p) => p.moment.situation));
  });

  it("is twelve moments, none repeated, two or three of them about safety", () => {
    for (let seed = 1; seed <= 300; seed++) {
      const { run } = play(seed, best);
      expect(run.played).toHaveLength(RUSH_LENGTH);
      const ids = run.played.map((p) => p.moment.templateId);
      expect(new Set(ids).size, String(seed)).toBe(ids.length);
      const safety = run.played.filter((p) => p.moment.kind === "safety").length;
      expect(safety, String(seed)).toBeGreaterThanOrEqual(2);
      expect(safety, String(seed)).toBeLessThanOrEqual(3);
    }
  });

  it("rewards the best calls and punishes the worst", () => {
    for (let seed = 1; seed <= 300; seed++) {
      expect(play(seed, best).result.score, String(seed)).toBeGreaterThanOrEqual(65);
      expect(play(seed, worst).result.score, String(seed)).toBeLessThanOrEqual(25);
    }
  });

  it("caps a breach, and freezing all night scores badly with guests walking out", () => {
    const breach = play(7, (m, i, run) => {
      const b = m.choices.findIndex((c) => c.verdict === "breach");
      return b >= 0 ? { pick: b } : best(m, i, run);
    }).result;
    expect(breach.breach).toBe(true);
    expect(breach.score).toBeLessThanOrEqual(RUSH_BREACH_MAX);
    expect(breach.rating).toBe("That broke a rule you can't break");
    const frozen = play(7, () => ({ pick: null })).result;
    expect(frozen.frozen).toBe(RUSH_LENGTH);
    expect(frozen.walked).toBeGreaterThan(10);
    expect(frozen.score).toBeLessThan(20);
  });

  it("treats a choice that isn't on offer as freezing", () => {
    expect(playRush(5, [{ pick: 99 }]).played[0].choice).toBeNull();
    expect(playRush(5, [{ pick: -1 }]).played[0].choice).toBeNull();
  });

  it("restocks when the bar-back is called, and ignores a call while they're away", () => {
    const first = playRush(9, [{ pick: 0, barback: true }]);
    expect(first.state.ice).toBe(100);
    expect(first.state.glasses).toBe(100);
    expect(first.state.barbackFreeAt).toBe(1 + BARBACK_AWAY);
    const again = playRush(9, [{ pick: 0, barback: true }, { pick: 0, barback: true }]);
    expect(again.played[1].barback).toBe(false);
  });

  it("forces the empty ice well when nobody calls for ice", () => {
    let hit = 0;
    for (let seed = 1; seed <= 100; seed++) {
      const { run } = play(seed, (m) => ({ pick: byVerdict("best")(m) }));
      if (run.played.some((p) => p.moment.templateId === "out-of-ice" || p.moment.templateId === "out-of-glasses")) hit++;
    }
    expect(hit).toBeGreaterThan(50);
  });

  it("tells the time", () => {
    expect(clockText(21 * 60 + 30)).toBe("9:30pm");
    expect(clockText(23 * 60 + 40)).toBe("11:40pm");
    expect(clockText(0)).toBe("12:00am");
  });
});
