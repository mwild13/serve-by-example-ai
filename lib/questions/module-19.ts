// Module 19, Opening & Closing: questions in the new formats, written from the
// module's True/False statements (lib/verify-questions.ts). Each `concept`
// names the statement it comes from.
//
// Approved by the owner on 2026-10-19 (batch 5). Review copy:
// docs/Rich Update/batch-5-compliance-a.md.
import "server-only";
import type { Question } from "@/lib/question-bank";

export const MODULE_19_QUESTIONS: Question[] = [
  {
    id: "q1",
    concept: "s2",
    difficulty: 1,
    format: "multiple_choice",
    prompt: "Why wipe down and plug the beer taps every night?",
    options: [
      { id: "a", text: "Sugary beer residue draws fruit flies" },
      { id: "b", text: "It keeps the beer cold" },
      { id: "c", text: "It's only for looks" },
      { id: "d", text: "It saves gas" },
    ],
    answer: "a",
    explanation: "Sugary beer residue is a magnet for bar flies. Taps must be wiped and plugged every single night.",
    reviewed: true,
  },
  {
    id: "q2",
    concept: "s3",
    difficulty: 1,
    format: "multiple_choice",
    prompt: "When should the floors be mopped?",
    options: [
      { id: "a", text: "At closing or early morning, so they're dry before guests arrive" },
      { id: "b", text: "Just before the doors open" },
      { id: "c", text: "During service" },
      { id: "d", text: "Only when there's a spill" },
    ],
    answer: "a",
    explanation: "Wet floors as guests walk in is a massive slip hazard. Mopping must be done at closing or early morning so it dries.",
    reviewed: true,
  },
  {
    id: "q3",
    concept: "s4",
    difficulty: 2,
    format: "multiple_choice",
    prompt: "What happens to the ice wells at close?",
    options: [
      { id: "a", text: "The ice is melted and the wells wiped dry" },
      { id: "b", text: "They're topped up for the morning" },
      { id: "c", text: "The lids go on and the ice stays" },
      { id: "d", text: "Nothing until the morning crew arrive" },
    ],
    answer: "a",
    explanation: "Stagnant water sitting overnight breeds bacteria. Dry wells ensure a sanitary start for the morning crew.",
    reviewed: true,
  },
  {
    id: "q4",
    concept: "s5",
    difficulty: 1,
    format: "multiple_choice",
    prompt: "What should you do with the safe at close?",
    options: [
      { id: "a", text: "Leave it unlocked for the morning manager" },
      { id: "b", text: "Lock it, spin it and secure it, every night" },
      { id: "c", text: "Lock it on busy nights only" },
      { id: "d", text: "Leave the key in it" },
    ],
    answer: "b",
    explanation: "This is a fireable offence. The safe must be locked, spun, and secured every single night without exception.",
    reviewed: true,
  },
  {
    id: "q5",
    concept: "s7",
    difficulty: 2,
    format: "multiple_choice",
    prompt: "What's the very last step of closing?",
    options: [
      { id: "a", text: "Setting the security alarm" },
      { id: "b", text: "Counting the till" },
      { id: "c", text: "Mopping the floor" },
      { id: "d", text: "Turning the music off" },
    ],
    answer: "a",
    explanation: "Once the till is secured and the doors are locked, setting the alarm secures the building for the night.",
    reviewed: true,
  },
  {
    id: "q6",
    concept: "s5",
    difficulty: 2,
    format: "spot_mistake",
    prompt: "A closer reads out their checklist. Which step is wrong?",
    options: [
      { id: "a", text: "Wipe and plug the taps" },
      { id: "b", text: "Melt the ice and dry the wells" },
      { id: "c", text: "Leave the safe open for the morning" },
      { id: "d", text: "Set the alarm on the way out" },
    ],
    answer: "c",
    explanation: "This is a fireable offence. The safe must be locked, spun, and secured every single night without exception.",
    reviewed: true,
  },
  {
    id: "q7",
    concept: "s7",
    difficulty: 3,
    format: "order_steps",
    prompt: "Put these closing steps in order.",
    steps: [
      { id: "a", text: "Wipe and plug the beer taps" },
      { id: "b", text: "Melt the ice and wipe the wells dry" },
      { id: "c", text: "Lock and secure the safe and the till" },
      { id: "d", text: "Lock the doors" },
      { id: "e", text: "Set the security alarm" },
    ],
    explanation: "Clean down first, then secure the cash. Once the till is secured and the doors are locked, setting the alarm secures the building for the night.",
    reviewed: true,
  },
];
