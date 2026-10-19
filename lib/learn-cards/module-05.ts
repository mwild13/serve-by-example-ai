// Module 5, Tray Carrying: the Learn cards shown before the quiz,
// written from the module's True/False statements (lib/verify-questions.ts).
// `concepts` names the statements each card teaches.
//
// Approved by the owner on 2026-10-19 (cards batch 1). Review copy:
// docs/Rich Update/cards-batch-1-bartending-a.md.
import type { LearnCard } from "@/lib/learn-cards";

export const MODULE_5_CARDS: LearnCard[] = [
  {
    id: "c1",
    concepts: ["s0"],
    title: "Eyes up",
    rule: "Look where you're walking, not at the drinks.",
    why: "Watching the glasses throws off your balance. Eyes up lets you move through the guests safely.",
    reviewed: true,
  },
  {
    id: "c2",
    concepts: ["s1"],
    title: "Heavy glasses in the middle",
    rule: "Put the heaviest glasses, like schooners, in the centre of the tray.",
    why: "Weight in the middle keeps the tray's balance point low and steady.",
    reviewed: true,
  },
  {
    id: "c3",
    concepts: ["s2", "s4", "s6"],
    title: "One hand under, one hand free",
    rule: "Carry the tray on the fingertips of your non-dominant hand. Keep your dominant hand free.",
    why: "Fingertips make small balance corrections. The free hand opens doors, moves chairs and protects the tray from bumps.",
    reviewed: true,
  },
  {
    id: "c4",
    concepts: ["s5"],
    title: "Drinks trays carry drinks",
    rule: "Never clear plates onto a drinks tray.",
    why: "Food scraps make the tray unstable and dirty the clean glasses beside them.",
    reviewed: true,
  },
  {
    id: "c5",
    concepts: ["s3"],
    title: "Never by the rim",
    rule: "Carry stemmed glasses by the stem or the base, never by the rim.",
    why: "Fingers on the rim are unhygienic and leave marks right where the guest drinks.",
    reviewed: true,
  },
  {
    id: "c6",
    concepts: ["s7"],
    title: "Unload evenly",
    rule: "Take glasses off from the outside edges, evenly from both sides.",
    why: "Unload one side only and the weight shifts, and the tray can flip.",
    reviewed: true,
  },
];
