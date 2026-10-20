// Seeded randomness for Saturday Rush (lib/rush/engine.ts): the same seed
// always gives the same shift, so the server can replay a run.

export type Rng = () => number;

/** mulberry32: small, fast and the same on every browser and the server. */
export function seededRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)];
}

/** A whole number from low to high, both included. */
export function between(rng: Rng, low: number, high: number): number {
  return low + Math.floor(rng() * (high - low + 1));
}
