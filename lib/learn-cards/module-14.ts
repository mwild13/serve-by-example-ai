// Module 14, Phone Etiquette: the Learn cards shown before the quiz,
// written from the module's True/False statements (lib/verify-questions.ts).
// `concepts` names the statements each card teaches.
//
// Approved by the owner on 2026-10-19 (cards batch 3). Review copy:
// docs/Rich Update/cards-batch-3-service-a.md.
import type { LearnCard } from "@/lib/learn-cards";

export const MODULE_14_CARDS: LearnCard[] = [
  {
    id: "c1",
    concepts: ["s0", "s7"],
    title: "Answer promptly, name the venue",
    rule: "Answer the venue phone promptly, and say the venue's name.",
    why: "It confirms they've called the right place, and a ringing phone annoys guests near the host stand.",
    reviewed: true,
  },
  {
    id: "c2",
    concepts: ["s1"],
    title: "Warn before you hang up",
    rule: "If a caller is abusive, warn them politely that you'll end the call, then hang up if it continues.",
    why: "You stay professional even when the caller doesn't.",
    reviewed: true,
  },
  {
    id: "c3",
    concepts: ["s2", "s3"],
    title: "Get the details right",
    rule: "Take a name and number for the waitlist, and read booking details back to the caller.",
    why: "Without a number you can't call them when a table frees up. Reading back the date, time and numbers prevents mix-ups.",
    reviewed: true,
  },
  {
    id: "c4",
    concepts: ["s4"],
    title: "Book the time, not the table",
    rule: "Note a request for a particular table, but don't promise it on a busy night.",
    why: "Table plans change all night. Guarantee the booking, not the booth.",
    reviewed: true,
  },
  {
    id: "c5",
    concepts: ["s5"],
    title: "Don't leave callers waiting",
    rule: "If you're too busy to talk, take their name and number and call them back.",
    why: "A long hold loses the booking. A call back keeps it.",
    reviewed: true,
  },
  {
    id: "c6",
    concepts: ["s6"],
    title: "Smile on the phone",
    rule: "Smile while you talk on the phone.",
    why: "Smiling changes the shape of your mouth, and the caller can hear the warmth in your voice.",
    reviewed: true,
  },
];
