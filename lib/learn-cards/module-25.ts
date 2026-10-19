// Module 25, Allergy Shield: the Learn cards shown before the quiz,
// written from the module's True/False statements (lib/verify-questions.ts).
// `concepts` names the statements each card teaches.
//
// Approved by the owner on 2026-10-19 (cards batch 6). Review copy:
// docs/Rich Update/cards-batch-6-compliance-b.md.
import type { LearnCard } from "@/lib/learn-cards";

export const MODULE_25_CARDS: LearnCard[] = [
  {
    id: "c1",
    concepts: ["s0", "s4"],
    title: "Mark the ticket, tell the kitchen",
    rule: "Mark every allergy clearly on the POS ticket, and tell the kitchen in person straight after the order.",
    why: "Tickets can be missed in a rush. Telling the chef directly confirms they know.",
    reviewed: true,
  },
  {
    id: "c2",
    concepts: ["s1", "s5"],
    title: "Ask with every order",
    rule: "Ask about allergies with every order. A warning on the menu isn't enough.",
    why: "Menu warnings are only a starting point. Any guest at any table can have an allergy.",
    reviewed: true,
  },
  {
    id: "c3",
    concepts: ["s2"],
    title: "Traces matter",
    rule: "A severe nut allergy can react to traces left on shared equipment.",
    why: "A shared board or pan is enough to cause anaphylaxis, which can be life-threatening.",
    reviewed: true,
  },
  {
    id: "c4",
    concepts: ["s3"],
    title: "You pass it on",
    rule: "Never ask a guest to tell the kitchen about their own allergy.",
    why: "You're the link between the guest and the kitchen. That job can't be handed to the guest.",
    reviewed: true,
  },
  {
    id: "c5",
    concepts: ["s6", "s7"],
    title: "Check before it goes out",
    rule: "Check with the chef before serving a dish that may hold an allergen. Treat every intolerance with the full allergy process.",
    why: "The final check is the last safety net, and you can't tell how sensitive a guest is.",
    reviewed: true,
  },
];
