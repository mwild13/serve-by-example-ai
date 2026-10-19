// Module 11, Guest Complaints: the Learn cards shown before the quiz,
// written from the module's True/False statements (lib/verify-questions.ts).
// `concepts` names the statements each card teaches.
//
// Draft for the owner's review (cards batch 3). Review copy:
// docs/Rich Update/cards-batch-3-service-a.md.
import type { LearnCard } from "@/lib/learn-cards";

export const MODULE_11_CARDS: LearnCard[] = [
  {
    id: "c1",
    concepts: ["s0", "s6"],
    title: "Listen, then apologise",
    rule: "Let the guest finish without interrupting, then apologise and acknowledge their frustration.",
    why: "Most upset guests want to be heard first. Knowing you're on their side takes the heat out.",
    reviewed: false,
  },
  {
    id: "c2",
    concepts: ["s1", "s3"],
    title: "Own it, don't argue",
    rule: "Never blame the kitchen and never argue. Take ownership as a team.",
    why: "Blame makes the venue look disorganised. Win the argument and you still lose the guest.",
    reviewed: false,
  },
  {
    id: "c3",
    concepts: ["s2", "s5"],
    title: "Fix it properly",
    rule: "A cold meal goes back to the kitchen to be cooked again, never microwaved. If your venue allows it, offer a drink while they wait.",
    why: "Microwaving ruins the food. A drink gives the guest something while the new meal is made.",
    reviewed: false,
  },
  {
    id: "c4",
    concepts: ["s4"],
    title: "Follow up",
    rule: "Check back after the fix to make sure it's right.",
    why: "Following up shows you care, and it closes the loop.",
    reviewed: false,
  },
  {
    id: "c5",
    concepts: ["s7"],
    title: "Tell the manager",
    rule: "Tell your manager about every serious food complaint.",
    why: "Managers need to see patterns so they can fix them with the head chef.",
    reviewed: false,
  },
];
