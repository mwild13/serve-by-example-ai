// Module 30, Beating the Weed: the Learn cards shown before the quiz,
// written from the module's True/False statements (lib/verify-questions.ts).
// `concepts` names the statements each card teaches.
//
// Approved by the owner on 2026-10-19 (cards batch 4). Review copy:
// docs/Rich Update/cards-batch-4-service-b.md.
import type { LearnCard } from "@/lib/learn-cards";

export const MODULE_30_CARDS: LearnCard[] = [
  {
    id: "c1",
    concepts: ["s0"],
    title: "Everyone gets in the weed",
    rule: "\"In the weed\" means completely overwhelmed in a rush. It happens to everyone.",
    why: "What matters is knowing how to work your way out, step by step.",
    reviewed: true,
  },
  {
    id: "c2",
    concepts: ["s1", "s2"],
    title: "Slow down and keep talking",
    rule: "Don't speed up and go quiet. Acknowledge every waiting guest: \"With you in a moment.\"",
    why: "Rushing causes mistakes, and silence makes guests angrier. Being acknowledged resets their patience.",
    reviewed: true,
  },
  {
    id: "c3",
    concepts: ["s4", "s5"],
    title: "Pause, then work in order",
    rule: "Take a short pause to pick the two or three most important jobs, then work the tickets in the order they came in.",
    why: "Slow is smooth, and smooth is fast. Working in order beats scrambling.",
    reviewed: true,
  },
  {
    id: "c4",
    concepts: ["s3", "s6"],
    title: "Call for help early",
    rule: "Don't take on extra tables when you're overwhelmed. Ask a teammate for help early.",
    why: "An overloaded section makes every table suffer. Calling for backup early is good self-awareness.",
    reviewed: true,
  },
  {
    id: "c5",
    concepts: ["s7"],
    title: "Keep the stress off the floor",
    rule: "Stay calm in front of guests, even when you're flat out.",
    why: "Visible stress makes guests uncomfortable and less likely to come back.",
    reviewed: true,
  },
];
