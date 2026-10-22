/**
 * demo-guest.ts – the scripted Live Guest on the public /demo page.
 *
 * Sharon and her cold parmy ("cold-parmy" in lib/live-guest/guests.ts), told
 * as three turns with three replies each, so a visitor sees what Live Guest
 * does without signing up and without an AI call. The real guest answers
 * whatever is typed; this one only knows these nine replies.
 *
 * Not Dan ("stacked-glasses"): he is the free taster every new account gets,
 * and the reveal here shows what helps, which would give his answers away.
 *
 * lib/demo-guest.test.ts holds this script to Sharon's brief: her opening
 * line, and every "helped", "set off" and money item must come from it.
 */

export type DemoMood = 1 | 2 | 3 | 4 | 5;

export type DemoChoice = {
  /** What the staff member says. */
  text: string;
  /** One step at most, like the real guest. */
  moodDelta: -1 | 0 | 1;
  speedDelta: -1 | 0 | 1;
  /** Where the safety dial lands after this reply, when it moves. */
  safetyTo?: DemoMood;
  /** Ids of the brief's money items this reply makes happen. Each counts once. */
  money: string[];
  /** The brief's calms this reply did. */
  helped: string[];
  /** The brief's setsOff this reply did. */
  setOff: string[];
  /** What Sharon was thinking, shown in the reveal. */
  thought: string;
  /** Sharon's next line. The last turn's reply ends the conversation. */
  reply: string;
  /** 100 for the reply the brief rewards, 55 for half right, 15 for the wrong one. */
  points: 100 | 55 | 15;
};

export const DEMO_GUEST = {
  id: "cold-parmy",
  name: "Sharon",
  title: "The cold parmy",
  setting:
    "Thursday dinner in the bistro, steady. A guest has just been served a chicken parmy. She's cut into it and waves you down. Her husband is already eating his meal.",
  opening: "Excuse me. This parmy's cold in the middle. I've waited 40 minutes for this.",
  wants: "To be listened to, a hot replacement quickly, and some acknowledgement of the wait.",
  startMood: 2 as DemoMood,
  startSpeed: 3 as DemoMood,
  startSafety: 4 as DemoMood,
  calms: [
    "Letting her finish, then a sincere apology",
    "Taking it straight back for a fresh one to be cooked",
    "Giving her an honest idea of how long it will be",
    "Thinking about her husband eating alone, and offering something sensible",
    "Checking with a manager before offering anything free",
  ],
  setsOff: [
    "Blaming the kitchen",
    "Arguing about the 40 minutes",
    "Saying it can be heated up or microwaved",
    "A sorry with nothing done about it",
    "Promising something the venue may not allow",
  ],
  money: [
    { id: "fresh-parmy", label: "A fresh parmy cooked", dollars: -7 },
    { id: "on-the-house", label: "A drink or dessert on the house", dollars: -4 },
  ],
} as const;

const FRESH = "Taking it straight back for a fresh one to be cooked";
const TIME = "Giving her an honest idea of how long it will be";

