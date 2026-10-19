// Module 8, The Greeting: the Learn cards shown before the quiz,
// written from the module's True/False statements (lib/verify-questions.ts).
// `concepts` names the statements each card teaches.
//
// Draft for the owner's review (cards batch 3). Review copy:
// docs/Rich Update/cards-batch-3-service-a.md.
import type { LearnCard } from "@/lib/learn-cards";

export const MODULE_8_CARDS: LearnCard[] = [
  {
    id: "c1",
    concepts: ["s0", "s2"],
    title: "Acknowledge straight away",
    rule: "Acknowledge every new guest straight away. In a rush, a nod and a smile count.",
    why: "A quick acknowledgement tells guests they've been seen, and it makes the wait feel shorter.",
    reviewed: false,
  },
  {
    id: "c2",
    concepts: ["s1"],
    title: "Eyes up while you pour",
    rule: "Lift your eyes to new guests, even while you're pouring.",
    why: "You can hold a pour and still make eye contact. It shows you're in control of the bar.",
    reviewed: false,
  },
  {
    id: "c3",
    concepts: ["s3"],
    title: "Don't shout across the room",
    rule: "Never yell a greeting across a busy room. Move closer, or use a wave or a nod.",
    why: "Shouting interrupts every other guest's meal or conversation.",
    reviewed: false,
  },
  {
    id: "c4",
    concepts: ["s4", "s6"],
    title: "Smile, and say you'll be right there",
    rule: "Greet guests with a smile. If you're busy, say \"I'll be right with you.\"",
    why: "A smile sets a friendly tone, and the line tells guests they're next, which takes the stress out of the wait.",
    reviewed: false,
  },
  {
    id: "c5",
    concepts: ["s5"],
    title: "Never look past waiting guests",
    rule: "Don't ignore waiting guests to look busy.",
    why: "Ignored guests feel invisible, and a short wait turns into a complaint.",
    reviewed: false,
  },
  {
    id: "c6",
    concepts: ["s7"],
    title: "A real welcome builds regulars",
    rule: "Give every guest a genuine welcome, especially the locals.",
    why: "Pubs run on familiar faces. A warm greeting is the first step to a regular.",
    reviewed: false,
  },
];
