// Module 17, Conflict De-escalation: the Learn cards shown before the quiz,
// written from the module's True/False statements (lib/verify-questions.ts).
// `concepts` names the statements each card teaches.
//
// Draft for the owner's review (cards batch 5). Review copy:
// docs/Rich Update/cards-batch-5-compliance-a.md.
import type { LearnCard } from "@/lib/learn-cards";

export const MODULE_17_CARDS: LearnCard[] = [
  {
    id: "c1",
    concepts: ["s0", "s2"],
    title: "Open body, safe distance",
    rule: "Keep your arms uncrossed and your body relaxed, and keep a safe distance.",
    why: "Crossed arms look defensive, and stepping in close can trigger a fight-or-flight reaction.",
    reviewed: false,
  },
  {
    id: "c2",
    concepts: ["s1", "s4"],
    title: "Calm voice, no shouting match",
    rule: "Keep your voice calm and steady. Never argue back loudly.",
    why: "People mirror tone, so calm brings their volume down. A shouting match can turn physical.",
    reviewed: false,
  },
  {
    id: "c3",
    concepts: ["s3"],
    title: "Away from the crowd",
    rule: "Move a dispute away from the main crowd where you can.",
    why: "Without an audience the guest has less reason to show off, and the room stays calm.",
    reviewed: false,
  },
  {
    id: "c4",
    concepts: ["s5", "s7"],
    title: "Address the behaviour",
    rule: "Talk about the behaviour, not the person. A simple apology often helps.",
    why: "It takes the personal sting out, so the guest has less to fight. \"I'm sorry that happened\" shows you've heard them.",
    reviewed: false,
  },
  {
    id: "c5",
    concepts: ["s6"],
    title: "Threats go to security",
    rule: "If anyone makes a threat, call security or a manager straight away.",
    why: "Threats are a hard line. Your safety comes first.",
    reviewed: false,
  },
];