/** Three turns. Choices are listed best first; the page shuffles them. */
export const DEMO_TURNS: DemoChoice[][] = [
  [
    {
      text: "I'm really sorry, that's not good enough after a 40 minute wait. Chicken that's cold in the middle isn't safe, so I'll take this straight back and have a fresh one cooked for you now.",
      moodDelta: 1,
      speedDelta: 0,
      safetyTo: 5,
      money: ["fresh-parmy"],
      helped: ["Letting her finish, then a sincere apology", FRESH],
      setOff: [],
      thought: "Good. No excuses, she just took the plate. Now, how long is this going to be?",
      reply: "Thank you. But my husband will have finished his by the time mine comes out. What are you going to do about that?",
      points: 100,
    },
    {
      text: "Oh, sorry about that. I'll get the kitchen to pop it in the microwave for a minute, it'll be right back.",
      moodDelta: -1,
      speedDelta: 0,
      safetyTo: 2,
      money: [],
      helped: [],
      setOff: ["Saying it can be heated up or microwaved"],
      thought: "Microwave a parmy that's raw in the middle? I'm not eating that.",
      reply: "Microwave it? It's chicken. I want a fresh one cooked properly. And my husband will have finished his by then, so what are you going to do about that?",
      points: 55,
    },
    {
      text: "Sorry, the kitchen's slammed tonight. Forty minutes is pretty normal for a Thursday.",
      moodDelta: -1,
      speedDelta: -1,
      money: [],
      helped: [],
      setOff: ["Blaming the kitchen", "Arguing about the 40 minutes"],
      thought: "So it's my fault for coming in on a Thursday? Nobody's even picked up the plate.",
      reply: "Normal? Serving it cold isn't normal. I want a fresh one. And my husband will have finished his by then, so what are you going to do about that?",
      points: 15,
    },
  ],
  [
    {
      text: "Fair point. A fresh one takes about 12 minutes and I'll bring it straight out. I'll also ask my manager if we can look after you both with a drink or a dessert while you wait.",
      moodDelta: 1,
      speedDelta: 1,
      safetyTo: 5,
      money: ["fresh-parmy", "on-the-house"],
      helped: [
        TIME,
        "Thinking about her husband eating alone, and offering something sensible",
        "Checking with a manager before offering anything free",
        FRESH,
      ],
      setOff: [],
      thought: "A real time, and she's thought about my husband sitting there. That's all I wanted.",
      reply: "That's more like it, thank you. Just make sure it's actually hot this time?",
      points: 100,
    },
    {
      text: "Don't worry, dessert's on the house for you both tonight.",
      moodDelta: 0,
      speedDelta: 0,
      money: ["on-the-house"],
      helped: [],
      setOff: ["Promising something the venue may not allow"],
      thought: "Nice of her, but can she actually do that? And she still hasn't said how long mine will be.",
      reply: "Well, thank you. And my parmy? Just make sure it's actually hot this time.",
      points: 55,
    },
    {
      text: "I'll see what I can do. It should be out soon.",
      moodDelta: -1,
      speedDelta: -1,
      money: [],
      helped: [],
      setOff: ["A sorry with nothing done about it"],
      thought: "Soon. That's what they said 40 minutes ago.",
      reply: "Soon? Right. Just make sure it's actually hot this time.",
      points: 15,
    },
  ],
  [
    {
      text: "Absolutely. A fresh one is on now, about 12 minutes. I'll tell the chef what happened and check it's piping hot myself before it comes out. Thanks for letting us know.",
      moodDelta: 1,
      speedDelta: 1,
      safetyTo: 5,
      money: ["fresh-parmy"],
      helped: [FRESH, TIME],
      setOff: [],
      thought: "Someone's actually taking this seriously. Fine, I'll give them another chance.",
      reply: "Thanks, love. That's all I wanted.",
      points: 100,
    },
    {
      text: "Yep, it'll be hot this time, don't worry.",
      moodDelta: 0,
      speedDelta: 0,
      money: ["fresh-parmy"],
      helped: [],
      setOff: [],
      thought: "I'll believe it when I see it. How long, though?",
      reply: "We'll see.",
      points: 55,
    },
    {
      text: "I'll ask them to give it a bit longer under the heat lamp.",
      moodDelta: -1,
      speedDelta: 0,
      safetyTo: 2,
      money: [],
      helped: [],
      setOff: ["Saying it can be heated up or microwaved"],
      thought: "Under the lamp? So it's the same parmy. Unbelievable.",
      reply: "The same one? No. I'd like to speak to the manager, please.",
      points: 15,
    },
  ],
];

const PASS_SCORE = 75;
/** Sending chicken back out unsafe can never pass, as in the real scoring. */
const BREACH_MAX_SCORE = 40;

export const MOOD_LABEL: Record<DemoMood, string> = {
  1: "Fuming",
  2: "Annoyed",
  3: "Neutral",
  4: "Happy",
  5: "Delighted",
};
export const SPEED_LABEL: Record<DemoMood, string> = {
  1: "Stalled",
  2: "Slow",
  3: "Steady",
  4: "Quick",
  5: "Flying",
};
export const SAFETY_LABEL: Record<DemoMood, string> = {
  1: "Unsafe",
  2: "At risk",
  3: "Watch it",
  4: "Mostly safe",
  5: "Safe",
};

const clamp = (n: number) => Math.min(5, Math.max(1, n)) as DemoMood;

export type DemoState = {
  mood: DemoMood;
  speed: DemoMood;
  safety: DemoMood;
  /** Money item ids that have happened, in order. */
  money: string[];
};

export const START_STATE: DemoState = {
  mood: DEMO_GUEST.startMood,
  speed: DEMO_GUEST.startSpeed,
  safety: DEMO_GUEST.startSafety,
  money: [],
};

export function applyChoice(state: DemoState, choice: DemoChoice): DemoState {
  return {
    mood: clamp(state.mood + choice.moodDelta),
    speed: clamp(state.speed + choice.speedDelta),
    safety: choice.safetyTo ?? state.safety,
    money: [...state.money, ...choice.money.filter((id) => !state.money.includes(id))],
  };
}

export function moneyTotal(ids: string[]): number {
  return ids.reduce((sum, id) => sum + (DEMO_GUEST.money.find((m) => m.id === id)?.dollars ?? 0), 0);
}

/** capped: the safety cap brought the score down. */
export function scoreChoices(
  choices: DemoChoice[],
  end: DemoState,
): { score: number; passed: boolean; capped: boolean } {
  const average = Math.round(choices.reduce((sum, c) => sum + c.points, 0) / choices.length);
  const capped = end.safety <= 2 && average > BREACH_MAX_SCORE;
  const score = capped ? BREACH_MAX_SCORE : average;
  return { score, passed: score >= PASS_SCORE, capped };
}

/** The calms found across the conversation, each once, in the brief's order. */
export function calmsFound(choices: DemoChoice[]): string[] {
  const found = new Set(choices.flatMap((c) => c.helped));
  return DEMO_GUEST.calms.filter((c) => found.has(c));
}

/** Each reply's calms that no earlier reply had found, as the app's reveal lists them. */
export function newCalmsByTurn(choices: DemoChoice[]): string[][] {
  const seen = new Set<string>();
  return choices.map((c) => {
    const fresh = c.helped.filter((h) => !seen.has(h));
    fresh.forEach((h) => seen.add(h));
    return fresh;
  });
}
