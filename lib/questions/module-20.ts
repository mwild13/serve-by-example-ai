// Module 20, Inventory Control: questions in the new formats, written from the
// module's True/False statements (lib/verify-questions.ts). Each `concept`
// names the statement it comes from.
//
// Approved by the owner on 2026-10-19 (batch 5). Review copy:
// docs/Rich Update/batch-5-compliance-a.md.
import "server-only";
import type { Question } from "@/lib/question-bank";

export const MODULE_20_QUESTIONS: Question[] = [
  {
    id: "q1",
    concept: "s0",
    difficulty: 2,
    format: "multiple_choice",
    prompt: "What does over-pouring spirits do to the venue?",
    options: [
      { id: "a", text: "Costs it gross profit on every drink" },
      { id: "b", text: "Makes guests tip more" },
      { id: "c", text: "Nothing, as long as it's only a little" },
      { id: "d", text: "Speeds up service" },
    ],
    answer: "a",
    explanation: "A heavy hand ruins the 30ml yield. Over-pouring just 5ml every drink destroys the bar's gross profit margin.",
    reviewed: true,
  },
  {
    id: "q2",
    concept: "s1",
    difficulty: 1,
    format: "multiple_choice",
    prompt: "A friend comes in and you want to shout them a drink. What's the rule?",
    options: [
      { id: "a", text: "Free drinks are fine for friends" },
      { id: "b", text: "Comps must be approved and logged in the POS by a manager" },
      { id: "c", text: "One free drink a shift is fine" },
      { id: "d", text: "Only on a quiet night" },
    ],
    answer: "b",
    explanation: "Unauthorized comps are legally considered theft. All free drinks must be approved and logged in the POS by a manager.",
    reviewed: true,
  },
  {
    id: "q3",
    concept: "s2",
    difficulty: 1,
    format: "multiple_choice",
    prompt: "You drop and break a bottle of vodka. What now?",
    options: [
      { id: "a", text: "Clean it up and say nothing" },
      { id: "b", text: "Record it in the wastage log" },
      { id: "c", text: "Replace it from another bar" },
      { id: "d", text: "Pay for it yourself" },
    ],
    answer: "b",
    explanation: "Logging waste ensures the stocktake balances at the end of the month, explaining exactly where the lost inventory went.",
    reviewed: true,
  },
  {
    id: "q4",
    concept: "s3",
    difficulty: 1,
    format: "multiple_choice",
    prompt: "What does first-in, first-out mean?",
    options: [
      { id: "a", text: "Use the oldest stock before the newest" },
      { id: "b", text: "Use the newest stock first" },
      { id: "c", text: "Serve the first guest first" },
      { id: "d", text: "Order stock on the first of the month" },
    ],
    answer: "a",
    explanation: "This FIFO principle ensures perishables like milk, juice, and kegs are used before they expire and become waste.",
    reviewed: true,
  },
  {
    id: "q5",
    concept: "s4",
    difficulty: 1,
    format: "spot_mistake",
    prompt: "Which of these breaks the health rules?",
    options: [
      { id: "a", text: "Logging a dropped bottle" },
      { id: "b", text: "Pouring leftover wine from a guest's glass back into the bottle" },
      { id: "c", text: "Rotating juice with FIFO" },
      { id: "d", text: "Using a jigger" },
    ],
    answer: "b",
    explanation: "This is a severe health violation. Once a liquid has touched a guest's glass, it must be poured down the drain.",
    reviewed: true,
  },
  {
    id: "q6",
    concept: "s5",
    difficulty: 2,
    format: "multiple_choice",
    prompt: "What does an accurate stocktake depend on?",
    options: [
      { id: "a", text: "Counting every item, from coolroom kegs to open bottles on the speed rail" },
      { id: "b", text: "Counting only full bottles" },
      { id: "c", text: "Estimating from the POS" },
      { id: "d", text: "Counting only the expensive stock" },
    ],
    answer: "a",
    explanation: "From the coolroom kegs to the half-empty bottles on the speed rail, every drop must be accounted for monthly.",
    reviewed: true,
  },
  {
    id: "q7",
    concept: "s7",
    difficulty: 2,
    format: "multiple_choice",
    prompt: "There's a half-full keg in the coolroom. What do you do with it?",
    options: [
      { id: "a", text: "Throw it out, it's a weekly routine" },
      { id: "b", text: "Keep using it: kegs have a long shelf life" },
      { id: "c", text: "Pour it down the drain and log it" },
      { id: "d", text: "Send it back to the brewery" },
    ],
    answer: "b",
    explanation: "Kegs have a long shelf life. Throwing away a half keg is a massive financial loss and indicates terrible stock management.",
    reviewed: true,
  },
];
