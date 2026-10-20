// Module 14, Phone Etiquette: questions in the new formats, written from the
// module's True/False statements (lib/verify-questions.ts). Each `concept`
// names the statement it comes from.
//
// Approved by the owner on 2026-10-19 (batch 3). Review copy:
// docs/Rich Update/batch-3-service-a.md.
import "server-only";
import type { Question } from "@/lib/question-bank";

export const MODULE_14_QUESTIONS: Question[] = [
  {
    id: "q2",
    concept: "s7",
    difficulty: 1,
    format: "best_line",
    prompt: "The phone rings. What's the best way to answer?",
    options: [
      { id: "a", text: "\"Hello?\"" },
      { id: "b", text: "\"Yep?\"" },
      { id: "c", text: "\"Good evening, [venue name], this is Sam speaking.\"" },
      { id: "d", text: "\"Can you hold?\"" },
    ],
    answer: "c",
    explanation: "A standard greeting confirms they called the right place and immediately establishes a professional first impression.",
    reviewed: true,
  },
  {
    id: "q3",
    concept: "s1",
    difficulty: 2,
    format: "multiple_choice",
    prompt: "A caller keeps swearing at you. What do you do?",
    options: [
      { id: "a", text: "Hang up straight away" },
      { id: "b", text: "Warn them politely that you'll end the call if it continues, then do so" },
      { id: "c", text: "Swear back" },
      { id: "d", text: "Put them on hold forever" },
    ],
    answer: "b",
    explanation: "You must remain professional. Warn them politely that you will disconnect if the language continues, then hang up.",
    reviewed: true,
  },
  {
    id: "q4",
    concept: "s2",
    difficulty: 1,
    format: "multiple_choice",
    prompt: "What must you take to put someone on the waitlist?",
    options: [
      { id: "a", text: "Their name and number" },
      { id: "b", text: "Their credit card" },
      { id: "c", text: "Just their first name" },
      { id: "d", text: "Nothing, they'll call back" },
    ],
    answer: "a",
    explanation: "Without contact details, you cannot recall them when a table frees up, leading to empty tables and lost revenue.",
    reviewed: true,
  },
  {
    id: "q5",
    concept: "s3",
    difficulty: 3,
    format: "order_steps",
    prompt: "Put the steps for taking a phone booking in order.",
    steps: [
      { id: "a", text: "Answer with the venue name" },
      { id: "b", text: "Take the date, time, number of guests and their name and number" },
      { id: "c", text: "Read the details back to confirm them" },
      { id: "d", text: "Thank them and end the call" },
    ],
    explanation: "A standard greeting confirms they've called the right place. Reading back the date, time and number of guests prevents double bookings.",
    reviewed: true,
  },
  {
    id: "q6",
    concept: "s4",
    difficulty: 2,
    format: "best_line",
    prompt: "A caller wants \"the corner booth\" for Saturday night. What's the best thing to say?",
    options: [
      { id: "a", text: "\"Done, it's yours.\"" },
      { id: "b", text: "\"I've noted you'd love the booth. I can guarantee the booking, but not the exact table on a busy Saturday.\"" },
      { id: "c", text: "\"We don't do requests.\"" },
      { id: "d", text: "\"Call back on Saturday.\"" },
    ],
    answer: "b",
    explanation: "Table tetris changes constantly. Note their preference, but guarantee the booking, not the specific physical table.",
    reviewed: true,
  },
  {
    id: "q7",
    concept: "s5",
    difficulty: 1,
    format: "multiple_choice",
    prompt: "It's very busy and the phone rings with a long question. What do you do?",
    options: [
      { id: "a", text: "Put them on hold until the rush is over" },
      { id: "b", text: "Take their name and number and promise to call back" },
      { id: "c", text: "Answer and hang up" },
      { id: "d", text: "Let it ring out" },
    ],
    answer: "b",
    explanation: "If you're very busy, take their name and number and promise to call them back when the rush dies down.",
    reviewed: true,
  },
  {
    id: "q8",
    concept: "s3",
    difficulty: 1,
    format: "multiple_choice",
    prompt: "Why read the booking details back to the caller?",
    options: [
      { id: "a", text: "To avoid double bookings and people turning up on the wrong night" },
      { id: "b", text: "To fill time" },
      { id: "c", text: "It's a legal requirement" },
      { id: "d", text: "So they can change their mind" },
    ],
    answer: "a",
    explanation: "Confirming the date, time, and pax prevents disastrous double-bookings or guests showing up on the wrong night.",
    reviewed: true,
  },
  {
    id: "q9",
    concept: "s6",
    difficulty: 2,
    format: "spot_mistake",
    prompt: "Which of these phone habits is wrong?",
    options: [
      { id: "a", text: "Answering promptly" },
      { id: "b", text: "Stating the venue name" },
      { id: "c", text: "Leaving callers on hold for five minutes in a rush" },
      { id: "d", text: "Reading the booking back" },
    ],
    answer: "c",
    explanation: "If you're very busy, take their name and number and promise to call them back when the rush dies down.",
    reviewed: true,
  },
];
