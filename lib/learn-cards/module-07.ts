// Module 7, Bar-Back Efficiency: the Learn cards shown before the quiz,
// written from the module's True/False statements (lib/verify-questions.ts).
// `concepts` names the statements each card teaches.
//
// Draft for the owner's review (cards batch 1). Review copy:
// docs/Rich Update/cards-batch-1-bartending-a.md.
import type { LearnCard } from "@/lib/learn-cards";

export const MODULE_7_CARDS: LearnCard[] = [
  {
    id: "c1",
    concepts: ["s0", "s6"],
    title: "Cool, unstacked glasses",
    rule: "Let glasses cool before beer goes in them, and never stack them wet.",
    why: "Hot glasses make beer foam over and waste the keg. Wet glasses stacked together seal tight and break.",
    reviewed: false,
  },
  {
    id: "c2",
    concepts: ["s1", "s2"],
    title: "Spirits and ice come first",
    rule: "Keep the speed rail stocked and the ice wells full, even in a rush.",
    why: "With no spirits the whole bar stops. A full well stays colder for longer, so drinks aren't watery.",
    reviewed: false,
  },
  {
    id: "c3",
    concepts: ["s3"],
    title: "Cut the gas before a keg change",
    rule: "Before you take a coupler off an empty keg, cut its gas: lift the coupler handle to disengage it, then twist it off.",
    why: "A coupler taken off under pressure sprays gas and beer. Most cellars run several kegs off one regulator, so lifting the handle is how you cut it.",
    reviewed: false,
  },
  {
    id: "c4",
    concepts: ["s4", "s5"],
    title: "Clear the bar, rotate the juice",
    rule: "Clear empty glasses off the bar top, and use the oldest juice first.",
    why: "Clearing keeps the bar turning over. First in, first out stops juice spoiling and cuts waste.",
    reviewed: false,
  },
  {
    id: "c5",
    concepts: ["s7"],
    title: "Call it out",
    rule: "Tell the bartender what you're doing: \"behind you\", \"more ice coming\".",
    why: "A quick call stops them stepping back into you during a rush.",
    reviewed: false,
  },
];
