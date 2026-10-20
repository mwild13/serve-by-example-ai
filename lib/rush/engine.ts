/**
 * engine.ts – Saturday Rush, a timed service game (Rich update, Phase 15).
 *
 * A Saturday night shift in twelve moments. Each moment is a situation at
 * the bar with three or four choices and a few seconds to pick one. The
 * queue grows, the ice and clean glasses run down, and what you choose
 * moves the four dials (guest, speed, money, safety), the takings and the
 * number of guests who give up and walk out.
 *
 * Any time, you can call the bar-back: ice and clean glasses come back full
 * at the end of that moment, and they're away for the next BARBACK_AWAY
 * moments, so when to call is part of the game.
 *
 * Everything comes from one seed: which moments come up, the drinks and
 * numbers in them, and the order of the choices. playRush(seed, moves)
 * replays a run from the start, so the browser plays it and the server
 * (/api/training/rush) checks the score the same way, without trusting the
 * browser's sums. No AI, no network while playing, and it never runs out:
 * the moments are in lib/rush/moments.ts.
 */

import { MOMENTS, type MomentTemplate } from "@/lib/rush/moments";
import { seededRng, type Rng } from "@/lib/rush/random";

export const RUSH_LENGTH = 12;
/** Seconds to choose. Running out counts as freezing. */
export const RUSH_SECONDS = 15;
/** A breach can never score above this. */
export const RUSH_BREACH_MAX = 40;
/** The shift starts at 9:30pm and each moment is ten minutes. */
const START_CLOCK = 21 * 60 + 30;
const MINUTES_PER_MOMENT = 10;
/** Guests arriving at each moment: the rush builds to 10:30pm, then eases. */
const ARRIVALS = [1, 2, 2, 2, 3, 4, 3, 2, 2, 2, 1, 1];
/** Safety moments a shift, at most. */
const MAX_SAFETY = 3;
/** Past this many waiting, guests give up and leave. */
const MAX_QUEUE = 10;
/** Moments the bar-back is away after a call. */
export const BARBACK_AWAY = 3;
/** Guests served each moment between the decisions, unless you froze. */
const STEADY_SERVE = 1;
/** The average spend of a guest served. */
const SPEND_PER_GUEST = 14;

export type Meter = "guest" | "speed" | "money" | "safety";
type Meters = Record<Meter, number>;
export type Verdict = "best" | "ok" | "poor" | "breach";
export type MomentKind = "queue" | "docket" | "stock" | "safety" | "team" | "sales";

/** What one choice does. Meter changes are on a 0 to 100 scale. */
type Effect = Partial<Meters> & {
  /** Guests served from the queue. */
  serve?: number;
  /** Dollars thrown away (a remake, a wasted pour). */
  waste?: number;
  /** Extra dollars from a better sale. */
  extra?: number;
  /** The bar-back restocks these. */
  restock?: ("ice" | "glasses")[];
};

export type Choice = { text: string; verdict: Verdict; effect: Effect };

/** One moment as it's played. */
export type Moment = {
  templateId: string;
  kind: MomentKind;
  /** Minutes past midnight. */
  clock: number;
  situation: string;
  /** In the order shown. */
  choices: Choice[];
  /** What a good bartender does, shown in the review. */
  why: string;
};

export type RushState = {
  queue: number;
  /** 0 empty to 100 full. */
  ice: number;
  /** Clean glasses, 0 none to 100 a full rack. */
  glasses: number;
  meters: Meters;
  served: number;
  walked: number;
  takings: number;
  waste: number;
  breach: boolean;
  /** The moment the bar-back can next be called (0: now). */
  barbackFreeAt: number;
};

/** One move: the choice as shown (null: time ran out), and whether the bar-back was called. */
export type RushMove = { pick: number | null; barback?: boolean };

/** A moment that's been played: what was chosen (null: time ran out). */
type PlayedMoment = { moment: Moment; choice: number | null; barback: boolean };

export type RushRun = {
  state: RushState;
  played: PlayedMoment[];
  /** The moment to play now, or null when the shift is over. */
  current: Moment | null;
};

