// Module 16, Food Safety: the Learn cards shown before the quiz,
// written from the module's True/False statements (lib/verify-questions.ts).
// `concepts` names the statements each card teaches.
//
// Draft for the owner's review (cards batch 5). Review copy:
// docs/Rich Update/cards-batch-5-compliance-a.md.
import type { LearnCard } from "@/lib/learn-cards";

export const MODULE_16_CARDS: LearnCard[] = [
  {
    id: "c1",
    concepts: ["s0"],
    title: "Coeliac means separate gear",
    rule: "For a coeliac guest, use completely separate preparation equipment.",
    why: "Even a crumb of gluten on a shared board can put a coeliac guest in hospital.",
    reviewed: false,
  },
  {
    id: "c2",
    concepts: ["s1", "s3"],
    title: "Keep raw meat apart",
    rule: "Store raw chicken on the bottom shelf, and never use the same tongs for raw and cooked meat.",
    why: "Raw juices that drip down or ride on tongs spread bacteria like salmonella onto ready-to-eat food.",
    reviewed: false,
  },
  {
    id: "c3",
    concepts: ["s2", "s5"],
    title: "Out of the danger zone",
    rule: "Keep food out of the danger zone, 5°C to 60°C. Thaw in the fridge or under cold running water, never on the bench.",
    why: "Bacteria multiply fast between 5°C and 60°C. Bench thawing leaves the outside of the food there for hours.",
    reviewed: false,
  },
  {
    id: "c4",
    concepts: ["s4"],
    title: "Twenty seconds",
    rule: "Wash your hands with soap and water for at least 20 seconds.",
    why: "A quick rinse doesn't kill germs. It's the time and the rubbing that do.",
    reviewed: false,
  },
  {
    id: "c5",
    concepts: ["s6"],
    title: "Label and date",
    rule: "Label and date prepped food, so the oldest is used first.",
    why: "First in, first out cuts waste and stops old food being served.",
    reviewed: false,
  },
  {
    id: "c6",
    concepts: ["s7"],
    title: "Blue band-aids",
    rule: "Cover cuts in the kitchen with a blue band-aid.",
    why: "Blue doesn't occur naturally in food, so you'll see it straight away if it falls off.",
    reviewed: false,
  },
];
