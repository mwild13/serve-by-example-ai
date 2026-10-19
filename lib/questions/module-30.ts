// Module 30, Beating the Weed: questions in the new formats, written from the
// module's True/False statements (lib/verify-questions.ts). Each `concept`
// names the statement it comes from.
//
// Drafts until the owner approves them: `reviewed: false` keeps them out of
// every run. Review copy: docs/Rich Update/batch-4-service-b.md.
import "server-only";
import type { Question } from "@/lib/question-bank";

export const MODULE_30_QUESTIONS: Question[] = [
  {
    id: "q1",
    concept: "s0",
    difficulty: 1,
    format: "multiple_choice",
    prompt: "What does \"being in the weed\" mean?",
    options: [
      { id: "a", text: "Being completely overwhelmed in a rush" },
      { id: "b", text: "Working the outdoor area" },
      { id: "c", text: "Being on a break" },
      { id: "d", text: "Having a quiet section" },
    ],
    answer: "a",
    explanation: "Every hospitality worker will experience being in the weed. Knowing how to escape it methodically is the defining skill.",
    reviewed: false,
  },
  {
    id: "q2",
    concept: "s1",
    difficulty: 2,
    format: "multiple_choice",
    prompt: "You're in the weed. What's the way out?",
    options: [
      { id: "a", text: "Speed up and stop talking" },
      { id: "b", text: "Acknowledge everyone, breathe, and work the tickets in order" },
      { id: "c", text: "Serve whoever is loudest" },
      { id: "d", text: "Take a long break" },
    ],
    answer: "b",
    explanation: "Speeding up causes errors and silence makes guests angrier. Acknowledge everyone, breathe, and work the tickets in order.",
    reviewed: false,
  },
  {
    id: "q3",
    concept: "s2",
    difficulty: 1,
    format: "best_line",
    prompt: "Four guests are waiting and you're swamped. What's the best thing to say as you pass?",
    options: [
      { id: "a", text: "Nothing: just keep working" },
      { id: "b", text: "\"With you in a moment.\"" },
      { id: "c", text: "\"I'm so busy, sorry.\"" },
      { id: "d", text: "\"Who was first?\"" },
    ],
    answer: "b",
    explanation: "Being seen and verbally acknowledged resets a guest's patience, buying you critical time to work through the backlog.",
    reviewed: false,
  },
  {
    id: "q4",
    concept: "s3",
    difficulty: 2,
    format: "multiple_choice",
    prompt: "You're already overwhelmed and the manager offers you another table. What's the smart move?",
    options: [
      { id: "a", text: "Take it to show your work ethic" },
      { id: "b", text: "Say you're at capacity and ask for help" },
      { id: "c", text: "Take it and rush the other tables" },
      { id: "d", text: "Say yes and hope for the best" },
    ],
    answer: "b",
    explanation: "Overloading your section causes all your tables to suffer. Knowing your capacity limit and calling for help is the smarter move.",
    reviewed: false,
  },
  {
    id: "q5",
    concept: "s4",
    difficulty: 2,
    format: "multiple_choice",
    prompt: "In a rush, which order do you work your tickets in?",
    options: [
      { id: "a", text: "The order they came in" },
      { id: "b", text: "Easiest first" },
      { id: "c", text: "Biggest spend first" },
      { id: "d", text: "Whichever guest is loudest" },
    ],
    answer: "a",
    explanation: "\"Slow is smooth, smooth is fast.\" Orderly first-in-first-out service consistently produces better outcomes than reactive scrambling.",
    reviewed: false,
  },
  {
    id: "q6",
    concept: "s5",
    difficulty: 2,
    format: "multiple_choice",
    prompt: "Why take a short pause to think in the middle of a rush?",
    options: [
      { id: "a", text: "To pick the two or three most important tasks, instead of panicking" },
      { id: "b", text: "To rest your legs" },
      { id: "c", text: "It isn't worth it: just keep moving" },
      { id: "d", text: "To check your phone" },
    ],
    answer: "a",
    explanation: "A conscious pause to identify the two or three most critical tasks is far more productive than 30 seconds of reactive panic.",
    reviewed: false,
  },
  {
    id: "q7",
    concept: "s6",
    difficulty: 3,
    format: "order_steps",
    prompt: "You're in the weed. Put these in order.",
    steps: [
      { id: "a", text: "Acknowledge every waiting guest" },
      { id: "b", text: "Pause to pick the most critical tasks" },
      { id: "c", text: "Call a colleague for help" },
      { id: "d", text: "Work the tickets in the order they came in" },
    ],
    explanation: "Acknowledging guests buys time, a short pause sets your priorities, calling for help early protects the team, and working in order beats reactive scrambling.",
    reviewed: false,
  },
  {
    id: "q8",
    concept: "s7",
    difficulty: 2,
    format: "spot_mistake",
    prompt: "A new starter explains how they cope with a rush. Which part is wrong?",
    options: [
      { id: "a", text: "I tell waiting guests I'll be with them in a moment" },
      { id: "b", text: "I let guests see I'm struggling, so they're patient" },
      { id: "c", text: "I work tickets in order" },
      { id: "d", text: "I ask for help early" },
    ],
    answer: "b",
    explanation: "Guests are paying for a service experience. Visible distress from staff makes them uncomfortable and less likely to return or tip.",
    reviewed: false,
  },
];
