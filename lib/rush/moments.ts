// Saturday Rush moments (Rich update, Phase 15): the situations a shift is
// made of. Each one is written to a principle a good Australian bartender
// works by (acknowledge the queue, start the Guinness first, burn the ice
// well, refuse service kindly), not to one venue's way of doing things. The
// drinks, numbers and the order of the choices change every run.
//
// Effects are on the engine's 0 to 100 meters (lib/rush/engine.ts). A rough
// guide: the best call +4 to +10 where it matters, an ok call small, a poor
// call -4 to -10, and "breach" for the rules that can't be broken (serving
// someone intoxicated, scooping around broken glass), which caps the score.
// Calling the bar-back is a button, not a moment (lib/rush/engine.ts), so
// "call before you run out" is learnt by running out.
// Owner's review sheet: docs/Rich Update/saturday-rush-moments.md.

import type { Choice, MomentKind, RushState } from "@/lib/rush/engine";
import { between, pick, type Rng } from "@/lib/rush/random";

export type MomentTemplate = {
  id: string;
  kind: MomentKind;
  /** How often it comes up against the others (default 1). */
  weight?: number;
  /** Only offered when this is true. */
  when?: (s: RushState) => boolean;
  /** Comes up next whenever this is true (once a shift). */
  forced?: (s: RushState) => boolean;
  make: (rng: Rng, s: RushState) => { situation: string; choices: Choice[]; why: string };
};

const BEERS = ["lager", "pale ale", "the local XPA", "mid-strength"];
const SHAKEN = ["Espresso Martini", "Margarita", "Whisky Sour", "Cosmopolitan"];
const SPRITZ = ["Aperol Spritz", "Limoncello Spritz", "Hugo Spritz"];
const SPIRIT_MIXERS = ["vodka soda", "rum and Coke", "gin and tonic", "bourbon and Coke"];

function waiting(s: RushState): string {
  return s.queue <= 1 ? "one person is waiting" : `${s.queue} people are waiting`;
}

