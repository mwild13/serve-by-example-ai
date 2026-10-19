// Module 39, Bar-Back Synergy: the Learn cards shown before the quiz,
// written from the module's True/False statements (lib/verify-questions.ts).
// `concepts` names the statements each card teaches.
//
// Approved by the owner on 2026-10-19 (cards batch 2). Review copy:
// docs/Rich Update/cards-batch-2-bartending-b.md.
import type { LearnCard } from "@/lib/learn-cards";

export const MODULE_39_CARDS: LearnCard[] = [
  {
    id: "c1",
    concepts: ["s0", "s3"],
    title: "Keep the bartender supplied",
    rule: "Your job is to make sure the bartender never runs out. Taking orders is theirs.",
    why: "The bartender can only serve as fast as you keep them stocked. You handle supply so they can focus on guests.",
    reviewed: true,
  },
  {
    id: "c2",
    concepts: ["s1"],
    title: "Go where you're needed",
    rule: "Cross the floor when the job needs it: ice runs, collecting glasses, restocking.",
    why: "Supply and support don't stop at the end of the bar.",
    reviewed: true,
  },
  {
    id: "c3",
    concepts: ["s2", "s4"],
    title: "Call out, come from behind",
    rule: "Call out before you move behind the bartender, and fill ice from the back of the bar.",
    why: "Moving silently behind someone in a rush risks a collision. Working from the back keeps you out of their way.",
    reviewed: true,
  },
  {
    id: "c4",
    concepts: ["s5", "s6"],
    title: "Don't wait to be asked",
    rule: "Look for the next job yourself, and fill any empty slot on the speed rail straight away.",
    why: "An empty slot makes the bartender stop serving to find a bottle. Your job is to stop that moment happening.",
    reviewed: true,
  },
  {
    id: "c5",
    concepts: ["s7"],
    title: "Talk all through the rush",
    rule: "Keep talking through the rush: a nod, a tap, a one-word call.",
    why: "Quick, constant signals keep service flowing. Waiting for a quiet moment is too late.",
    reviewed: true,
  },
];
