import { TOTAL_CHALLENGES } from "@/lib/challenges";

// The Challenges games as data: one entry per challenge, its index the one
// user_challenges.challenge_index stores (docs/CHALLENGES.md). The desktop
// page renders all of them; on mobile, 0 to 4 keep their own screens and 5
// onwards open /mobile/challenge/<slug>. Indexes never change once shipped,
// because completions are saved against them.

export type ChallengeArea = "bar" | "service" | "safety";

export const CHALLENGE_AREA_LABEL: Record<ChallengeArea, string> = {
  bar: "Behind the bar",
  service: "Service and sales",
  safety: "Safety and compliance",
};

export type ChallengeKind = "sequence" | "fill" | "match" | "spot" | "choice";

export const CHALLENGE_KIND_LABEL: Record<ChallengeKind, string> = {
  sequence: "Put in order",
  fill: "Fill the blanks",
  match: "Match the pairs",
  spot: "Spot the mistake",
  choice: "Your call",
};

type Base = {
  index: number;
  slug: string;
  title: string;
  /** One line on the challenge list. */
  pitch: string;
  area: ChallengeArea;
  prompt: string;
  /** Shown once it's answered, right or wrong. */
  explanation: string;
};

export type SequenceChallenge = Base & {
  kind: "sequence";
  /** In the right order; the game shows them in `shuffled` order. */
  steps: { id: string; text: string }[];
  shuffled: string[];
};

export type FillChallenge = Base & {
  kind: "fill";
  /** Text around the blanks: always one more part than answers. */
  parts: string[];
  answers: string[];
  bank: string[];
};

export type MatchChallenge = Base & {
  kind: "match";
  leftLabel: string;
  rightLabel: string;
  pairs: { left: string; right: string }[];
  /** The right-hand column's order, as indexes into `pairs`. */
  rightOrder: number[];
};

export type SpotChallenge = Base & {
  kind: "spot";
  cardTitle: string;
  lines: { id: string; text: string; wrong?: boolean }[];
};

export type ChoiceChallenge = Base & {
  kind: "choice";
  options: { id: string; text: string; correct?: boolean }[];
};

export type Challenge = SequenceChallenge | FillChallenge | MatchChallenge | SpotChallenge | ChoiceChallenge;

