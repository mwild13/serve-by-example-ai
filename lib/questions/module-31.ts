// Module 31, Jigger Precision: questions in the new formats, written from the
// module's True/False statements (lib/verify-questions.ts). Each `concept`
// names the statement it comes from.
//
// Drafts until the owner approves them: `reviewed: false` keeps them out of
// every run. Review copy: docs/Rich Update/batch-6-compliance-b.md.
import "server-only";
import type { Question } from "@/lib/question-bank";

export const MODULE_31_QUESTIONS: Question[] = [
  {
    id: "q1",
    concept: "s0",
    difficulty: 2,
    format: "number",
    prompt: "How many millilitres is a standard single spirit pour in most Australian venues?",
    unit: "ml",
    answer: 30,
    tolerance: 0,
    explanation: "30ml is the standard single spirit measure in most Australian venues. Use your venue's jigger for every pour.",
    reviewed: false,
  },
  {
    id: "q2",
    concept: "s2",
    difficulty: 2,
    format: "multiple_choice",
    prompt: "What is the meniscus?",
    options: [
      { id: "a", text: "The slight curve of liquid at the top of a full jigger" },
      { id: "b", text: "The line inside the jigger" },
      { id: "c", text: "The bottom of the jigger" },
      { id: "d", text: "A type of pour spout" },
    ],
    answer: "a",
    explanation: "Reading the meniscus at eye level, not from above, ensures the pour is exactly 30ml and not a milliliter over.",
    reviewed: false,
  },
  {
    id: "q3",
    concept: "s2",
    difficulty: 2,
    format: "multiple_choice",
    prompt: "How should you read a jigger?",
    options: [
      { id: "a", text: "At eye level" },
      { id: "b", text: "From above" },
      { id: "c", text: "By feel" },
      { id: "d", text: "By counting" },
    ],
    answer: "a",
    explanation: "Reading the meniscus at eye level, not from above, ensures the pour is exactly 30ml and not a milliliter over.",
    reviewed: false,
  },
  {
    id: "q4",
    concept: "s3",
    difficulty: 2,
    format: "number",
    prompt: "You over-pour by 5 ml on 200 drinks. How many litres of spirits have you given away?",
    unit: "litres",
    answer: 1,
    tolerance: 0,
    explanation: "At 200 drinks per night, 5ml over means 1 full litre of spirits given away for free, a devastating impact on gross profit.",
    reviewed: false,
  },
  {
    id: "q5",
    concept: "s5",
    difficulty: 1,
    format: "spot_mistake",
    prompt: "Which of these is wrong?",
    options: [
      { id: "a", text: "Measuring every spirit pour" },
      { id: "b", text: "Using the jigger only for cocktails" },
      { id: "c", text: "Reading the jigger at eye level" },
      { id: "d", text: "Logging any spill" },
    ],
    answer: "b",
    explanation: "Every single spirit pour, regardless of the drink's complexity, must be measured to maintain compliance and GP consistency.",
    reviewed: false,
  },
  {
    id: "q6",
    concept: "s6",
    difficulty: 2,
    format: "multiple_choice",
    prompt: "The stocktake shows more spirits used than the POS has sold. What's the likely cause?",
    options: [
      { id: "a", text: "Over-pouring or theft" },
      { id: "b", text: "A POS update" },
      { id: "c", text: "Evaporation" },
      { id: "d", text: "Too many cocktails" },
    ],
    answer: "a",
    explanation: "If stocktake shows more spirits used than POS sales account for, over-pouring or theft is the culprit.",
    reviewed: false,
  },
  {
    id: "q7",
    concept: "s7",
    difficulty: 1,
    format: "best_line",
    prompt: "A guest asks for \"a bit extra\" in their bourbon. What's the best thing to say?",
    options: [
      { id: "a", text: "\"Sure, just for you.\"" },
      { id: "b", text: "\"I can't pour extra, but I can make it a double if you like.\"" },
      { id: "c", text: "\"No.\"" },
      { id: "d", text: "Pour extra and don't charge" },
    ],
    answer: "b",
    explanation: "Unauthorised over-pours are both a compliance and a theft issue. Offer a double, charged as a double. Only a manager can approve anything free.",
    reviewed: false,
  },
];
