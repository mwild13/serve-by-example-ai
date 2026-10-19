// Module 36, Two-Minute Check: the Learn cards shown before the quiz,
// written from the module's True/False statements (lib/verify-questions.ts).
// `concepts` names the statements each card teaches.
//
// Draft for the owner's review (cards batch 4). Review copy:
// docs/Rich Update/cards-batch-4-service-b.md.
import type { LearnCard } from "@/lib/learn-cards";

export const MODULE_36_CARDS: LearnCard[] = [
  {
    id: "c1",
    concepts: ["s0", "s2"],
    title: "After the first bite",
    rule: "The two-minute check: go back to the table once guests have had their first bite.",
    why: "Before the first bite they can't tell you anything. Soon after, there's still time for the kitchen to fix it.",
    reviewed: false,
  },
  {
    id: "c2",
    concepts: ["s1", "s7"],
    title: "Every table, every dish",
    rule: "Check every table, whether the order was simple or complicated, new or familiar.",
    why: "Any dish can come out wrong, even the one the kitchen makes every night.",
    reviewed: false,
  },
  {
    id: "c3",
    concepts: ["s3"],
    title: "Ask a specific question",
    rule: "Ask something specific, like \"How's the steak cooked for you?\", not \"Is everything okay?\"",
    why: "\"Okay?\" gets a one-word answer. A specific question gets a useful one.",
    reviewed: false,
  },
  {
    id: "c4",
    concepts: ["s4", "s6"],
    title: "Catch it while it can be fixed",
    rule: "Catch problems early, while a cold or wrong dish can still be cooked again.",
    why: "Once a guest has eaten half a cold meal, the experience can't be fully saved.",
    reviewed: false,
  },
  {
    id: "c5",
    concepts: ["s5"],
    title: "A quick check is good service",
    rule: "Keep the check brief and professional. It's part of the meal, not an interruption.",
    why: "It's neglect, not a quick check, that ruins a meal.",
    reviewed: false,
  },
];
