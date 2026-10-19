// Module 2, Wine Service: the Learn cards shown before the quiz,
// written from the module's True/False statements (lib/verify-questions.ts).
// `concepts` names the statements each card teaches.
//
// Draft for the owner's review (cards batch 1). Review copy:
// docs/Rich Update/cards-batch-1-bartending-a.md.
import type { LearnCard } from "@/lib/learn-cards";

export const MODULE_2_CARDS: LearnCard[] = [
  {
    id: "c1",
    concepts: ["s0"],
    title: "Shiraz isn't served fridge-cold",
    rule: "Serve full-bodied reds like Shiraz at about 16 to 18°C, not straight from the fridge.",
    why: "Too cold and the fruit and aroma shut down, so the guest tastes very little of what they paid for.",
    reviewed: false,
  },
  {
    id: "c2",
    concepts: ["s1", "s6"],
    title: "Know your pour",
    rule: "A standard glass of wine is usually 150ml, and a 750ml bottle gives five of them.",
    why: "The right pour keeps every glass the same for guests and keeps the bottle count right. A 150ml glass is about 1.4 to 1.6 standard drinks.",
    reviewed: false,
  },
  {
    id: "c3",
    concepts: ["s2"],
    title: "Show the label first",
    rule: "Present the bottle with the label facing the guest before you open it.",
    why: "It lets the guest check it's the wine and the vintage they ordered before it's opened.",
    reviewed: false,
  },
  {
    id: "c4",
    concepts: ["s3"],
    title: "Corked means tainted",
    rule: "A corked wine is tainted, not full of cork. It smells like damp cardboard or a wet dog.",
    why: "Bits of cork in the glass are harmless. Cork taint (TCA) spoils the wine, so take a guest seriously when they say it smells musty.",
    reviewed: false,
  },
  {
    id: "c5",
    concepts: ["s5"],
    title: "Open sparkling quietly",
    rule: "Open sparkling wine with a soft hiss, never a loud pop.",
    why: "A quiet opening keeps the bubbles in the wine and keeps the dining room calm. A flying cork can hurt someone.",
    reviewed: false,
  },
  {
    id: "c6",
    concepts: ["s4", "s7"],
    title: "Styles and glasses",
    rule: "Marlborough Sauvignon Blanc is dry and crisp. Red wine glasses have larger bowls than white wine glasses.",
    why: "Knowing the style helps you guide a guest. The bigger bowl gives bold reds more air, so they open up and release their aroma.",
    reviewed: false,
  },
];
