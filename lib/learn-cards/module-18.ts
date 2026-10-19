// Module 18, Evacuation Protocols: the Learn cards shown before the quiz,
// written from the module's True/False statements (lib/verify-questions.ts).
// `concepts` names the statements each card teaches.
//
// Draft for the owner's review (cards batch 5). Review copy:
// docs/Rich Update/cards-batch-5-compliance-a.md.
import type { LearnCard } from "@/lib/learn-cards";

export const MODULE_18_CARDS: LearnCard[] = [
  {
    id: "c1",
    concepts: ["s0"],
    title: "Know your assembly point",
    rule: "Know where your venue's assembly point is. It's a safe distance from the building, never inside.",
    why: "In an emergency there's no time to work it out, and everyone needs to be clear of the building.",
    reviewed: false,
  },
  {
    id: "c2",
    concepts: ["s1", "s5"],
    title: "Leave everything behind",
    rule: "Tell guests to leave their drinks, and leave your own things. Go when the alarm sounds.",
    why: "Drinks spill on stairs and stop people holding the handrails. Bags can be replaced; people can't.",
    reviewed: false,
  },
  {
    id: "c3",
    concepts: ["s2", "s6"],
    title: "Stairs, not lifts. Exits clear",
    rule: "Use the fire stairs, never the lifts, and never block a fire exit with chairs or stock.",
    why: "Lifts can fail or open onto the fire. A blocked exit can cause a deadly crush.",
    reviewed: false,
  },
  {
    id: "c4",
    concepts: ["s3", "s4"],
    title: "Follow the fire warden",
    rule: "The fire warden is in charge until the fire brigade arrives. Check the bathrooms only if it's safe and the warden says so.",
    why: "The warden outranks the manager in an emergency. Bathrooms are where people most often miss the alarm.",
    reviewed: false,
  },
  {
    id: "c5",
    concepts: ["s7"],
    title: "Walk, don't run",
    rule: "Walk quickly and calmly, and tell guests clearly to do the same.",
    why: "Running spreads panic through a crowd. Calm, clear instructions keep people moving safely.",
    reviewed: false,
  },
];
