// Module 4, Barista Basics: the Learn cards shown before the quiz,
// written from the module's True/False statements (lib/verify-questions.ts).
// `concepts` names the statements each card teaches.
//
// Approved by the owner on 2026-10-19 (cards batch 1). Review copy:
// docs/Rich Update/cards-batch-1-bartending-a.md.
import type { LearnCard } from "@/lib/learn-cards";

export const MODULE_4_CARDS: LearnCard[] = [
  {
    id: "c1",
    concepts: ["s0"],
    title: "Don't boil the milk",
    rule: "Stop texturing milk before it reaches 65°C. Never boil it.",
    why: "Above 65°C milk burns and loses its natural sweetness, and the whole coffee tastes scorched.",
    reviewed: true,
  },
  {
    id: "c2",
    concepts: ["s1", "s4"],
    title: "Shot time and roast",
    rule: "A single espresso shot runs for about 25 to 30 seconds. Darker beans don't make a sweeter shot.",
    why: "Too fast tastes sour and too slow tastes bitter. Dark roasts are more bitter; lighter roasts keep more natural sweetness.",
    reviewed: true,
  },
  {
    id: "c3",
    concepts: ["s2", "s5"],
    title: "Know the Aussie menu",
    rule: "A macchiato is a shot with a dash of textured milk. A cappuccino has more foam than a flat white.",
    why: "Guests order by name and expect the same drink every time. The milk is what makes it the drink they asked for.",
    reviewed: true,
  },
  {
    id: "c4",
    concepts: ["s3", "s7"],
    title: "Purge the wand, flush the group head",
    rule: "Purge the steam wand before and after milk, and flush the group head between every shot.",
    why: "Purging clears water before and milk after. Flushing clears old grounds that make the next coffee taste burnt.",
    reviewed: true,
  },
  {
    id: "c5",
    concepts: ["s6"],
    title: "Plant milks need a gentler touch",
    rule: "Texture soy and other plant milks more gently, and not as hot as cow's milk.",
    why: "They have less fat and protein than full cream milk, so they split if you treat them the same way.",
    reviewed: true,
  },
];
