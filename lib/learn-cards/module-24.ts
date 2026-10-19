// Module 24, Ice Is Food: the Learn cards shown before the quiz,
// written from the module's True/False statements (lib/verify-questions.ts).
// `concepts` names the statements each card teaches.
//
// Draft for the owner's review (cards batch 6). Review copy:
// docs/Rich Update/cards-batch-6-compliance-b.md.
import type { LearnCard } from "@/lib/learn-cards";

export const MODULE_24_CARDS: LearnCard[] = [
  {
    id: "c1",
    concepts: ["s0"],
    title: "Ice is food",
    rule: "Treat ice as food. It's covered by food safety rules.",
    why: "Ice goes straight into drinks, so contaminating it is as serious as contaminating food.",
    reviewed: false,
  },
  {
    id: "c2",
    concepts: ["s1", "s5"],
    title: "Scoop only",
    rule: "Only ever use the ice scoop: never your hands, even gloved, and never a glass.",
    why: "Hands bring warmth and bacteria. Glass chips, and the chips disappear into the ice.",
    reviewed: false,
  },
  {
    id: "c3",
    concepts: ["s2", "s4"],
    title: "Handle up, damaged scoops out",
    rule: "Keep the scoop handle up, out of the ice. Take a cracked or chipped scoop out of service.",
    why: "A buried handle puts your hand over the ice. A broken scoop sheds plastic into drinks.",
    reviewed: false,
  },
  {
    id: "c4",
    concepts: ["s3", "s6"],
    title: "Lid shut, machine clean",
    rule: "Keep the ice machine lid closed, and clean the machine on its regular schedule.",
    why: "An open lid lets in dust and insects, and bio-film builds up inside a machine that isn't cleaned.",
    reviewed: false,
  },
  {
    id: "c5",
    concepts: ["s7"],
    title: "Moving ice between wells",
    rule: "Move ice between wells only with the scoop and the designated clean ice bucket.",
    why: "Moving ice follows the same hygiene rules as serving it.",
    reviewed: false,
  },
];
