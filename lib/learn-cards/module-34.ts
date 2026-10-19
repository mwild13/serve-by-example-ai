// Module 34, Tray & Glass Grip: the Learn cards shown before the quiz,
// written from the module's True/False statements (lib/verify-questions.ts).
// `concepts` names the statements each card teaches.
//
// Draft for the owner's review (cards batch 2). Review copy:
// docs/Rich Update/cards-batch-2-bartending-b.md.
import type { LearnCard } from "@/lib/learn-cards";

export const MODULE_34_CARDS: LearnCard[] = [
  {
    id: "c1",
    concepts: ["s0"],
    title: "Hands off the rim",
    rule: "Never touch the rim or the inside of a glass.",
    why: "That's where the guest drinks from. Fingers there spread bacteria, and guests notice.",
    reviewed: false,
  },
  {
    id: "c2",
    concepts: ["s1"],
    title: "Don't stack glasses",
    rule: "Never carry glasses stacked inside each other.",
    why: "They lock together, and pulling them apart snaps the rims.",
    reviewed: false,
  },
  {
    id: "c3",
    concepts: ["s2", "s3"],
    title: "Use the pinch",
    rule: "Carry several glasses at once with the pinch: each held by the base between two fingers and a thumb.",
    why: "It's steady, keeps your fingers off the rims and saves trips. One glass at a time is too slow on the floor.",
    reviewed: false,
  },
  {
    id: "c4",
    concepts: ["s4"],
    title: "Stems for wine",
    rule: "Carry wine glasses by the stem.",
    why: "A hand on the bowl warms chilled wine and leaves smudges the guest can see.",
    reviewed: false,
  },
  {
    id: "c5",
    concepts: ["s5", "s6"],
    title: "Heavy in the middle, dry before carrying",
    rule: "Put heavy glasses in the centre of a tray, and let washed glasses drain before you carry them.",
    why: "Weight in the centre keeps the tray steady. Wet glass slips out of your grip.",
    reviewed: false,
  },
  {
    id: "c6",
    concepts: ["s7"],
    title: "Plates and glasses apart",
    rule: "Never carry plates and glasses in the same hand.",
    why: "Food gets onto the glasses, and the two loads pull against each other.",
    reviewed: false,
  },
];