export const MOMENTS: MomentTemplate[] = [
  {
    id: "acknowledge-queue",
    kind: "queue",
    weight: 2,
    make: (rng, s) => ({
      situation: `You're halfway through a round of ${between(rng, 3, 5)} schooners of ${pick(rng, BEERS)}. ${waiting(s).replace(/^./, (c) => c.toUpperCase())}, and a guest at the end is waving a card at you.`,
      choices: [
        { text: "Catch their eye, nod, \"With you in a sec\", and finish the round", verdict: "best", effect: { guest: 6, speed: 3, serve: 2 } },
        { text: "Keep your head down and finish the round", verdict: "poor", effect: { guest: -6, serve: 2 } },
        { text: "Leave the round half poured and go to them", verdict: "poor", effect: { guest: -2, speed: -6, waste: 4, serve: 1 } },
        { text: "Call out \"Who's next?\" to the whole bar", verdict: "poor", effect: { guest: -4, speed: -2, serve: 1 } },
      ],
      why: "Acknowledge everyone waiting within a few seconds, even when you can't serve them yet. A nod and \"with you in a sec\" keeps a queue calm and in order; leaving a round half poured slows everyone down.",
    }),
  },
  {
    id: "guinness-first",
    kind: "docket",
    make: (rng) => {
      const beer = pick(rng, BEERS);
      const shaken = pick(rng, SHAKEN);
      return {
        situation: `A docket prints: 1 Guinness, 2 schooners of ${beer}, 1 ${shaken}. What do you start first?`,
        choices: [
          { text: "The Guinness", verdict: "best", effect: { speed: 7, guest: 3, serve: 2 } },
          { text: `The ${shaken}`, verdict: "ok", effect: { speed: 1, serve: 2 } },
          { text: `The schooners of ${beer}`, verdict: "poor", effect: { speed: -4, guest: -3, waste: 3, serve: 2 } },
          { text: "Ask the guest which they want first", verdict: "poor", effect: { speed: -5, serve: 1 } },
        ],
        why: `Start the Guinness: it needs about two minutes to settle before you top it up. Shake the ${shaken} while it settles, and pour the beers last so the head is fresh when they go out.`,
      };
    },
  },
  {
    id: "holds-first",
    kind: "docket",
    make: (rng) => {
      const spritz = pick(rng, SPRITZ);
      const shaken = pick(rng, SHAKEN);
      return {
        situation: `A table's docket: 2 glasses of house white, 2 ${spritz}es, 1 ${shaken} and a middy of ${pick(rng, BEERS)}. What do you make first?`,
        choices: [
          { text: "Pour the two whites", verdict: "best", effect: { speed: 6, guest: 3, serve: 2 } },
          { text: `Shake the ${shaken}`, verdict: "ok", effect: { speed: 2, serve: 2 } },
          { text: `Build the ${spritz}es`, verdict: "poor", effect: { speed: -2, guest: -3, serve: 2 } },
          { text: "Pour the middy", verdict: "poor", effect: { speed: -3, guest: -2, serve: 2 } },
        ],
        why: "Make what holds first and what dies last. Still wine holds, then the shaken drink goes straight out of the shaker, then the bubbles, and the beer last so the head and the fizz are fresh at the table.",
      };
    },
  },
  {
    id: "batch-orders",
    kind: "queue",
    weight: 2,
    when: (s) => s.queue >= 3,
    make: (rng) => {
      const beer = pick(rng, BEERS);
      return {
        situation: `Three deep. The next three guests in a row each want ${beer}: two schooners, then a schooner and a middy, then a jug.`,
        choices: [
          { text: "Take all three orders, then pour them together", verdict: "best", effect: { speed: 8, guest: 3, serve: 3 } },
          { text: "Serve them one at a time, start to finish", verdict: "ok", effect: { speed: 1, serve: 2 } },
          { text: "Pour the jug first because it's the biggest", verdict: "poor", effect: { speed: -2, guest: -4, serve: 2 } },
        ],
        why: "When the bar is three deep, take two or three orders at once and pour like with like. It's how one bartender keeps up. Serve in the order people arrived, not by the size of the order.",
      };
    },
  },
  {
    id: "out-of-ice",
    kind: "stock",
    forced: (s) => s.ice === 0,
    make: (rng, s) => ({
      situation: `The ice well is empty and ${waiting(s)}. The next guest wants a ${pick(rng, SPIRIT_MIXERS)}.`,
      choices: [
        { text: "Call the bar-back for ice, tell the guest it's a minute, and pour beers and wine meanwhile", verdict: "best", effect: { speed: -1, guest: 2, restock: ["ice"], serve: 2 } },
        { text: "Scoop ice from the glass-washer tub with a schooner glass", verdict: "poor", effect: { safety: -15, speed: 2, serve: 2 } },
        { text: "Leave the bar to get it yourself", verdict: "poor", effect: { speed: -8, guest: -6, restock: ["ice"] } },
        { text: "Make it without ice", verdict: "poor", effect: { guest: -6, serve: 1 } },
      ],
      why: "Get the bar-back on it and keep serving what doesn't need ice. Never scoop ice with a glass: it chips, and glass in ice can't be seen. This is why you call for ice when the well is half full.",
    }),
  },
  {
    id: "glasses-low",
    kind: "stock",
    weight: 3,
    when: (s) => s.glasses <= 40,
    make: () => ({
      situation: "You're down to your last few clean schooner glasses. A rack has just come out of the glass washer, too hot to touch.",
      choices: [
        { text: "Ask the bar-back to bring clean glasses, and let the hot rack cool", verdict: "best", effect: { speed: 3, restock: ["glasses"], serve: 1 } },
        { text: "Pour schooners straight into the hot glasses", verdict: "poor", effect: { guest: -5, money: -2, waste: 6, serve: 2, restock: ["glasses"] } },
        { text: "Pour the schooners into pot glasses", verdict: "poor", effect: { guest: -6, money: -4, serve: 2 } },
      ],
      why: "Restock glasses before you run out. Beer poured into a glass hot from the washer foams up and goes flat, and a schooner served in a smaller glass is short measure.",
    }),
  },
  {
    id: "out-of-glasses",
    kind: "stock",
    forced: (s) => s.glasses === 0,
    make: (rng, s) => ({
      situation: `No clean schooner glasses left and ${waiting(s)}, most of them after ${pick(rng, BEERS)}.`,
      choices: [
        { text: "Get the bar-back to run a rack, tell the queue it's a minute, and serve drinks that don't need schooners", verdict: "best", effect: { guest: 1, speed: -2, restock: ["glasses"], serve: 1 } },
        { text: "Rinse used glasses from the bar under the tap", verdict: "poor", effect: { safety: -10, speed: 2, serve: 2 } },
        { text: "Stop serving until the glasses come back", verdict: "poor", effect: { guest: -6, speed: -8, restock: ["glasses"] } },
      ],
      why: "Keep serving what you can and get the glass washer going. A rinse under the tap doesn't sanitise a glass; it has to go through the washer.",
    }),
  },
  {
    id: "intoxicated-round",
    kind: "safety",
    weight: 2,
    make: (rng) => ({
      situation: `A man at the bar is slurring and swaying. He orders ${between(rng, 4, 6)} schooners of ${pick(rng, BEERS)} for himself and his mates.`,
      choices: [
        { text: "Tell him quietly you can't serve him any more tonight, offer him water, and let your supervisor know", verdict: "best", effect: { safety: 12, guest: -2, money: -3 } },
        { text: "Serve the round, it's mostly for his mates", verdict: "breach", effect: { safety: -20, serve: 1 } },
        { text: "Serve this one, then cut him off", verdict: "breach", effect: { safety: -20, serve: 1 } },
        { text: "Pretend you didn't see him and serve someone else", verdict: "poor", effect: { safety: -6, guest: -4, serve: 1 } },
      ],
      why: "It's against the law in every Australian state to sell or supply alcohol to someone who is intoxicated, and that includes a round he'll carry back to his mates. Refuse kindly and quietly, offer water, and tell your supervisor so the team backs you.",
    }),
  },
  {
    id: "check-id",
    kind: "safety",
    weight: 2,
    make: (rng) => ({
      situation: `Two young guests order ${pick(rng, SHAKEN)}s. They both look about 18 or 19, and the queue behind them is growing.`,
      choices: [
        { text: "Ask them both for ID before you make anything", verdict: "best", effect: { safety: 10, speed: -1 } },
        { text: "Make the drinks, then ask for ID when they pay", verdict: "poor", effect: { safety: 2, money: -3, waste: 18, speed: -3 } },
        { text: "Serve them, it's too busy to check", verdict: "breach", effect: { safety: -20, serve: 1 } },
      ],
      why: "Check ID from anyone who looks under 25, before you make the drinks. A rush is when minors try their luck, and selling to a minor brings big fines for you and the venue. Asking first means nothing is wasted if they can't show it.",
    }),
  },
  {
    id: "glass-in-ice",
    kind: "safety",
    when: (s) => s.ice > 0,
    make: () => ({
      situation: "A schooner glass slips out of your hand and breaks over the ice well. You can see a few pieces on top.",
      choices: [
        { text: "Stop, tell the bar it's a minute, empty the well, melt it with hot water and refill it", verdict: "best", effect: { safety: 12, speed: -5, restock: ["ice"] } },
        { text: "Pick out the pieces you can see and keep going", verdict: "breach", effect: { safety: -20, speed: 3, serve: 2 } },
        { text: "Use the other side of the well for now", verdict: "breach", effect: { safety: -20, speed: 2, serve: 2 } },
      ],
      why: "Glass in ice can't be seen. Burn the well every time: stop using it, empty it, melt what's left with hot water, check it, then refill. Scooping around it is how a guest ends up swallowing glass.",
    }),
  },
  {
    id: "wet-floor",
    kind: "safety",
    make: () => ({
      situation: "Someone has knocked a jug of beer over at the end of the bar, right where people walk to the toilets.",
      choices: [
        { text: "Put out a wet floor sign and ask the bar-back to mop it now", verdict: "best", effect: { safety: 8, speed: -1 } },
        { text: "Mop it yourself after this round", verdict: "poor", effect: { safety: -8, serve: 1 } },
        { text: "Throw a bar towel over it", verdict: "poor", effect: { safety: -5 } },
      ],
      why: "A wet floor in a busy walkway is how people get hurt. Deal with it straight away: sign first so people walk around it, then mop. If you can't leave the bar, the bar-back or a floor staff member does it now, not after the round.",
    }),
  },
  {
    id: "squaring-up",
    kind: "safety",
    make: () => ({
      situation: "Two guests at the bar are getting loud and squaring up over who was next.",
      choices: [
        { text: "Step in calmly, say you'll serve them both next, and signal security or your supervisor", verdict: "best", effect: { safety: 8, guest: 3, serve: 2 } },
        { text: "Serve the louder one to settle him down", verdict: "poor", effect: { guest: -5, safety: -5, serve: 1 } },
        { text: "Keep pouring and let them sort it out", verdict: "poor", effect: { safety: -10, guest: -4, serve: 1 } },
      ],
      why: "Calm it early, be fair to both, and get backup before it turns. Serving the louder one first teaches the whole bar that pushing works.",
    }),
  },
  {
    id: "wrong-drink",
    kind: "queue",
    make: (rng) => {
      const pair = pick(rng, [
        ["gin and tonic", "gin and soda"],
        ["vodka soda", "vodka lemonade"],
        ["rum and Coke", "rum and Coke Zero"],
      ]);
      return {
        situation: `A guest comes back with the ${pair[0]} you just made. They say they ordered a ${pair[1]}.`,
        choices: [
          { text: "Apologise and remake it straight away", verdict: "best", effect: { guest: 6, money: -1, waste: 8, serve: 1 } },
          { text: `Tell them they said ${pair[0]}`, verdict: "poor", effect: { guest: -10 } },
          { text: "Top it up with what they wanted", verdict: "poor", effect: { guest: -6, serve: 1 } },
        ],
        why: "In a rush, never argue over a drink. Say sorry and remake it at once: a few dollars of spirit costs far less than a guest who tells their mates about it. Read the order back next time, and it won't happen.",
      };
    },
  },
  {
    id: "eighty-sixed",
    kind: "sales",
    make: (rng) => {
      const [item, verb, reason, instead] = pick(rng, [
        ["Espresso Martinis", "are", "the coffee machine is down", "a White Russian"],
        ["the lager on tap", "is", "the keg's empty and there isn't a spare", "the pale ale on tap"],
        ["the house Shiraz", "is", "it's sold out", "the Grenache, a similar style"],
      ]);
      return {
        situation: `${item.replace(/^./, (c) => c.toUpperCase())} ${verb} off tonight: ${reason}. The next guest orders two.`,
        choices: [
          { text: `Tell them straight away it's off, and suggest ${instead}`, verdict: "best", effect: { guest: 4, money: 2, serve: 1, extra: 4 } },
          { text: "Ring it up and work it out after", verdict: "poor", effect: { guest: -6, speed: -3 } },
          { text: "Say it'll be a long wait", verdict: "poor", effect: { guest: -4, money: -3 } },
        ],
        why: "When something is off for the night, tell the guest before they pay, with an alternative in the same style, and the sale isn't lost.",
      };
    },
  },
  {
    id: "upsell-when-quiet",
    kind: "sales",
    when: (s) => s.queue <= 3,
    make: (rng) => {
      const drink = pick(rng, SPIRIT_MIXERS);
      return {
        situation: `It's eased off for a moment and only a couple of people are waiting. A guest orders a ${drink}.`,
        choices: [
          { text: "Suggest the premium spirit in it, a few dollars more", verdict: "best", effect: { money: 4, guest: 2, serve: 1, extra: 4 } },
          { text: "Just make it", verdict: "ok", effect: { serve: 1 } },
          { text: "Suggest making it a double", verdict: "poor", effect: { safety: -4, money: 2, serve: 1, extra: 6 } },
        ],
        why: "A quiet moment is when a suggestion lands: offer a better spirit, not more of it. Pushing doubles isn't responsible service, and it's the guest's night, not the till's.",
      };
    },
  },
  {
    id: "no-chat-in-rush",
    kind: "queue",
    when: (s) => s.queue >= 5,
    make: (rng) => ({
      situation: `${between(rng, 6, 9)} people are waiting. A guest orders a house ${pick(rng, ["vodka", "rum", "bourbon", "gin"])} and asks what the difference is between all the brands on the shelf.`,
      choices: [
        { text: "\"Happy to talk you through them when it's quieter,\" make the house one and move on", verdict: "best", effect: { speed: 6, guest: 2, serve: 2 } },
        { text: "Talk them through the range", verdict: "poor", effect: { speed: -7, guest: -4, serve: 1, extra: 4 } },
        { text: "Ignore the question", verdict: "poor", effect: { guest: -4, serve: 1 } },
      ],
      why: "Read the room. Three deep is for quick, friendly service; the long chat about the top shelf is for a quiet moment. Offer to come back to it, so the guest doesn't feel brushed off.",
    }),
  },
  {
    id: "regular-wants-a-chat",
    kind: "queue",
    when: (s) => s.queue >= 4,
    make: () => ({
      situation: "A regular leans on the bar and starts telling you about the footy while the queue builds behind him.",
      choices: [
        { text: "Be friendly, keep it short (\"Tell me after the rush\"), and serve the next guest", verdict: "best", effect: { speed: 5, guest: 3, serve: 2 } },
        { text: "Have the chat, he's a regular", verdict: "poor", effect: { speed: -7, guest: -5 } },
        { text: "Turn away without a word", verdict: "poor", effect: { guest: -4, serve: 2 } },
      ],
      why: "Regulars matter, but so does everyone waiting. A warm, quick \"tell me after the rush\" keeps both.",
    }),
  },
  {
    id: "take-the-load",
    kind: "team",
    make: (rng) => ({
      situation: `You've just cleared your end of the bar. The other bartender is buried in a docket of ${between(rng, 6, 9)} cocktails, and their end is three deep.`,
      choices: [
        { text: "Tell them you'll take half the docket", verdict: "best", effect: { speed: 7, guest: 3, serve: 3 } },
        { text: "Start serving their end of the queue", verdict: "ok", effect: { speed: 3, guest: 2, serve: 2 } },
        { text: "Restock your own station while it's quiet", verdict: "poor", effect: { speed: -3, guest: -3, restock: ["glasses"] } },
      ],
      why: "A bar works as a team. In a rush, take work off whoever's buried, and say what you're taking so you don't both make the same drinks.",
    }),
  },
  {
    id: "keg-foaming",
    kind: "stock",
    make: (rng) => {
      const beer = pick(rng, BEERS);
      return {
        situation: `The ${beer} tap starts spitting foam, with ${between(rng, 3, 5)} schooners of it still to pour.`,
        choices: [
          { text: "Stop pouring, get the keg changed, and offer the guest another beer in the meantime", verdict: "best", effect: { speed: 2, guest: 3, money: 2, serve: 2 } },
          { text: "Keep pouring and tip the foam off", verdict: "poor", effect: { money: -4, speed: -5, waste: 12, serve: 2 } },
          { text: "Pour them anyway and serve them with a big head", verdict: "poor", effect: { guest: -6, serve: 2 } },
        ],
        why: "A tap spitting foam usually means the keg is empty or the gas has run out. Don't pour beer down the sink: offer another beer and get the keg changed (or tell whoever does it).",
      };
    },
  },
];
