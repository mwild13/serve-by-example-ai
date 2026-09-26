/**
 * demo-scenarios.ts – Scenarios graded by the public /api/demo/evaluate route.
 *
 * Clients send a scenario id and the route looks the text up here, so an
 * anonymous caller can't submit their own "scenario" and use the demo as a
 * general-purpose model proxy. The Complaint Master and /demo pages import
 * their display text from here too, so what's shown is what's graded.
 *
 * See docs/handoff/security/2026-09-26-ai-token-abuse-and-request-races.md.
 */

export type ComplaintScenario = {
  id: string;
  title: string;
  situation: string;
  guestLine: string;
};

export const COMPLAINT_SCENARIOS: readonly ComplaintScenario[] = [
  {
    id: "wrong-order",
    title: "Wrong order delivered",
    situation:
      "A table of four has been waiting 35 minutes. When the food arrives, one guest's steak is cooked well-done instead of medium-rare as ordered. The guest is visibly annoyed.",
    guestLine:
      '"This isn\'t what I ordered. I specifically asked for medium-rare and this is completely overcooked. This is ridiculous."',
  },
  {
    id: "long-wait",
    title: "Excessive wait at the bar",
    situation:
      "A guest has been waiting at the bar for nearly 10 minutes on a moderately busy Friday evening. They are now flagging you down with clear frustration.",
    guestLine:
      '"Excuse me, I\'ve been standing here for ages. Does anyone actually work at this bar?"',
  },
  {
    id: "noisy-neighbours",
    title: "Disruptive table nearby",
    situation:
      "A couple has approached you quietly to complain that the table next to them has been excessively loud and rude throughout their dinner, affecting their experience.",
    guestLine:
      '"We came here for a nice evening and those people have ruined it. We\'re really not happy and we feel like nothing has been done about it."',
  },
];

/** /demo page prompts, keyed by its module id. */
export const DEMO_PROMPTS = {
  bartending:
    "A guest approaches the bar while you are finishing another drink. How do you acknowledge them?",
  sales:
    "A guest asks what cocktail you would recommend with their steak. How do you respond?",
  management:
    "A staff member calls in sick 30 minutes before a busy Friday shift. What do you do next?",
} as const;

const GRADED_SCENARIOS = new Map<string, string>([
  ...COMPLAINT_SCENARIOS.map(
    (s): [string, string] => [s.id, `${s.situation}\n\nGuest says: ${s.guestLine}`],
  ),
  ...Object.entries(DEMO_PROMPTS),
]);

/** Returns the scenario text to grade for a demo scenario id, or undefined if unknown. */
export function getDemoScenario(id: unknown): string | undefined {
  return typeof id === "string" ? GRADED_SCENARIOS.get(id) : undefined;
}
