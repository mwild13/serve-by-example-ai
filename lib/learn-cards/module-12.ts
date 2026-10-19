// Module 12, Suggestive Selling: the Learn cards shown before the quiz,
// written from the module's True/False statements (lib/verify-questions.ts).
// `concepts` names the statements each card teaches.
//
// Draft for the owner's review (cards batch 3). Review copy:
// docs/Rich Update/cards-batch-3-service-a.md.
import type { LearnCard } from "@/lib/learn-cards";

export const MODULE_12_CARDS: LearnCard[] = [
  {
    id: "c1",
    concepts: ["s0", "s4"],
    title: "Suggest a step up",
    rule: "Suggest a better option: a premium local gin instead of the house pour, or a pint instead of a schooner.",
    why: "Moving a guest to a better product is up-selling. It's easy when it's a genuine suggestion.",
    reviewed: false,
  },
  {
    id: "c2",
    concepts: ["s2", "s3"],
    title: "Suggest what goes with it",
    rule: "Suggest a side with a main, or a wine that suits the dish.",
    why: "Pairing things that go together makes the meal better and lifts the table's spend.",
    reviewed: false,
  },
  {
    id: "c3",
    concepts: ["s1", "s5"],
    title: "Help, don't push",
    rule: "Up-sell when it improves the guest's experience. Never push the most expensive item.",
    why: "A good suggestion gives the guest something they enjoy more. Hard selling destroys trust.",
    reviewed: false,
  },
  {
    id: "c4",
    concepts: ["s6"],
    title: "Drinks while they read the menu",
    rule: "Suggest a drink, like a cocktail, while guests are still reading the menu.",
    why: "Drinks on the table early keep guests happy while they decide.",
    reviewed: false,
  },
  {
    id: "c5",
    concepts: ["s7"],
    title: "Know the menu",
    rule: "Know what's on the menu and what it tastes like.",
    why: "You can't recommend a craft beer you've never tried. Knowing the product makes suggestions feel natural.",
    reviewed: false,
  },
];
