// Module 37, The Out-of-Stock Pivot: the Learn cards shown before the quiz,
// written from the module's True/False statements (lib/verify-questions.ts).
// `concepts` names the statements each card teaches.
//
// Draft for the owner's review (cards batch 4). Review copy:
// docs/Rich Update/cards-batch-4-service-b.md.
import type { LearnCard } from "@/lib/learn-cards";

export const MODULE_37_CARDS: LearnCard[] = [
  {
    id: "c1",
    concepts: ["s0", "s1", "s2"],
    title: "Always offer an alternative",
    rule: "When an item's out, say so, then offer a specific alternative straight away.",
    why: "\"Sorry, we're out\" is a dead end. The alternative is what saves the sale.",
    reviewed: false,
  },
  {
    id: "c2",
    concepts: ["s3", "s6"],
    title: "Recommend, don't console",
    rule: "Offer the closest match, not the cheapest, and present it as a recommendation.",
    why: "\"Our house red is very similar and pairs better with that dish\" keeps the guest keen instead of disappointed.",
    reviewed: false,
  },
  {
    id: "c3",
    concepts: ["s4"],
    title: "Know what's similar",
    rule: "Know the menu well enough to know what's similar to what.",
    why: "You can't suggest a real alternative if you don't know what's comparable.",
    reviewed: false,
  },
  {
    id: "c4",
    concepts: ["s5"],
    title: "One apology is enough",
    rule: "Apologise once, briefly, then move on to the alternative.",
    why: "Over-apologising draws attention to the problem and makes the guest feel worse.",
    reviewed: false,
  },
  {
    id: "c5",
    concepts: ["s7"],
    title: "Everyone knows what's 86'd",
    rule: "All floor staff learn what's 86'd at the start of every service.",
    why: "It stops anyone promising a guest something the kitchen can't make.",
    reviewed: false,
  },
];