export const CHALLENGE_LIST: Challenge[] = [
  {
    index: 0,
    slug: "three-drink-order",
    kind: "sequence",
    area: "bar",
    title: "Three drinks, one order",
    pitch: "A Guinness, a Margarita and a Pinot Grigio land at once. What goes first?",
    prompt: "A Guinness, a Margarita and a Pinot Grigio arrive together. Tap the steps in the order you'd do them.",
    steps: [
      { id: "guinness-start", text: "Start the Guinness pour" },
      { id: "margarita", text: "Build the Margarita" },
      { id: "wine", text: "Pour the Pinot Grigio" },
      { id: "guinness-top", text: "Top up the Guinness" },
    ],
    shuffled: ["margarita", "wine", "guinness-start", "guinness-top"],
    explanation:
      "Guinness is a two-stage pour and needs time to settle, so start it first. Build the other drinks while it settles, then top it up last.",
  },
  {
    index: 1,
    slug: "daiquiri-spec",
    kind: "fill",
    area: "bar",
    title: "The Classic Daiquiri",
    pitch: "Rebuild the spec from memory, down to the glass.",
    prompt: "Fill in the Classic Daiquiri. Tap a blank, then a word.",
    parts: ["A Classic Daiquiri is ", " white rum, ", " fresh lime juice and ", " sugar syrup, shaken and served in a ", "."],
    answers: ["60ml", "25ml", "15ml", "chilled coupe"],
    bank: ["25ml", "60ml", "30ml", "15ml", "highball", "chilled coupe", "rocks glass", "20ml"],
    explanation:
      "60ml white rum, 25ml fresh lime juice and 15ml sugar syrup, shaken hard and served in a chilled coupe. Always fresh lime: bottled juice throws the balance out.",
  },
  {
    index: 2,
    slug: "right-glass",
    kind: "match",
    area: "bar",
    title: "The right glass",
    pitch: "Three classics, three glasses. Put each drink in its glass.",
    prompt: "Pick a drink, then the glass it's served in.",
    leftLabel: "Drink",
    rightLabel: "Glass",
    pairs: [
      { left: "Margarita", right: "Coupe" },
      { left: "Old Fashioned", right: "Rocks glass" },
      { left: "Mojito", right: "Highball" },
    ],
    rightOrder: [2, 0, 1],
    explanation:
      "A shaken, served-up Margarita goes in a coupe, an Old Fashioned over a big cube in a rocks glass, and a Mojito long in a highball with crushed ice.",
  },
  {
    index: 3,
    slug: "daiquiri-card",
    kind: "spot",
    area: "bar",
    title: "What's wrong with this Daiquiri?",
    pitch: "One line on this recipe card would ruin the drink. Find it.",
    prompt: "One line on this recipe card is wrong. Tap it.",
    cardTitle: "Classic Daiquiri",
    lines: [
      { id: "rum", text: "60ml white rum" },
      { id: "lime", text: "25ml bottled lime juice", wrong: true },
      { id: "syrup", text: "15ml sugar syrup" },
      { id: "method", text: "Shake hard with ice, fine strain" },
    ],
    explanation:
      "Bottled lime juice. It carries preservatives and added acid that flatten the drink. A Daiquiri is only as good as its fresh lime.",
  },
  {
    index: 4,
    slug: "lipstick-glass",
    kind: "choice",
    area: "service",
    title: "Lipstick on the glass",
    pitch: "A guest points out a mark on their wine glass. Your move.",
    prompt: "A guest flags you down. Their wine glass has a lipstick mark on the rim. What do you say?",
    options: [
      { id: "a", text: "\"I'll let the bar team know.\"" },
      { id: "b", text: "\"I'm so sorry, let me replace that straight away.\"", correct: true },
      { id: "c", text: "\"That must have been there before. I'll give it a wipe.\"" },
    ],
    explanation:
      "Own it and replace it, glass and wine, straight away. Passing it to someone else or wiping a dirty glass both tell the guest you don't care.",
  },
  {
    index: 5,
    slug: "bottle-service",
    kind: "sequence",
    area: "service",
    title: "Opening a bottle at the table",
    pitch: "Five steps of bottle service. Get them in order.",
    prompt: "A table orders a bottle of red. Tap the steps in the order you'd do them.",
    steps: [
      { id: "present", text: "Show the host the label" },
      { id: "foil", text: "Cut the foil below the lip" },
      { id: "cork", text: "Ease the cork out quietly" },
      { id: "taste", text: "Pour a taste for the host" },
      { id: "pour", text: "Pour for the table, host last" },
    ],
    shuffled: ["taste", "cork", "pour", "present", "foil"],
    explanation:
      "Show the label so the host can check it's the wine they ordered, cut the foil cleanly, open without a pop, and let the host taste before anyone else is poured. The host is served last.",
  },
  {
    index: 6,
    slug: "danger-zone",
    kind: "fill",
    area: "safety",
    title: "The temperature danger zone",
    pitch: "Hot food, cold food and the zone in between.",
    prompt: "Fill in the food safety rule. Tap a blank, then a word.",
    parts: ["Keep cold food at ", " or colder and hot food at ", " or hotter. Food left between the two for more than ", " has to be ", "."],
    answers: ["5°C", "60°C", "4 hours", "thrown out"],
    bank: ["5°C", "10°C", "60°C", "40°C", "2 hours", "4 hours", "thrown out", "chilled again"],
    explanation:
      "5°C and 60°C are the limits. Between them bacteria grow fast. Under 2 hours, refrigerate or use it; 2 to 4 hours, use it now; over 4 hours, it goes in the bin.",
  },
  {
    index: 7,
    slug: "made-from",
    kind: "match",
    area: "bar",
    title: "What it's made from",
    pitch: "Four spirits, four raw materials. Pair them up.",
    prompt: "Pick a spirit, then what it's made from.",
    leftLabel: "Spirit",
    rightLabel: "Made from",
    pairs: [
      { left: "Tequila", right: "Blue Weber agave" },
      { left: "Rum", right: "Sugar cane or molasses" },
      { left: "Bourbon", right: "At least 51% corn" },
      { left: "Single malt Scotch", right: "Malted barley only" },
    ],
    rightOrder: [2, 3, 0, 1],
    explanation:
      "Tequila must be blue Weber agave, rum comes from sugar cane or molasses, bourbon's mash is at least 51% corn, and a single malt Scotch is malted barley alone.",
  },
  {
    index: 8,
    slug: "cutting-off",
    kind: "spot",
    area: "safety",
    title: "Cutting someone off",
    pitch: "A plan for an intoxicated guest. One step breaks the law.",
    prompt: "This is the plan for a guest who has had too much. One step is wrong. Tap it.",
    cardTitle: "Intoxicated guest",
    lines: [
      { id: "stop", text: "Stop serving them alcohol, calmly and privately" },
      { id: "water", text: "Offer water and something to eat" },
      { id: "last", text: "Pour one last drink so they leave happy", wrong: true },
      { id: "manager", text: "Let your manager know" },
      { id: "home", text: "Help them find a safe way home" },
    ],
    explanation:
      "There is no last drink. Serving alcohol to someone who is intoxicated is an offence for you and the venue. Stop, offer water and food, tell your manager, and help them get home safely.",
  },
  {
    index: 9,
    slug: "nut-allergy",
    kind: "choice",
    area: "safety",
    title: "A severe nut allergy",
    pitch: "A guest asks if the pesto pasta is safe. What do you do?",
    prompt: "A guest says they have a severe nut allergy and asks if the pesto pasta is safe for them. What do you do?",
    options: [
      { id: "a", text: "Tell them it should be fine, the pesto is mostly basil" },
      { id: "b", text: "Check with the kitchen, tell the guest exactly what's in it, and mark the allergy on the docket", correct: true },
      { id: "c", text: "Suggest they pick around anything that looks like a nut" },
    ],
    explanation:
      "Never guess. Pesto is often made with pine nuts or cashews. Ask the kitchen every time, give the guest the facts, and flag the allergy on the docket so everyone who touches the plate knows.",
  },
];

if (CHALLENGE_LIST.length !== TOTAL_CHALLENGES) {
  throw new Error(`lib/challenge-content.ts has ${CHALLENGE_LIST.length} challenges but TOTAL_CHALLENGES is ${TOTAL_CHALLENGES}.`);
}

export function challengeBySlug(slug: string): Challenge | undefined {
  return CHALLENGE_LIST.find((c) => c.slug === slug);
}
