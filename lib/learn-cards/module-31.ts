// Module 31, Jigger Precision: the Learn cards shown before the quiz,
// written from the module's True/False statements (lib/verify-questions.ts).
// `concepts` names the statements each card teaches.
//
// Approved by the owner on 2026-10-19 (cards batch 6). Review copy:
// docs/Rich Update/cards-batch-6-compliance-b.md.
import type { LearnCard } from "@/lib/learn-cards";

export const MODULE_31_CARDS: LearnCard[] = [
  {
    id: "c1",
    concepts: ["s0", "s5"],
    title: "Jigger every pour",
    rule: "Most venues measure a single spirit at 30ml. Use your venue's jigger for every spirit, in cocktails and mixed drinks alike.",
    why: "Measuring every pour keeps drinks consistent and keeps the bar compliant.",
    reviewed: true,
  },
  {
    id: "c2",
    concepts: ["s1", "s3"],
    title: "Small over-pours add up",
    rule: "Never free-pour. 5ml over a drink sounds small, but over 200 drinks that's a litre given away.",
    why: "Even experienced free-pourers drift over, and it comes straight off the bar's gross profit.",
    reviewed: true,
  },
  {
    id: "c3",
    concepts: ["s2"],
    title: "Read the meniscus",
    rule: "Fill the jigger to the meniscus, the slight curve at the top, and check it at eye level.",
    why: "From above, the measure is hard to judge. At eye level you get it right.",
    reviewed: true,
  },
  {
    id: "c4",
    concepts: ["s4", "s6"],
    title: "The jigger backs you up",
    rule: "Measure every pour, so you can show it was right.",
    why: "If a guest says they were short-poured, the jigger backs you up. Consistent pours also keep the stocktake matching sales.",
    reviewed: true,
  },
  {
    id: "c5",
    concepts: ["s7"],
    title: "No \"bit extra\"",
    rule: "Don't add a bit extra when a guest asks. Only a manager can approve that.",
    why: "An unapproved over-pour is a compliance problem, and it's giving away the venue's stock.",
    reviewed: true,
  },
];