export type RushResult = {
  score: number;
  meters: Meters;
  served: number;
  walked: number;
  takings: number;
  waste: number;
  breach: boolean;
  bestCalls: number;
  frozen: number;
  rating: string;
};

/** What freezing does: nobody's served and everyone notices. */
const FROZE: Effect = { guest: -6, speed: -8 };

function shuffled<T>(rng: Rng, items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function clamp(n: number, low = 0, high = 100): number {
  return Math.max(low, Math.min(high, n));
}

function startState(): RushState {
  return {
    queue: 3,
    ice: 100,
    glasses: 100,
    meters: { guest: 60, speed: 60, money: 60, safety: 70 },
    served: 0,
    walked: 0,
    takings: 0,
    waste: 0,
    breach: false,
    barbackFreeAt: 0,
  };
}

/** Whether the bar-back can be called at this moment. */
export function barbackFree(state: RushState, index: number): boolean {
  return index >= state.barbackFreeAt;
}

/** "10:40pm". */
export function clockText(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")}${h < 12 ? "am" : "pm"}`;
}

/** The next moment: one the state forces (out of ice), else a fresh one that fits, with a safety moment guaranteed. */
function nextTemplate(rng: Rng, state: RushState, index: number, used: Set<string>): MomentTemplate {
  const fresh = MOMENTS.filter((t) => !used.has(t.id));
  const forced = fresh.find((t) => t.forced?.(state));
  if (forced) return forced;
  let eligible = fresh.filter((t) => !t.forced && (t.when?.(state) ?? true));
  // Two or three safety moments a shift: one by the 5th, two by the 9th, never a fourth.
  const safetySoFar = MOMENTS.filter((t) => used.has(t.id) && t.kind === "safety").length;
  if (safetySoFar >= MAX_SAFETY) eligible = eligible.filter((t) => t.kind !== "safety");
  if ((index === 4 && safetySoFar === 0) || (index === 8 && safetySoFar < 2)) {
    const safety = eligible.filter((t) => t.kind === "safety");
    if (safety.length > 0) eligible = safety;
  }
  const total = eligible.reduce((sum, t) => sum + (t.weight ?? 1), 0);
  let roll = rng() * total;
  for (const t of eligible) {
    roll -= t.weight ?? 1;
    if (roll <= 0) return t;
  }
  return eligible[eligible.length - 1] ?? MOMENTS[0];
}

function buildMoment(rng: Rng, state: RushState, index: number, used: Set<string>): Moment {
  const template = nextTemplate(rng, state, index, used);
  used.add(template.id);
  const made = template.make(rng, state);
  return {
    templateId: template.id,
    kind: template.kind,
    clock: START_CLOCK + index * MINUTES_PER_MOMENT,
    situation: made.situation,
    choices: shuffled(rng, made.choices),
    why: made.why,
  };
}

/** What a choice does to the bar, then the next lot of guests arrive and the stock runs down. */
function apply(state: RushState, effect: Effect, verdict: Verdict | null, index: number, rng: Rng, barback: boolean): RushState {
  const s: RushState = { ...state, meters: { ...state.meters } };
  for (const m of ["guest", "speed", "money", "safety"] as Meter[]) s.meters[m] = clamp(s.meters[m] + (effect[m] ?? 0));
  if (verdict === "breach") {
    s.breach = true;
    s.meters.safety = Math.min(s.meters.safety, 10);
  }

  const served = Math.min((effect.serve ?? 0) + (verdict === null ? 0 : STEADY_SERVE), s.queue);
  s.queue -= served;
  s.served += served;
  s.takings += served * SPEND_PER_GUEST + (effect.extra ?? 0);
  s.waste += effect.waste ?? 0;
  if (effect.waste) s.meters.money = clamp(s.meters.money - Math.ceil(effect.waste / 2));
  if (effect.extra) s.meters.money = clamp(s.meters.money + Math.ceil(effect.extra / 2));

  s.ice = clamp(s.ice - 6 - served * 2);
  s.glasses = clamp(s.glasses - 5 - served * 3);
  if (effect.restock?.includes("ice") || barback) s.ice = 100;
  if (effect.restock?.includes("glasses") || barback) s.glasses = 100;
  if (barback) s.barbackFreeAt = index + 1 + BARBACK_AWAY;

  // The next guests arrive.
  s.queue += ARRIVALS[index] + (rng() < 0.3 ? 1 : 0);
  if (s.queue > 5) {
    s.meters.guest = clamp(s.meters.guest - (s.queue - 5) * 2);
    s.meters.speed = clamp(s.meters.speed - 2);
  }
  if (s.queue > MAX_QUEUE) {
    const left = s.queue - MAX_QUEUE;
    s.walked += left;
    s.queue = MAX_QUEUE;
    s.meters.guest = clamp(s.meters.guest - 3 * left);
    s.meters.money = clamp(s.meters.money - 3 * left);
  }
  // An empty well or no clean glasses stops the bar.
  if (s.ice === 0 || s.glasses === 0) s.meters.speed = clamp(s.meters.speed - 6);
  return s;
}

/**
 * Plays a run from the start: the seed, then each move in turn. Moves past
 * the end of the shift are ignored, a choice that isn't on offer counts as
 * freezing, and a call while the bar-back is away does nothing.
 */
export function playRush(seed: number, moves: RushMove[]): RushRun {
  const rng = seededRng(seed);
  const used = new Set<string>();
  let state = startState();
  const played: PlayedMoment[] = [];
  let current: Moment | null = buildMoment(rng, state, 0, used);
  for (let i = 0; i < RUSH_LENGTH; i++) {
    if (i >= moves.length) break;
    const moment: Moment = current!;
    const raw = moves[i]?.pick ?? null;
    const choice = raw !== null && Number.isInteger(raw) && raw >= 0 && raw < moment.choices.length ? raw : null;
    const picked = choice === null ? null : moment.choices[choice];
    const barback = moves[i]?.barback === true && barbackFree(state, i);
    state = apply(state, picked?.effect ?? FROZE, picked?.verdict ?? null, i, rng, barback);
    played.push({ moment, choice, barback });
    current = i + 1 < RUSH_LENGTH ? buildMoment(rng, state, i + 1, used) : null;
  }
  return { state, played, current };
}

const RATINGS: [number, string][] = [
  [85, "You ran the bar"],
  [70, "You held it together"],
  [50, "In the weeds, but standing"],
  [0, "The bar sank"],
];

/** The score out of 100: the four dials, and how many of the best calls you made. */
export function rushResult(run: RushRun): RushResult {
  const { state, played } = run;
  const m = state.meters;
  const dials = m.guest * 0.3 + m.speed * 0.25 + m.money * 0.2 + m.safety * 0.25;
  const bestCalls = played.filter((p) => p.choice !== null && p.moment.choices[p.choice].verdict === "best").length;
  const calls = played.length > 0 ? (bestCalls / played.length) * 100 : 0;
  let score = Math.round(dials * 0.6 + calls * 0.4);
  if (state.breach) score = Math.min(score, RUSH_BREACH_MAX);
  score = clamp(score);
  return {
    score,
    meters: { ...m },
    served: state.served,
    walked: state.walked,
    takings: state.takings,
    waste: state.waste,
    breach: state.breach,
    bestCalls,
    frozen: played.filter((p) => p.choice === null).length,
    rating: state.breach ? "That broke a rule you can't break" : RATINGS.find(([at]) => score >= at)![1],
  };
}

/** A dial as a word, like Live Guest's. */
export function meterLabel(meter: Meter, value: number): string {
  const band = value >= 82 ? 4 : value >= 66 ? 3 : value >= 45 ? 2 : value >= 25 ? 1 : 0;
  const words: Record<Meter, string[]> = {
    guest: ["Fuming", "Annoyed", "Neutral", "Happy", "Delighted"],
    speed: ["Stalled", "Slow", "Steady", "Quick", "Flying"],
    money: ["Bleeding", "Down", "Even", "Up", "Strong"],
    safety: ["Unsafe", "At risk", "Watch it", "Mostly safe", "Safe"],
  };
  return words[meter][band];
}
