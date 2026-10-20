// Module 29, Docket Reading: the Learn cards shown before the quiz,
// written from the module's True/False statements (lib/verify-questions.ts).
// `concepts` names the statements each card teaches.
//
// Approved by the owner on 2026-10-19 (cards batch 4). Review copy:
// docs/Rich Update/cards-batch-4-service-b.md.
import type { LearnCard } from "@/lib/learn-cards";

export const MODULE_29_CARDS: LearnCard[] = [
  {
    id: "c1",
    concepts: ["s0", "s3"],
    title: "Know your docket codes",
    rule: "Learn your venue's docket codes. M/R commonly means medium rare, and G/F gluten free.",
    why: "Systems differ. Misreading a code means the wrong steak, or a missed allergy.",
    reviewed: true,
  },
  {
    id: "c2",
    concepts: ["s1", "s7"],
    title: "No note isn't a guarantee",
    rule: "No allergy note doesn't mean no allergy. Check any handwritten note you can't read with the server.",
    why: "Guests forget to mention allergies, and handwritten notes often carry them. If you're unsure, ask.",
    reviewed: true,
  },
  {
    id: "c3",
    concepts: ["s2", "s5"],
    title: "Keep dockets in order",
    rule: "Work dockets in the order they printed. Only a manager changes that order.",
    why: "The printer queue is the order guests ordered in. Skipping ahead makes tables wait unfairly and sends dishes to the wrong table.",
    reviewed: true,
  },
  {
    id: "c4",
    concepts: ["s4"],
    title: "Sold out means gone",
    rule: "When the kitchen says an item is sold out (a docket or note may say OFF), tell the floor staff straight away.",
    why: "Every server needs to know before they take another order for it.",
    reviewed: true,
  },
  {
    id: "c5",
    concepts: ["s6"],
    title: "Call the table at the pass",
    rule: "Call the table number when food goes up on the pass: \"Table 7 away!\"",
    why: "The runner collects it straight away, so the food reaches the guest hot.",
    reviewed: true,
  },
];
