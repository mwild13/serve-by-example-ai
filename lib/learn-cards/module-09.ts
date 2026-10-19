// Module 9, Table Dynamics: the Learn cards shown before the quiz,
// written from the module's True/False statements (lib/verify-questions.ts).
// `concepts` names the statements each card teaches.
//
// Draft for the owner's review (cards batch 3). Review copy:
// docs/Rich Update/cards-batch-3-service-a.md.
import type { LearnCard } from "@/lib/learn-cards";

export const MODULE_9_CARDS: LearnCard[] = [
  {
    id: "c1",
    concepts: ["s0"],
    title: "Clear when everyone's finished",
    rule: "Don't clear plates while anyone at the table is still eating.",
    why: "Clearing half the table makes slower eaters feel rushed and breaks up the meal.",
    reviewed: false,
  },
  {
    id: "c2",
    concepts: ["s1", "s4"],
    title: "From the right, never empty-handed",
    rule: "Clear plates from the guest's right where the table allows, and take empty glasses every time you visit.",
    why: "Clearing from the right keeps you out of the guest's way. Taking the empties on every visit saves trips.",
    reviewed: false,
  },
  {
    id: "c3",
    concepts: ["s2", "s5"],
    title: "Let the table set the pace",
    rule: "Don't drop the bill before it's asked for, and never rush a table through the meal.",
    why: "An early bill tells guests to leave. Guests notice when they're rushed, and they don't come back.",
    reviewed: false,
  },
  {
    id: "c4",
    concepts: ["s3"],
    title: "Check back after the first bites",
    rule: "Check back shortly after the food arrives, once guests have started eating.",
    why: "That's when an undercooked steak or a missing sauce shows up, while it's still easy to fix.",
    reviewed: false,
  },
  {
    id: "c5",
    concepts: ["s6"],
    title: "Talk to the whole table",
    rule: "Make eye contact with everyone at the table, not just the loudest person.",
    why: "Including everyone makes each guest feel valued.",
    reviewed: false,
  },
  {
    id: "c6",
    concepts: ["s7"],
    title: "Kids' meals first",
    rule: "Serve children their meals first.",
    why: "Hungry kids make stressed parents. Feeding them first settles the whole table.",
    reviewed: false,
  },
];
