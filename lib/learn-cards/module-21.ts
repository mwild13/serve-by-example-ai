// Module 21, Call Behind: the Learn cards shown before the quiz,
// written from the module's True/False statements (lib/verify-questions.ts).
// `concepts` names the statements each card teaches.
//
// Approved by the owner on 2026-10-19 (cards batch 6). Review copy:
// docs/Rich Update/cards-batch-6-compliance-b.md.
import type { LearnCard } from "@/lib/learn-cards";

export const MODULE_21_CARDS: LearnCard[] = [
  {
    id: "c1",
    concepts: ["s0", "s1"],
    title: "Call \"Behind!\" every time",
    rule: "Call \"Behind!\" whenever you pass behind someone, with or without a tray.",
    why: "One unannounced pass can cause a dropped tray or a burn. Collisions happen empty-handed too.",
    reviewed: true,
  },
  {
    id: "c2",
    concepts: ["s2"],
    title: "Call \"Corner!\"",
    rule: "Call \"Corner!\" before you step around a blind corner.",
    why: "It gives anyone coming the other way a moment to stop.",
    reviewed: true,
  },
  {
    id: "c3",
    concepts: ["s3", "s5"],
    title: "Never push or run",
    rule: "Don't push past colleagues, and don't run. Walk fast, with purpose.",
    why: "Pushing and running cause drops, spills and injuries, and the busier it is, the worse they get.",
    reviewed: true,
  },
  {
    id: "c4",
    concepts: ["s4", "s6"],
    title: "Coming through",
    rule: "In a crowd, turn sideways, tuck your elbows in and call \"Coming through!\"",
    why: "You take up less space, and the call tells guests and staff to clear a path.",
    reviewed: true,
  },
  {
    id: "c5",
    concepts: ["s7"],
    title: "Everyone makes the calls",
    rule: "Use the calls however experienced you are.",
    why: "Collisions don't care how long you've worked in hospitality. The habit keeps everyone safe.",
    reviewed: true,
  },
];
