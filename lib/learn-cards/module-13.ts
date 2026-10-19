// Module 13, VIP Management: the Learn cards shown before the quiz,
// written from the module's True/False statements (lib/verify-questions.ts).
// `concepts` names the statements each card teaches.
//
// Draft for the owner's review (cards batch 3). Review copy:
// docs/Rich Update/cards-batch-3-service-a.md.
import type { LearnCard } from "@/lib/learn-cards";

export const MODULE_13_CARDS: LearnCard[] = [
  {
    id: "c1",
    concepts: ["s0"],
    title: "The law applies to everyone",
    rule: "No guest can stay or drink past the venue's licensed trading hours, VIP or not.",
    why: "Licensing laws apply to everyone. Breaking them risks a fine from the liquor regulator and the venue's licence.",
    reviewed: false,
  },
  {
    id: "c2",
    concepts: ["s1"],
    title: "A short grace period",
    rule: "Hold a reserved table for your venue's grace period before you give it away.",
    why: "It allows for traffic and parking delays, without the table sitting empty all night.",
    reviewed: false,
  },
  {
    id: "c3",
    concepts: ["s2", "s5"],
    title: "Every guest counts",
    rule: "Never move seated guests for a VIP, and never ignore walk-ins because VIPs are in. Offer the VIP a drink at the bar.",
    why: "Moving seated guests causes a scene. Every guest is owed the same basic hospitality.",
    reviewed: false,
  },
  {
    id: "c4",
    concepts: ["s3"],
    title: "Use their name",
    rule: "Remember a VIP's name, and use it.",
    why: "Personal recognition is what makes VIP guests feel valued.",
    reviewed: false,
  },
  {
    id: "c5",
    concepts: ["s4"],
    title: "Don't double-seat a section",
    rule: "Don't seat several tables in one section at the same time.",
    why: "It sends the kitchen a flood of dockets at once and swamps the staff.",
    reviewed: false,
  },
  {
    id: "c6",
    concepts: ["s6", "s7"],
    title: "Look after people at the door",
    rule: "Offer water to guests waiting for a table. When you're full, turn people away politely, with a suggestion.",
    why: "Service starts before guests sit down. A friendly no makes them want to come back.",
    reviewed: false,
  },
];
