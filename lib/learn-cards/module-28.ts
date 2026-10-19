// Module 28, Mid-Shift Reset: the Learn cards shown before the quiz,
// written from the module's True/False statements (lib/verify-questions.ts).
// `concepts` names the statements each card teaches.
//
// Draft for the owner's review (cards batch 2). Review copy:
// docs/Rich Update/cards-batch-2-bartending-b.md.
import type { LearnCard } from "@/lib/learn-cards";

export const MODULE_28_CARDS: LearnCard[] = [
  {
    id: "c1",
    concepts: ["s0", "s4"],
    title: "Everything in its place",
    rule: "Have everything set up where it belongs before service starts, and keep it that way.",
    why: "Your setup decides how service goes. A tidy, stocked station shows your team you're in control.",
    reviewed: false,
  },
  {
    id: "c2",
    concepts: ["s1", "s3", "s7"],
    title: "Restock in the lulls",
    rule: "Restock in the short quiet gaps between waves, not just once at the start of the shift.",
    why: "Stations run down fast. The quiet after a wave is your chance to be ready before the next one arrives.",
    reviewed: false,
  },
  {
    id: "c3",
    concepts: ["s2"],
    title: "Never run out of garnish",
    rule: "Keep garnishes topped up so you never have to search for a lime mid-order.",
    why: "A bartender hunting for garnish in a rush shows the whole room the station wasn't ready.",
    reviewed: false,
  },
  {
    id: "c4",
    concepts: ["s5"],
    title: "Ask for cover",
    rule: "If you need to restock, ask a teammate to cover you for a moment.",
    why: "Quick cover is good teamwork. Struggling on silently until you run out is what breaks service.",
    reviewed: false,
  },
  {
    id: "c5",
    concepts: ["s6"],
    title: "Top up the ice",
    rule: "Check and top up the ice in every quiet moment.",
    why: "Running low on ice mid-rush is one of the most common problems behind a bar, and one of the easiest to avoid.",
    reviewed: false,
  },
];
