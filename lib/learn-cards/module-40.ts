// Module 40, Natural Upselling: the Learn cards shown before the quiz,
// written from the module's True/False statements (lib/verify-questions.ts).
// `concepts` names the statements each card teaches.
//
// Approved by the owner on 2026-10-19 (cards batch 4). Review copy:
// docs/Rich Update/cards-batch-4-service-b.md.
import type { LearnCard } from "@/lib/learn-cards";

export const MODULE_40_CARDS: LearnCard[] = [
  {
    id: "c1",
    concepts: ["s0", "s3"],
    title: "Name the product",
    rule: "Name what you're suggesting: \"With Hendrick's?\" or \"A pint of that?\", not \"Premium?\" or \"A large?\"",
    why: "A named product paints a picture. A generic question sounds like a transaction and gets a no.",
    reviewed: true,
  },
  {
    id: "c2",
    concepts: ["s2"],
    title: "Recommend a specific side",
    rule: "Suggest a particular side: \"The sweet potato fries are great with the chicken.\"",
    why: "It saves the guest deciding. \"Any sides?\" invites a flat no.",
    reviewed: true,
  },
  {
    id: "c3",
    concepts: ["s1", "s6"],
    title: "Enthusiasm, not pressure",
    rule: "Suggest things you genuinely like, with real enthusiasm. Never push.",
    why: "Enthusiasm makes it a recommendation. The moment it feels pushy, trust is gone.",
    reviewed: true,
  },
  {
    id: "c4",
    concepts: ["s4"],
    title: "Know your pairings",
    rule: "Learn which wines go with which dishes.",
    why: "A confident pairing sounds like expert advice, not a sales pitch.",
    reviewed: true,
  },
  {
    id: "c5",
    concepts: ["s5", "s7"],
    title: "Right time, every guest",
    rule: "Offer dessert as the plates are cleared, and make suggestions to every guest, not just big spenders.",
    why: "Once they've asked for the bill it's too late. Casual guests often welcome a confident suggestion.",
    reviewed: true,
  },
];
