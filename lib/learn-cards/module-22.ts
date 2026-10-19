// Module 22, Ice Well Burn: the Learn cards shown before the quiz,
// written from the module's True/False statements (lib/verify-questions.ts).
// `concepts` names the statements each card teaches.
//
// Approved by the owner on 2026-10-19 (cards batch 6). Review copy:
// docs/Rich Update/cards-batch-6-compliance-b.md.
import type { LearnCard } from "@/lib/learn-cards";

export const MODULE_22_CARDS: LearnCard[] = [
  {
    id: "c1",
    concepts: ["s0", "s1"],
    title: "Melt it all",
    rule: "If a glass breaks in the ice well, melt the whole well. Never just pick out the pieces you can see.",
    why: "Tiny shards stay hidden in the ice. Only melting all of it is safe.",
    reviewed: true,
  },
  {
    id: "c2",
    concepts: ["s2"],
    title: "Hot water burns the well",
    rule: "Burn the well by pouring hot water over the ice until it has all melted and drained.",
    why: "Hot water melts the ice fastest and flushes any shards down the drain.",
    reviewed: true,
  },
  {
    id: "c3",
    concepts: ["s3", "s7"],
    title: "Burn it straight away",
    rule: "Burn the well the moment glass breaks in it, however busy the bar is.",
    why: "Every drink poured from that ice could hurt a guest. It can't wait until close.",
    reviewed: true,
  },
  {
    id: "c4",
    concepts: ["s4", "s6"],
    title: "Scoop, then a clean holder",
    rule: "Never scoop ice with a glass. Put the scoop back in its clean holder after every use.",
    why: "Glass on glass is how wells get contaminated. A scoop left in the ice or on the bar picks up bacteria.",
    reviewed: true,
  },
  {
    id: "c5",
    concepts: ["s5"],
    title: "Plan for the time it takes",
    rule: "A burn takes a while, depending on the size of the well. Plan for that well to be out of service.",
    why: "Melting, draining and checking a well properly can't be rushed.",
    reviewed: true,
  },
];
