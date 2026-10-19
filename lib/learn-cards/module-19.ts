// Module 19, Opening & Closing: the Learn cards shown before the quiz,
// written from the module's True/False statements (lib/verify-questions.ts).
// `concepts` names the statements each card teaches.
//
// Approved by the owner on 2026-10-19 (cards batch 5). Review copy:
// docs/Rich Update/cards-batch-5-compliance-a.md.
import type { LearnCard } from "@/lib/learn-cards";

export const MODULE_19_CARDS: LearnCard[] = [
  {
    id: "c1",
    concepts: ["s0"],
    title: "Count the float at opening",
    rule: "Count and check the till float when you open.",
    why: "If it's wrong and you don't check, the difference from the night before lands on you.",
    reviewed: true,
  },
  {
    id: "c2",
    concepts: ["s1"],
    title: "The coffee machine is the venue's call",
    rule: "Whether the coffee machine stays on overnight is your venue's rule. Follow it every night.",
    why: "Some machines are built to stay on and some venues switch them off. It's never a personal choice.",
    reviewed: true,
  },
  {
    id: "c3",
    concepts: ["s2", "s4"],
    title: "Wipe the taps, dry the wells",
    rule: "Every night, wipe and plug the beer taps, melt the ice and wipe the wells dry.",
    why: "Sugary residue draws fruit flies, and standing water breeds bacteria overnight.",
    reviewed: true,
  },
  {
    id: "c4",
    concepts: ["s3"],
    title: "Mop so it dries",
    rule: "Mop at close or early in the morning, never just before the doors open.",
    why: "A wet floor as guests walk in is a slip hazard.",
    reviewed: true,
  },
  {
    id: "c5",
    concepts: ["s5", "s7"],
    title: "Lock the safe, set the alarm",
    rule: "Lock and secure the safe every night, and set the alarm as the last step.",
    why: "An unlocked safe is a serious breach. The alarm secures the building once everything else is done.",
    reviewed: true,
  },
  {
    id: "c6",
    concepts: ["s6"],
    title: "Bottle bins in the allowed hours",
    rule: "Empty the bottle bins only in the hours your venue's licence or council rules allow.",
    why: "Tipping glass late at night is loud, and many venues have rules about it.",
    reviewed: true,
  },
];
