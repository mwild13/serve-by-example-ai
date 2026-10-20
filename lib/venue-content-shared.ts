// Venue content (Rich update, Phase 11): types and labels shared by the
// Manager Console's Venue Content tab and the server. No answer keys here
// beyond what a manager approving a question needs to see.
// Server side: lib/venue-content.ts.

export const VENUE_CONTENT_KINDS = ["spec", "special", "product", "eighty_six", "note"] as const;
export type VenueContentKind = (typeof VENUE_CONTENT_KINDS)[number];

export const VENUE_CONTENT_KIND_LABEL: Record<VenueContentKind, string> = {
  spec: "Cocktail or drink spec",
  special: "Special",
  product: "New product or tap",
  eighty_six: "Sold out or off",
  note: "Other venue note",
};

/** What to write, by kind. Shown under the details box. */
export const VENUE_CONTENT_KIND_HINT: Record<VenueContentKind, string> = {
  spec: "The build: each ingredient and measure, the glass, the ice, the garnish, and how it's made.",
  special: "What it is, the price, which days, and anything staff should say about it.",
  product: "What it is, where it's from, how it tastes, how it's served and what it pairs with.",
  eighty_six: "What's off, until when, and what staff should offer instead.",
  note: "The practice in your venue that staff should know, in a few sentences.",
};

export const VENUE_CONTENT_TITLE_MAX = 120;
export const VENUE_CONTENT_DETAILS_MAX = 2000;

export type VenueQuestionStatus = "draft" | "approved" | "rejected";

/** One drafted question as the manager reviews it, with the answer shown. */
export type VenueQuestionView = {
  id: string;
  status: VenueQuestionStatus;
  formatLabel: string;
  prompt: string;
  /** Options or steps, in order. Steps are in the right order. */
  choices: string[];
  /** The right answer, as text. */
  answer: string;
  explanation: string;
};

export type VenueItemView = {
  id: string;
  kind: VenueContentKind;
  title: string;
  details: string;
  /** ISO date (yyyy-mm-dd) or null. */
  endsOn: string | null;
  /** True once ends_on has passed. Its questions are out of drills. */
  ended: boolean;
  createdAt: string;
  questions: VenueQuestionView[];
};
