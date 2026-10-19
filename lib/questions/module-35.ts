// Module 35, The Clean Close: questions in the new formats, written from the
// module's True/False statements (lib/verify-questions.ts). Each `concept`
// names the statement it comes from.
//
// Approved by the owner on 2026-10-19 (batch 6). Review copy:
// docs/Rich Update/batch-6-compliance-b.md.
import "server-only";
import type { Question } from "@/lib/question-bank";

export const MODULE_35_QUESTIONS: Question[] = [
  {
    id: "q1",
    concept: "s0",
    difficulty: 1,
    format: "multiple_choice",
    prompt: "Why does a perfect close matter so much?",
    options: [
      { id: "a", text: "The opening crew can start service straight away" },
      { id: "b", text: "It gets you home faster" },
      { id: "c", text: "It's only for the manager" },
      { id: "d", text: "It saves on cleaning products" },
    ],
    answer: "a",
    explanation: "A clean, fully-stocked venue at close means the opening crew can begin service immediately without cleaning up the previous night first.",
    reviewed: true,
  },
  {
    id: "q2",
    concept: "s2",
    difficulty: 1,
    format: "multiple_choice",
    prompt: "What happens to the speed rail at close?",
    options: [
      { id: "a", text: "Sanitised and wiped completely dry" },
      { id: "b", text: "Left for the morning" },
      { id: "c", text: "Wiped on weekends only" },
      { id: "d", text: "Covered with a towel" },
    ],
    answer: "a",
    explanation: "Sticky spirits on the speed rail breed bacteria overnight and attract fruit flies by morning — both a hygiene and pest issue.",
    reviewed: true,
  },
  {
    id: "q3",
    concept: "s3",
    difficulty: 2,
    format: "multiple_choice",
    prompt: "Whose job is restocking the dry goods?",
    options: [
      { id: "a", text: "The closing shift's" },
      { id: "b", text: "The opening shift's" },
      { id: "c", text: "The manager's" },
      { id: "d", text: "Whoever has time" },
    ],
    answer: "a",
    explanation: "The closing shift is responsible for leaving the dry store in correct order. The morning team should only need to start, not clean up.",
    reviewed: true,
  },
  {
    id: "q4",
    concept: "s4",
    difficulty: 1,
    format: "multiple_choice",
    prompt: "When are the glasses polished and racked?",
    options: [
      { id: "a", text: "Before the close checklist is signed off" },
      { id: "b", text: "In the morning" },
      { id: "c", text: "Only on busy nights" },
      { id: "d", text: "Once a week" },
    ],
    answer: "a",
    explanation: "Spotted or dirty glasses sitting in a service rack for the next day is a mark of a poor close that embarrasses the venue.",
    reviewed: true,
  },
  {
    id: "q5",
    concept: "s5",
    difficulty: 1,
    format: "spot_mistake",
    prompt: "A closer reads out what they did. Which part is wrong?",
    options: [
      { id: "a", text: "Sanitised and dried the speed rail" },
      { id: "b", text: "Left the dirty mop water for the morning" },
      { id: "c", text: "Restocked the dry store" },
      { id: "d", text: "Signed the close checklist" },
    ],
    answer: "b",
    explanation: "Dirty water left overnight grows dangerous bacteria levels and produces a foul smell that permeates the venue by morning.",
    reviewed: true,
  },
  {
    id: "q6",
    concept: "s6",
    difficulty: 2,
    format: "multiple_choice",
    prompt: "Why sign off the close checklist?",
    options: [
      { id: "a", text: "It creates accountability and records the venue was left safe" },
      { id: "b", text: "It's only paperwork" },
      { id: "c", text: "So you get paid" },
      { id: "d", text: "Only the manager needs to" },
    ],
    answer: "a",
    explanation: "The checklist is both the legal record and the operational standard for every close. No checklist means no accountability.",
    reviewed: true,
  },
  {
    id: "q7",
    concept: "s7",
    difficulty: 1,
    format: "multiple_choice",
    prompt: "It was a quiet night. What about the floor?",
    options: [
      { id: "a", text: "Mop it: standards don't change with covers" },
      { id: "b", text: "A sweep is enough" },
      { id: "c", text: "Leave it for the morning" },
      { id: "d", text: "Mop only behind the bar" },
    ],
    answer: "a",
    explanation: "Floor hygiene standards are constant regardless of covers. Quiet nights are in fact the easiest time to do a thorough mop.",
    reviewed: true,
  },
  {
    id: "q8",
    concept: "s6",
    difficulty: 3,
    format: "order_steps",
    prompt: "Put these closing tasks in order.",
    steps: [
      { id: "a", text: "Sanitise and dry the speed rail" },
      { id: "b", text: "Polish and rack the glassware" },
      { id: "c", text: "Restock the dry goods" },
      { id: "d", text: "Mop the floor and empty the mop bucket" },
      { id: "e", text: "Sign off the close checklist" },
    ],
    explanation: "Clean and restock first, finish with the floor so it isn't walked on, and sign the checklist last as the record that the venue was left safe.",
    reviewed: true,
  },
];
