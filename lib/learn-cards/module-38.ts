// Module 38, Clearing Dead Soldiers: the Learn cards shown before the quiz,
// written from the module's True/False statements (lib/verify-questions.ts).
// `concepts` names the statements each card teaches.
//
// Approved by the owner on 2026-10-19 (cards batch 4). Review copy:
// docs/Rich Update/cards-batch-4-service-b.md.
import type { LearnCard } from "@/lib/learn-cards";

export const MODULE_38_CARDS: LearnCard[] = [
  {
    id: "c1",
    concepts: ["s0", "s3"],
    title: "Clear dead soldiers",
    rule: "An empty glass or bottle on a table is a dead soldier. Clear it without asking.",
    why: "Clearing finished glasses is part of normal service, and it doesn't need the guest's permission.",
    reviewed: true,
  },
  {
    id: "c2",
    concepts: ["s1", "s7"],
    title: "Pre-bus as you go",
    rule: "Clear each finished glass and side plate as soon as it's done, not when the whole table has finished.",
    why: "Pre-bussing is standard service. The table stays clean all the way through.",
    reviewed: true,
  },
  {
    id: "c3",
    concepts: ["s2", "s6"],
    title: "Never walk back empty-handed",
    rule: "Every trip to the back clears something. Carry a full load of glasses in one pass.",
    why: "Fewer trips means more time on the floor.",
    reviewed: true,
  },
  {
    id: "c4",
    concepts: ["s4", "s5"],
    title: "A clean table feels cared for",
    rule: "Keep tables cleared and reset. It doesn't tell guests to leave.",
    why: "A clutter of empties feels like neglect. Only an early bill or hovering pressures guests to go.",
    reviewed: true,
  },
];
