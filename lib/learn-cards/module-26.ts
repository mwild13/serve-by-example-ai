// Module 26, Soda Gun Speed: the Learn cards shown before the quiz,
// written from the module's True/False statements (lib/verify-questions.ts).
// `concepts` names the statements each card teaches.
//
// Draft for the owner's review (cards batch 2). Review copy:
// docs/Rich Update/cards-batch-2-bartending-b.md.
import type { LearnCard } from "@/lib/learn-cards";

export const MODULE_26_CARDS: LearnCard[] = [
  {
    id: "c1",
    concepts: ["s0", "s6"],
    title: "Know your gun by feel",
    rule: "Learn which button is which on your bar's soda gun until you can pour without looking.",
    why: "Every bar's layout is different. Knowing yours by feel keeps your eyes on the guest and the glass.",
    reviewed: false,
  },
  {
    id: "c2",
    concepts: ["s1", "s5"],
    title: "Rinse with water, clean the nozzle",
    rule: "Rinse the gun with clean water, not soda, and clean the nozzle by hand every day.",
    why: "Soda leaves sugar behind. Syrup builds up on the nozzle, grows bacteria and taints the drinks.",
    reviewed: false,
  },
  {
    id: "c3",
    concepts: ["s2"],
    title: "Run the first pour to waste",
    rule: "When the gun hasn't been used for a while, run the first pour away before you serve a guest.",
    why: "Syrup sits warming in the line between uses, so the first pour comes out warm.",
    reviewed: false,
  },
  {
    id: "c4",
    concepts: ["s3"],
    title: "Know where the spare syrup is",
    rule: "Know where the spare bag-in-box syrups are kept. Changing one only takes a couple of minutes.",
    why: "Running out isn't a disaster if you can find the spare. Hunting for it is what holds up service.",
    reviewed: false,
  },
  {
    id: "c5",
    concepts: ["s4", "s7"],
    title: "Wrong button, new drink",
    rule: "If you hit the wrong button, remake the drink. And never top up a guest's drink without asking.",
    why: "Tonic instead of soda changes the drink completely. An uninvited top-up can water down a drink the guest is sipping slowly.",
    reviewed: false,
  },
];
