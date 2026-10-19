// Module 24, Ice Is Food: questions in the new formats, written from the
// module's True/False statements (lib/verify-questions.ts). Each `concept`
// names the statement it comes from.
//
// Approved by the owner on 2026-10-19 (batch 6). Review copy:
// docs/Rich Update/batch-6-compliance-b.md.
import "server-only";
import type { Question } from "@/lib/question-bank";

export const MODULE_24_QUESTIONS: Question[] = [
  {
    id: "q1",
    concept: "s0",
    difficulty: 1,
    format: "multiple_choice",
    prompt: "How is ice treated under Australian food safety law?",
    options: [
      { id: "a", text: "As food" },
      { id: "b", text: "As a cleaning product" },
      { id: "c", text: "It isn't covered" },
      { id: "d", text: "As packaging" },
    ],
    answer: "a",
    explanation: "Because ice enters food and drinks directly, contaminating it carries the same legal and health consequences as contaminating food.",
    reviewed: true,
  },
  {
    id: "q2",
    concept: "s1",
    difficulty: 2,
    format: "multiple_choice",
    prompt: "You're wearing food-safe gloves. Can you grab ice with your hand?",
    options: [
      { id: "a", text: "Yes, gloves make it safe" },
      { id: "b", text: "No: the scoop is non-negotiable" },
      { id: "c", text: "Yes, for one glass" },
      { id: "d", text: "Only from the ice machine" },
    ],
    answer: "b",
    explanation: "Even gloved hands introduce warmth that melts ice and bacteria that can persist on glove surfaces. The scoop is non-negotiable.",
    reviewed: true,
  },
  {
    id: "q3",
    concept: "s2",
    difficulty: 2,
    format: "multiple_choice",
    prompt: "Which way should the ice scoop handle face?",
    options: [
      { id: "a", text: "Up, out of the ice" },
      { id: "b", text: "Buried in the ice" },
      { id: "c", text: "Flat on top of the ice" },
      { id: "d", text: "It doesn't matter" },
    ],
    answer: "a",
    explanation: "A handle buried in ice forces the staff member to grab the scoop above the bowl, meaning their hand is directly over the ice.",
    reviewed: true,
  },
  {
    id: "q4",
    concept: "s3",
    difficulty: 1,
    format: "spot_mistake",
    prompt: "Which of these breaks the ice hygiene rules?",
    options: [
      { id: "a", text: "Keeping the scoop handle out of the ice" },
      { id: "b", text: "Leaving the ice machine lid open during service" },
      { id: "c", text: "Removing a chipped scoop" },
      { id: "d", text: "Using the designated ice bucket" },
    ],
    answer: "b",
    explanation: "An open lid allows airborne contaminants, insects, and moisture to enter the machine and contaminate every batch of ice produced.",
    reviewed: true,
  },
  {
    id: "q5",
    concept: "s4",
    difficulty: 1,
    format: "multiple_choice",
    prompt: "You notice the ice scoop is cracked. What do you do?",
    options: [
      { id: "a", text: "Keep using it carefully" },
      { id: "b", text: "Remove it from service straight away" },
      { id: "c", text: "Tape it up" },
      { id: "d", text: "Use it only for the kitchen well" },
    ],
    answer: "b",
    explanation: "A broken scoop can shed plastic fragments into the ice well, which then enters guest drinks invisibly.",
    reviewed: true,
  },
  {
    id: "q6",
    concept: "s5",
    difficulty: 1,
    format: "best_line",
    prompt: "The scoop is missing and a colleague reaches for a pint glass to scoop ice. What's the best thing to say?",
    options: [
      { id: "a", text: "Say nothing, it's an emergency" },
      { id: "b", text: "\"Don't use the glass. I'll grab you a scoop.\"" },
      { id: "c", text: "\"Be careful not to chip it.\"" },
      { id: "d", text: "\"Just this once.\"" },
    ],
    answer: "b",
    explanation: "Glass on ice causes chips and is one of the most dangerous acts behind a bar. Find the scoop or ask a colleague for one.",
    reviewed: true,
  },
  {
    id: "q7",
    concept: "s6",
    difficulty: 1,
    format: "multiple_choice",
    prompt: "How often are ice machines cleaned and sanitised?",
    options: [
      { id: "a", text: "On a regular schedule" },
      { id: "b", text: "Only when the ice looks cloudy" },
      { id: "c", text: "Never: ice is frozen, so it's clean" },
      { id: "d", text: "Once a year" },
    ],
    answer: "a",
    explanation: "Bio-film builds up inside machines and can contaminate every batch of ice produced if the machine is not sanitized regularly.",
    reviewed: true,
  },
  {
    id: "q8",
    concept: "s7",
    difficulty: 2,
    format: "multiple_choice",
    prompt: "You need to move ice from one well to another. What do you carry it in?",
    options: [
      { id: "a", text: "The designated clean ice bucket" },
      { id: "b", text: "Any clean container" },
      { id: "c", text: "A pint glass" },
      { id: "d", text: "A mop bucket that's been rinsed" },
    ],
    answer: "a",
    explanation: "Cross-well transfers must follow the same scoop-only hygiene protocol. The container must be the designated clean ice bucket.",
    reviewed: true,
  },
];
