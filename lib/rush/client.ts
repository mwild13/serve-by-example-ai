// Saturday Rush calls for the browser (Rich update, Phase 15). The game
// itself runs in the browser (lib/rush/engine.ts); these only fetch the
// personal best and save a finished shift, which the server replays.
import type { RushMove, RushResult } from "@/lib/rush/engine";

export type RushStats = { best: number | null; shifts: number };

export async function getRushStats(token: string): Promise<RushStats> {
  const res = await fetch("/api/training/rush", { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return { best: null, shifts: 0 };
  return (await res.json()) as RushStats;
}

/** Saves the shift; the server's result and the new best come back. Null if it couldn't be saved. */
export async function saveRush(token: string, seed: number, moves: RushMove[]): Promise<(RushStats & { result: RushResult }) | null> {
  const res = await fetch("/api/training/rush", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ seed, moves }),
  });
  if (!res.ok) return null;
  return (await res.json()) as RushStats & { result: RushResult };
}

/** A fresh seed for a new shift. */
export function newRushSeed(): number {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return values[0];
}
