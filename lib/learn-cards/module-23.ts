// Module 23, The Swivel Head: the Learn cards shown before the quiz,
// written from the module's True/False statements (lib/verify-questions.ts).
// `concepts` names the statements each card teaches.
//
// Draft for the owner's review (cards batch 4). Review copy:
// docs/Rich Update/cards-batch-4-service-b.md.
import type { LearnCard } from "@/lib/learn-cards";

export const MODULE_23_CARDS: LearnCard[] = [
  {
    id: "c1",
    concepts: ["s0"],
    title: "Spot the dead soldiers",
    rule: "An empty glass left on a table is a \"dead soldier\". Learn to spot them from across the room.",
    why: "It's one of the clearest signs a table needs you.",
    reviewed: false,
  },
  {
    id: "c2",
    concepts: ["s1", "s5"],
    title: "No tunnel vision",
    rule: "Keep scanning the room while you work on the task in front of you.",
    why: "Tunnel vision is a sign of being overwhelmed. Experienced staff are always reading the whole room.",
    reviewed: false,
  },
  {
    id: "c3",
    concepts: ["s2", "s3"],
    title: "Read the cues",
    rule: "A guest looking around with a menu open needs you. A raised hand needs you now.",
    why: "Both mean the guest is waiting. A raised hand means their patience is running out, so acknowledge it straight away.",
    reviewed: false,
  },
  {
    id: "c4",
    concepts: ["s4", "s6"],
    title: "Sweep and acknowledge",
    rule: "Scan the room regularly. When you can't get there yet, catch their eye and nod.",
    why: "Regular sweeps catch needs early. A nod from across the room tells the guest they've been seen.",
    reviewed: false,
  },
  {
    id: "c5",
    concepts: ["s7"],
    title: "Everyone reads the room",
    rule: "Watching for empty glasses and guest needs is everyone's job, not just the manager's.",
    why: "A manager can't be everywhere. Everyone on the floor shares the room.",
    reviewed: false,
  },
];
