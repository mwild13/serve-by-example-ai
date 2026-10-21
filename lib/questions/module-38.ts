// Module 38, Clearing Dead Soldiers: questions in the new formats, written from the
// module's True/False statements (lib/verify-questions.ts). Each `concept`
// names the statement it comes from.
//
// Approved by the owner on 2026-10-19 (batch 4). Review copy:
// docs/Rich Update/batch-4-service-b.md.
import "server-only";
import type { Question } from "@/lib/question-bank";

export const MODULE_38_QUESTIONS: Question[] = [
  {
    id: "q1",
    concept: "s1",
    difficulty: 1,
    format: "multiple_choice",
    prompt: "When should finished glasses and side plates come off a table?",
    options: [
      { id: "a", text: "As soon as each one is finished" },
      { id: "b", text: "Only once everyone has finished the meal" },
      { id: "c", text: "When the guest asks" },
      { id: "d", text: "At the end of the night" },
    ],
    answer: "a",
    explanation: "Pre-bussing, removing finished glasses and side plates as they are done, is standard professional table management.",
    reviewed: true,
  },
  {
    id: "q2",
    concept: "s2",
    difficulty: 1,
    format: "multiple_choice",
    prompt: "You're heading back to the kitchen. What should you be carrying?",
    options: [
      { id: "a", text: "Nothing: it's quicker" },
      { id: "b", text: "Dead soldiers and anything else that needs clearing" },
      { id: "c", text: "Only your notepad" },
      { id: "d", text: "The next table's order" },
    ],
    answer: "b",
    explanation: "Every trip to the back should clear dead soldiers; every trip to the floor should carry something fresh. No empty hands.",
    reviewed: true,
  },
  {
    id: "q3",
    concept: "s3",
    difficulty: 2,
    format: "multiple_choice",
    prompt: "Do you need to ask before taking a finished glass?",
    options: [
      { id: "a", text: "Yes, always" },
      { id: "b", text: "No: clearing finished glasses is part of normal service" },
      { id: "c", text: "Only at high-end venues" },
      { id: "d", text: "Only if the guest is talking" },
    ],
    answer: "b",
    explanation: "Clearing finished glasses is part of the standard service contract. It does not require the guest's permission.",
    reviewed: true,
  },
  {
    id: "q4",
    concept: "s4",
    difficulty: 1,
    format: "multiple_choice",
    prompt: "What does a table full of empty glasses say to a guest?",
    options: [
      { id: "a", text: "That they're having a great night" },
      { id: "b", text: "That they're being neglected" },
      { id: "c", text: "Nothing at all" },
      { id: "d", text: "That the venue is busy" },
    ],
    answer: "b",
    explanation: "Accumulated empty glasses and debris subconsciously signals neglect. A clean table makes guests feel valued and comfortable.",
    reviewed: true,
  },
  {
    id: "q5",
    concept: "s5",
    difficulty: 2,
    format: "spot_mistake",
    prompt: "Which of these makes guests feel they're being asked to leave?",
    options: [
      { id: "a", text: "Clearing finished glasses" },
      { id: "b", text: "Removing empty side plates" },
      { id: "c", text: "Dropping the bill before they ask" },
      { id: "d", text: "Wiping down a cleared space" },
    ],
    answer: "c",
    explanation: "Pre-bussing improves comfort and cleanliness. Only dropping the bill unsolicited or hovering pressures a guest to leave.",
    reviewed: true,
  },
  {
    id: "q6",
    concept: "s6",
    difficulty: 2,
    format: "multiple_choice",
    prompt: "What does expert pre-bussing look like?",
    options: [
      { id: "a", text: "A full arm of cleared glasses to the glass wash in one trip" },
      { id: "b", text: "One glass at a time" },
      { id: "c", text: "Waiting until there are ten glasses on a table" },
      { id: "d", text: "Asking guests to stack their glasses" },
    ],
    answer: "a",
    explanation: "Minimising trips by loading up on cleared items in one pass is exactly what efficient, professional pre-bussing looks like.",
    reviewed: true,
  },
  {
    id: "q7",
    concept: "s7",
    difficulty: 1,
    format: "multiple_choice",
    prompt: "One guest at a table of four has finished their drink. When do you take the glass?",
    options: [
      { id: "a", text: "Now" },
      { id: "b", text: "When all four have finished" },
      { id: "c", text: "When they order another" },
      { id: "d", text: "When they leave" },
    ],
    answer: "a",
    explanation: "Each individual dead soldier should be removed as soon as it is available to keep the table clean throughout the experience.",
    reviewed: true,
  },
  {
    id: "q8",
    concept: "s2",
    difficulty: 3,
    format: "order_steps",
    prompt: "Put a pass through your section in order.",
    steps: [
      { id: "a", text: "Bring out fresh drinks" },
      { id: "b", text: "Pick up the dead soldiers on the way back" },
      { id: "c", text: "Drop them at the glass wash in one trip" },
    ],
    explanation: "Every trip to the floor carries something fresh, and every trip back clears dead soldiers. No empty hands.",
    reviewed: true,
  },
];
