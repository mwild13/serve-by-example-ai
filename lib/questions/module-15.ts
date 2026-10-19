// Module 15, RSA Compliance: questions in the new formats, written from the
// module's True/False statements (lib/verify-questions.ts). Each `concept`
// names the statement it comes from.
//
// Approved by the owner on 2026-10-19 (batch 5). Review copy:
// docs/Rich Update/batch-5-compliance-a.md.
import "server-only";
import type { Question } from "@/lib/question-bank";

export const MODULE_15_QUESTIONS: Question[] = [
  {
    id: "q1",
    concept: "s0",
    difficulty: 1,
    format: "multiple_choice",
    prompt: "An intoxicated guest orders a meal and another beer. What do you do?",
    options: [
      { id: "a", text: "Serve the beer, because they're eating" },
      { id: "b", text: "Refuse the alcohol: food doesn't change that they're intoxicated" },
      { id: "c", text: "Serve a light beer instead" },
      { id: "d", text: "Serve it once the food arrives" },
    ],
    answer: "b",
    explanation: "By law, food does not override intoxication. An unduly intoxicated patron must be refused service and removed.",
    reviewed: true,
  },
  {
    id: "q2",
    concept: "s1",
    difficulty: 1,
    format: "spot_mistake",
    prompt: "Which of these is NOT a sign of intoxication?",
    options: [
      { id: "a", text: "Slurred words" },
      { id: "b", text: "Losing coordination" },
      { id: "c", text: "Ordering a glass of water" },
      { id: "d", text: "Swaying on the spot" },
    ],
    answer: "c",
    explanation: "Slurring words and loss of coordination are classic physical signs that a patron has consumed too much alcohol and must be cut off. Asking for water isn't one of them.",
    reviewed: true,
  },
  {
    id: "q3",
    concept: "s3",
    difficulty: 1,
    format: "multiple_choice",
    prompt: "A guest asks for a glass of water. What does it cost?",
    options: [
      { id: "a", text: "Nothing: free drinking water must be available" },
      { id: "b", text: "The price of a soft drink" },
      { id: "c", text: "Free only if they're buying alcohol" },
      { id: "d", text: "Free only after 10 pm" },
    ],
    answer: "a",
    explanation: "All licensed Australian venues must provide free, accessible drinking water to patrons at all times.",
    reviewed: true,
  },
  {
    id: "q4",
    concept: "s4",
    difficulty: 2,
    format: "multiple_choice",
    prompt: "What can happen to you if you serve an unduly intoxicated patron?",
    options: [
      { id: "a", text: "Nothing, it's the venue's problem" },
      { id: "b", text: "A fine, and losing your RSA certificate" },
      { id: "c", text: "A warning from your manager only" },
      { id: "d", text: "Nothing if they asked politely" },
    ],
    answer: "b",
    explanation: "Failing to refuse service risks massive fines, loss of your personal RSA certificate, and venue closure.",
    reviewed: true,
  },
  {
    id: "q5",
    concept: "s5",
    difficulty: 1,
    format: "best_line",
    prompt: "A guest who's clearly swaying asks for \"one last beer\". What's the best thing to say?",
    options: [
      { id: "a", text: "\"Sure, but that's the last one.\"" },
      { id: "b", text: "\"I can't serve you any more alcohol tonight, mate. Can I get you a water or a soft drink?\"" },
      { id: "c", text: "\"Only if you sit down.\"" },
      { id: "d", text: "\"Ask the other bartender.\"" },
    ],
    answer: "b",
    explanation: "There is no 'one more.' The moment a patron shows clear signs of undue intoxication, alcohol service stops. Offering water keeps it friendly.",
    reviewed: true,
  },
  {
    id: "q6",
    concept: "s6",
    difficulty: 2,
    format: "best_line",
    prompt: "You've refused service and the guest is getting annoyed. What's the best thing to say?",
    options: [
      { id: "a", text: "\"You've had enough. Leave.\"" },
      { id: "b", text: "\"I'm sorry, legally I can't. I could lose my job and face a big fine.\"" },
      { id: "c", text: "\"It's my call and I've made it.\"" },
      { id: "d", text: "\"Fine, one more and that's it.\"" },
    ],
    answer: "b",
    explanation: "Saying 'I could lose my job and face a massive fine' shifts the blame from you to the government.",
    reviewed: true,
  },
  {
    id: "q7",
    concept: "s7",
    difficulty: 1,
    format: "multiple_choice",
    prompt: "A guest shows you a university student card as ID. Is it enough to prove their age?",
    options: [
      { id: "a", text: "Yes, it has a photo" },
      { id: "b", text: "No: you need government-issued ID such as a driver's licence or passport" },
      { id: "c", text: "Yes, if it's in date" },
      { id: "d", text: "Only on a quiet night" },
    ],
    answer: "b",
    explanation: "Only government-issued ID (Driver's Licence, Passport, Keypass) is legally acceptable for age verification in Australia.",
    reviewed: true,
  },
  {
    id: "q8",
    concept: "s0",
    difficulty: 3,
    format: "order_steps",
    prompt: "A guest is showing clear signs of undue intoxication. Put these in order.",
    steps: [
      { id: "a", text: "Stop serving them alcohol" },
      { id: "b", text: "Tell them calmly, and blame the law, not them" },
      { id: "c", text: "Offer water or a soft drink" },
      { id: "d", text: "Tell the manager" },
    ],
    explanation: "An unduly intoxicated patron must be refused service. Blaming the law takes the heat out of it, water keeps it friendly, and the manager needs to know.",
    reviewed: true,
  },
];
