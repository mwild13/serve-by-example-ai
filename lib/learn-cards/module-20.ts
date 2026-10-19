// Module 20, Inventory Control: the Learn cards shown before the quiz,
// written from the module's True/False statements (lib/verify-questions.ts).
// `concepts` names the statements each card teaches.
//
// Approved by the owner on 2026-10-19 (cards batch 5). Review copy:
// docs/Rich Update/cards-batch-5-compliance-a.md.
import type { LearnCard } from "@/lib/learn-cards";

export const MODULE_20_CARDS: LearnCard[] = [
  {
    id: "c1",
    concepts: ["s0", "s6"],
    title: "Measure every pour",
    rule: "Use a jigger for every spirit. Free-pouring is against most venues' policy.",
    why: "A few extra millilitres a drink adds up fast and eats into the bar's gross profit.",
    reviewed: true,
  },
  {
    id: "c2",
    concepts: ["s1"],
    title: "Free drinks need approval",
    rule: "Never give drinks away. Only a manager can approve a free drink, and it's logged in the POS.",
    why: "Unapproved free drinks are treated as theft of the venue's stock.",
    reviewed: true,
  },
  {
    id: "c3",
    concepts: ["s2", "s5"],
    title: "Log waste, count everything",
    rule: "Record every dropped bottle in the wastage log. A stocktake counts every item, open bottles included.",
    why: "The log explains where stock went, so the stocktake balances.",
    reviewed: true,
  },
  {
    id: "c4",
    concepts: ["s3", "s7"],
    title: "First in, first out",
    rule: "Use the oldest stock first, from milk and juice to kegs. Throwing out half-full kegs is never routine.",
    why: "FIFO stops stock expiring. Binning a half keg is a big loss and points to poor stock control.",
    reviewed: true,
  },
  {
    id: "c5",
    concepts: ["s4"],
    title: "Never pour it back",
    rule: "Never pour leftover wine from a glass back into the bottle.",
    why: "Once a drink has been in a guest's glass, it goes down the drain. Pouring it back is a serious health breach.",
    reviewed: true,
  },
];
