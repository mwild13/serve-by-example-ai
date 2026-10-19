// Module 10, Anticipatory Service: the Learn cards shown before the quiz,
// written from the module's True/False statements (lib/verify-questions.ts).
// `concepts` names the statements each card teaches.
//
// Approved by the owner on 2026-10-19 (cards batch 3). Review copy:
// docs/Rich Update/cards-batch-3-service-a.md.
import type { LearnCard } from "@/lib/learn-cards";

export const MODULE_10_CARDS: LearnCard[] = [
  {
    id: "c1",
    concepts: ["s0", "s5"],
    title: "Refill before they ask",
    rule: "Offer the next drink before the first is empty, and top up water without being asked.",
    why: "Guests never go without, and good service feels effortless.",
    reviewed: true,
  },
  {
    id: "c2",
    concepts: ["s1", "s6"],
    title: "Watch without hovering",
    rule: "Keep an eye on every table, so no guest has to flag you down.",
    why: "If a guest has to wave you over, you've missed the moment. Giving privacy means not hovering, not disappearing.",
    reviewed: true,
  },
  {
    id: "c3",
    concepts: ["s2"],
    title: "Solve it before it's a problem",
    rule: "Bring extra napkins or wipes with messy food like wings or ribs.",
    why: "You fix the mess before the guest has to ask.",
    reviewed: true,
  },
  {
    id: "c4",
    concepts: ["s3"],
    title: "Anticipate needs, not orders",
    rule: "Anticipate what guests will need, like water, cutlery or clearing. Don't decide their order for them.",
    why: "Anticipating needs is care. Guessing what they want to eat is pushy.",
    reviewed: true,
  },
  {
    id: "c5",
    concepts: ["s4"],
    title: "Remember your regulars",
    rule: "Learn your regulars and what they usually order.",
    why: "\"The usual?\" makes a guest feel like a VIP and keeps them coming back.",
    reviewed: true,
  },
  {
    id: "c6",
    concepts: ["s7"],
    title: "Dessert menu as plates clear",
    rule: "Offer the dessert menu as you clear the mains.",
    why: "That's when guests decide on dessert or coffee, before they settle on being too full.",
    reviewed: true,
  },
];
