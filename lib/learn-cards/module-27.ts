// Module 27, Two-Handed Flow: the Learn cards shown before the quiz,
// written from the module's True/False statements (lib/verify-questions.ts).
// `concepts` names the statements each card teaches.
//
// Approved by the owner on 2026-10-19 (cards batch 2). Review copy:
// docs/Rich Update/cards-batch-2-bartending-b.md.
import type { LearnCard } from "@/lib/learn-cards";

export const MODULE_27_CARDS: LearnCard[] = [
  {
    id: "c1",
    concepts: ["s0", "s2"],
    title: "Both hands working",
    rule: "Keep both hands busy on the same drink: grab the glass with one while the other works the gun.",
    why: "An idle hand is dead time. Pairing actions is the heart of two-handed service.",
    reviewed: true,
  },
  {
    id: "c2",
    concepts: ["s1", "s5"],
    title: "Move less, not faster",
    rule: "Experts don't rush. They cut out steps and pair up actions on purpose.",
    why: "Rushing and juggling too many jobs causes mistakes. Planned double actions are what make you quick.",
    reviewed: true,
  },
  {
    id: "c3",
    concepts: ["s3"],
    title: "Prep garnishes first",
    rule: "Cut and set up your garnishes before service starts.",
    why: "Fumbling with a knife in a rush is slow and unsafe. With your mise en place done, it's ready when you need it.",
    reviewed: true,
  },
  {
    id: "c4",
    concepts: ["s4", "s6"],
    title: "No wasted trips",
    rule: "Never walk anywhere empty-handed, and line up the next glass before the first is finished.",
    why: "A forgotten item means a second trip. Lining up the next glass saves a reach that adds up over hundreds of drinks.",
    reviewed: true,
  },
  {
    id: "c5",
    concepts: ["s7"],
    title: "Practise when it's quiet",
    rule: "Use the same efficient habits in quiet periods, not just in a rush.",
    why: "Habits practised when it's calm become automatic when the pressure hits.",
    reviewed: true,
  },
];
