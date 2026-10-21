// Module 37, The Out-of-Stock Pivot: questions in the new formats, written from the
// module's True/False statements (lib/verify-questions.ts). Each `concept`
// names the statement it comes from.
//
// Approved by the owner on 2026-10-19 (batch 4). Review copy:
// docs/Rich Update/batch-4-service-b.md.
import "server-only";
import type { Question } from "@/lib/question-bank";

export const MODULE_37_QUESTIONS: Question[] = [
  {
    id: "q1",
    concept: "s0",
    difficulty: 1,
    format: "multiple_choice",
    prompt: "A guest orders something that's run out. What must you do?",
    options: [
      { id: "a", text: "Tell them and move on" },
      { id: "b", text: "Suggest a specific alternative straight away" },
      { id: "c", text: "Ask them to order something else" },
      { id: "d", text: "Get the manager" },
    ],
    answer: "b",
    explanation: "A direct suggestion prevents the guest from feeling stranded without a path forward.",
    reviewed: true,
  },
  {
    id: "q2",
    concept: "s1",
    difficulty: 1,
    format: "spot_mistake",
    prompt: "Which response to a stock-out is wrong?",
    options: [
      { id: "a", text: "\"Sorry, we're out of that.\" Then walk away" },
      { id: "b", text: "\"We're out of the Pinot, but the Grenache is very similar.\"" },
      { id: "c", text: "One brief apology" },
      { id: "d", text: "Suggesting the closest match" },
    ],
    answer: "a",
    explanation: "Ending the conversation at \"we're out\" is a dead-end. The pivot, the alternative suggestion, is the part that saves the sale.",
    reviewed: true,
  },
  {
    id: "q3",
    concept: "s2",
    difficulty: 3,
    format: "order_steps",
    prompt: "Put the pivot in order.",
    steps: [
      { id: "a", text: "Acknowledge that it's unavailable" },
      { id: "b", text: "Redirect to a comparable item" },
      { id: "c", text: "Present it as a genuine recommendation" },
    ],
    explanation: "Acknowledge, redirect, and present the alternative as a genuine recommendation. This three-step pivot saves almost every stock-out situation.",
    reviewed: true,
  },
  {
    id: "q4",
    concept: "s3",
    difficulty: 2,
    format: "multiple_choice",
    prompt: "What alternative should you offer when a guest's choice has run out?",
    options: [
      { id: "a", text: "The cheapest one" },
      { id: "b", text: "The most similar one" },
      { id: "c", text: "The most expensive one" },
      { id: "d", text: "Whatever you have most of" },
    ],
    answer: "b",
    explanation: "Guests want the best equivalent experience, not the cheapest consolation. Offer the most genuinely similar product.",
    reviewed: true,
  },
  {
    id: "q5",
    concept: "s4",
    difficulty: 1,
    format: "multiple_choice",
    prompt: "What lets you suggest a genuine alternative with confidence?",
    options: [
      { id: "a", text: "Deep menu knowledge" },
      { id: "b", text: "A script from the manager" },
      { id: "c", text: "Guessing" },
      { id: "d", text: "Asking the guest what they'd like" },
    ],
    answer: "a",
    explanation: "You cannot pivot to an alternative if you do not know what is comparable on the menu. Product knowledge is the foundation.",
    reviewed: true,
  },
  {
    id: "q6",
    concept: "s5",
    difficulty: 2,
    format: "multiple_choice",
    prompt: "How many times should you apologise for a stock-out?",
    options: [
      { id: "a", text: "Once, briefly" },
      { id: "b", text: "Several times, so they know you care" },
      { id: "c", text: "Never" },
      { id: "d", text: "Every time you return to the table" },
    ],
    answer: "a",
    explanation: "A single brief apology is professional. Over-apologising draws more attention to the failure and makes guests feel worse, not better.",
    reviewed: true,
  },
  {
    id: "q7",
    concept: "s6",
    difficulty: 1,
    format: "best_line",
    prompt: "A guest wants the Pinot Noir, but it's run out. What's the best thing to say?",
    options: [
      { id: "a", text: "\"Sorry, we're out.\"" },
      { id: "b", text: "\"We're out of the Pinot tonight, sorry. Our house red is very similar, and it actually pairs better with that dish.\"" },
      { id: "c", text: "\"So sorry, really sorry, I'm so sorry.\"" },
      { id: "d", text: "\"The cheapest red is fine, isn't it?\"" },
    ],
    answer: "b",
    explanation: "This reframes the alternative as a positive recommendation rather than a consolation prize, keeping the guest's enthusiasm high.",
    reviewed: true,
  },
  {
    id: "q8",
    concept: "s7",
    difficulty: 1,
    format: "multiple_choice",
    prompt: "Who needs to know what's sold out at the start of service?",
    options: [
      { id: "a", text: "Only the bartenders" },
      { id: "b", text: "All floor staff" },
      { id: "c", text: "Only the manager" },
      { id: "d", text: "Only the kitchen" },
    ],
    answer: "b",
    explanation: "All floor staff must be told what's sold out at the start of every service, so no one promises a guest something the kitchen can't make.",
    reviewed: true,
  },
];
