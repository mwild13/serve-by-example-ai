// Module 36, Two-Minute Check: questions in the new formats, written from the
// module's True/False statements (lib/verify-questions.ts). Each `concept`
// names the statement it comes from.
//
// Approved by the owner on 2026-10-19 (batch 4). Review copy:
// docs/Rich Update/batch-4-service-b.md.
import "server-only";
import type { Question } from "@/lib/question-bank";

export const MODULE_36_QUESTIONS: Question[] = [
  {
    id: "q1",
    concept: "s0",
    difficulty: 1,
    format: "multiple_choice",
    prompt: "When does the two-minute check happen?",
    options: [
      { id: "a", text: "About two minutes after the food is served" },
      { id: "b", text: "Two minutes after the order is taken" },
      { id: "c", text: "Two minutes before the bill" },
      { id: "d", text: "Whenever you have two minutes free" },
    ],
    answer: "a",
    explanation: "Two minutes is enough time for the guest to take a first bite and discover any issue, but early enough for the kitchen to fix it.",
    reviewed: true,
  },
  {
    id: "q2",
    concept: "s1",
    difficulty: 1,
    format: "multiple_choice",
    prompt: "Which tables need a two-minute check?",
    options: [
      { id: "a", text: "Only complicated orders" },
      { id: "b", text: "Every table" },
      { id: "c", text: "Only new menu items" },
      { id: "d", text: "Only tables that look unhappy" },
    ],
    answer: "b",
    explanation: "Every single table requires a two-minute check, regardless of how simple the order was. Any dish can have a problem.",
    reviewed: true,
  },
  {
    id: "q3",
    concept: "s2",
    difficulty: 2,
    format: "multiple_choice",
    prompt: "Why wait until after the first bite to check?",
    options: [
      { id: "a", text: "Before that, they can't tell you about a problem" },
      { id: "b", text: "It's polite to let them settle" },
      { id: "c", text: "So the kitchen has time to clean up" },
      { id: "d", text: "It doesn't matter when you check" },
    ],
    answer: "a",
    explanation: "Checking before they have eaten means they cannot yet report a problem. Timing the check to the first bite is everything.",
    reviewed: true,
  },
  {
    id: "q4",
    concept: "s3",
    difficulty: 1,
    format: "best_line",
    prompt: "You're doing the two-minute check on a steak. What's the best question?",
    options: [
      { id: "a", text: "\"Is everything okay?\"" },
      { id: "b", text: "\"How is the steak cooked for you?\"" },
      { id: "c", text: "\"All good here?\"" },
      { id: "d", text: "\"Can I take anything?\"" },
    ],
    answer: "b",
    explanation: "\"Okay\" invites a one-word dismissal. Better: \"How is the steak cooked for you?\" A specific question gets a specific, useful answer.",
    reviewed: true,
  },
  {
    id: "q5",
    concept: "s4",
    difficulty: 2,
    format: "multiple_choice",
    prompt: "At the check, a guest says their steak is cold. What now?",
    options: [
      { id: "a", text: "Apologise and leave it" },
      { id: "b", text: "Have it refired: caught this early, it can still be saved" },
      { id: "c", text: "Offer a discount" },
      { id: "d", text: "Microwave it" },
    ],
    answer: "b",
    explanation: "A cold steak caught at two minutes can be corrected before the guest becomes visibly frustrated or loses their appetite.",
    reviewed: true,
  },
  {
    id: "q6",
    concept: "s5",
    difficulty: 2,
    format: "spot_mistake",
    prompt: "A new starter explains the two-minute check. Which part is wrong?",
    options: [
      { id: "a", text: "I go back after the first bite" },
      { id: "b", text: "I ask a specific question" },
      { id: "c", text: "I skip it so I don't interrupt their meal" },
      { id: "d", text: "I check every table" },
    ],
    answer: "c",
    explanation: "A brief, professional check enhances the experience by showing attentiveness. It is neglect, not attention, that ruins a meal.",
    reviewed: true,
  },
  {
    id: "q7",
    concept: "s6",
    difficulty: 2,
    format: "multiple_choice",
    prompt: "What's the risk of missing the two-minute window?",
    options: [
      { id: "a", text: "Problems come out when it's too late to fix them" },
      { id: "b", text: "The guest leaves a smaller tip" },
      { id: "c", text: "The kitchen gets annoyed" },
      { id: "d", text: "Nothing, you can check later" },
    ],
    answer: "a",
    explanation: "A guest who has eaten half a cold meal before complaining cannot have their experience fully recovered. The window is everything.",
    reviewed: true,
  },
  {
    id: "q8",
    concept: "s3",
    difficulty: 3,
    format: "order_steps",
    prompt: "Put the two-minute check in order.",
    steps: [
      { id: "a", text: "Serve the food" },
      { id: "b", text: "Wait for the guests to take their first bites" },
      { id: "c", text: "Ask a specific question about the dish" },
      { id: "d", text: "Fix any problem straight away" },
    ],
    explanation: "The check works only after the first bite, and a specific question gets a specific, useful answer while there's still time to fix it.",
    reviewed: true,
  },
];
