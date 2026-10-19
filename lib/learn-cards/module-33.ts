// Module 33, Cellar & Kegs: the Learn cards shown before the quiz,
// written from the module's True/False statements (lib/verify-questions.ts).
// `concepts` names the statements each card teaches.
//
// Draft for the owner's review (cards batch 2). Review copy:
// docs/Rich Update/cards-batch-2-bartending-b.md.
import type { LearnCard } from "@/lib/learn-cards";

export const MODULE_33_CARDS: LearnCard[] = [
  {
    id: "c1",
    concepts: ["s0", "s7"],
    title: "Fobbing means a problem",
    rule: "A fobbing tap pours mostly foam. If it doesn't clear, find the cause or tell your manager.",
    why: "Fobbing usually means an empty keg, a gas problem or a warm line. It won't fix itself.",
    reviewed: false,
  },
  {
    id: "c2",
    concepts: ["s1", "s2"],
    title: "Disengage, then pour off the air",
    rule: "Lift the coupler handle to disengage it before you change a keg. Afterwards, pour off the air in the line.",
    why: "A coupler under pressure can blow out gas and beer. Air left in the line makes the first pours fob.",
    reviewed: false,
  },
  {
    id: "c3",
    concepts: ["s3"],
    title: "No gas, no beer",
    rule: "If the beer stops flowing, check the gas bottle.",
    why: "Gas is what pushes beer up the line. When the bottle runs out, every tap on it stops.",
    reviewed: false,
  },
  {
    id: "c4",
    concepts: ["s4"],
    title: "Slide, don't lift",
    rule: "A full 50-litre keg weighs more than 50kg. Slide it where you can, and lift it properly when you must.",
    why: "Lifting a keg the wrong way causes serious back and shoulder injuries.",
    reviewed: false,
  },
  {
    id: "c5",
    concepts: ["s5", "s6"],
    title: "Right coupler, regular cleaning",
    rule: "Use the right coupler for each brand, and keep line cleaning on the schedule your venue and brewer set.",
    why: "The wrong coupler damages the keg valve. Lines are cleaned on schedule, before buildup makes the beer taste off, not after.",
    reviewed: false,
  },
];
