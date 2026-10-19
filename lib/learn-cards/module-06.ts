// Module 6, Sanitation Basics: the Learn cards shown before the quiz,
// written from the module's True/False statements (lib/verify-questions.ts).
// `concepts` names the statements each card teaches.
//
// Draft for the owner's review (cards batch 1). Review copy:
// docs/Rich Update/cards-batch-1-bartending-a.md.
import type { LearnCard } from "@/lib/learn-cards";

export const MODULE_6_CARDS: LearnCard[] = [
  {
    id: "c1",
    concepts: ["s0"],
    title: "Wash your hands after cash",
    rule: "Wash your hands after handling cash, before you touch garnishes or clean glasses.",
    why: "Money is one of the dirtiest things in a venue. Washing stops it spreading to food and drinks.",
    reviewed: false,
  },
  {
    id: "c2",
    concepts: ["s1", "s2"],
    title: "Protect the ice well",
    rule: "Never spray cleaner near the ice well. If spray or broken glass gets into it, melt the whole well.",
    why: "Spray drifts into the ice, and broken glass is invisible in it. Melting the lot with hot water is the only safe fix.",
    reviewed: false,
  },
  {
    id: "c3",
    concepts: ["s3"],
    title: "Bathroom gear stays out",
    rule: "Mops and buckets from the bathrooms never come behind the bar.",
    why: "Cleaning gear is colour-coded so bathroom germs stay out of food and drink areas.",
    reviewed: false,
  },
  {
    id: "c4",
    concepts: ["s4"],
    title: "Sign every spill",
    rule: "Put a wet floor sign on a spill straight away.",
    why: "Slips are the most common injury in a venue. Mark the hazard first, then clean it up.",
    reviewed: false,
  },
  {
    id: "c5",
    concepts: ["s5"],
    title: "Sanitise, don't just rinse",
    rule: "Clean food prep areas with food-grade sanitiser, not just warm water.",
    why: "Warm water lifts the dirt you can see. Only sanitiser kills the bacteria you can't.",
    reviewed: false,
  },
  {
    id: "c6",
    concepts: ["s6", "s7"],
    title: "Drip trays and towels",
    rule: "Flush the beer drip trays with hot water every night, and swap damp bar towels often.",
    why: "Old beer turns to sludge that blocks drains and draws fruit flies. Damp, warm towels breed bacteria.",
    reviewed: false,
  },
];
