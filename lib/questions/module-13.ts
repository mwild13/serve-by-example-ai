// Module 13, VIP Management: questions in the new formats, written from the
// module's True/False statements (lib/verify-questions.ts). Each `concept`
// names the statement it comes from.
//
// Approved by the owner on 2026-10-19 (batch 3). Review copy:
// docs/Rich Update/batch-3-service-a.md.
import "server-only";
import type { Question } from "@/lib/question-bank";

export const MODULE_13_QUESTIONS: Question[] = [
  {
    id: "q1",
    concept: "s0",
    difficulty: 1,
    format: "multiple_choice",
    prompt: "A VIP wants to keep drinking after the licensed trading hours. What do you do?",
    options: [
      { id: "a", text: "Let them, they spend a lot" },
      { id: "b", text: "Close as normal: licensing laws apply to everyone" },
      { id: "c", text: "Keep serving if the doors are locked" },
      { id: "d", text: "Ask the manager to make an exception" },
    ],
    answer: "b",
    explanation: "Liquor licensing laws apply equally to everyone. No VIP is worth risking a fine or the venue's licence.",
    reviewed: true,
  },
  {
    id: "q2",
    concept: "s1",
    difficulty: 2,
    format: "multiple_choice",
    prompt: "A booked table hasn't arrived on time. What's the usual approach?",
    options: [
      { id: "a", text: "Give the table away straight away" },
      { id: "b", text: "Hold it for a grace period set by the venue, then offer it to walk-ins" },
      { id: "c", text: "Hold it all night" },
      { id: "d", text: "Call them and cancel" },
    ],
    answer: "b",
    explanation: "A grace period, often 15 minutes, allows for traffic or parking delays before you give the table to walk-ins. Check your venue's policy.",
    reviewed: true,
  },
  {
    id: "q3",
    concept: "s2",
    difficulty: 1,
    format: "best_line",
    prompt: "A VIP walks in without a booking and the venue is full. What's the best thing to say?",
    options: [
      { id: "a", text: "\"I'll move that table for you.\"" },
      { id: "b", text: "\"Let me get you a drink at the bar while I find you a table.\"" },
      { id: "c", text: "\"We're full, sorry.\"" },
      { id: "d", text: "\"Come back another night.\"" },
    ],
    answer: "b",
    explanation: "Evicting seated guests causes a massive scene and terrible reviews. Offer the VIP a drink at the bar instead.",
    reviewed: true,
  },
  {
    id: "q4",
    concept: "s3",
    difficulty: 1,
    format: "multiple_choice",
    prompt: "What's the easiest way to make a VIP feel valued?",
    options: [
      { id: "a", text: "Remember and use their name" },
      { id: "b", text: "Give them a free bottle every visit" },
      { id: "c", text: "Seat them before everyone else" },
      { id: "d", text: "Ignore the other guests" },
    ],
    answer: "a",
    explanation: "Personal recognition is the currency of VIP service. It makes high-spenders feel deeply valued.",
    reviewed: true,
  },
  {
    id: "q5",
    concept: "s4",
    difficulty: 2,
    format: "multiple_choice",
    prompt: "Why not seat 20 people in one section at once?",
    options: [
      { id: "a", text: "It overwhelms the kitchen's docket flow and the bar" },
      { id: "b", text: "It looks too busy" },
      { id: "c", text: "Guests prefer empty sections" },
      { id: "d", text: "It's against licensing" },
    ],
    answer: "a",
    explanation: "Seating 20 people at once in one section destroys the kitchen docket flow and overwhelms the bartender.",
    reviewed: true,
  },
  {
    id: "q6",
    concept: "s5",
    difficulty: 1,
    format: "spot_mistake",
    prompt: "Which of these VIP habits is wrong?",
    options: [
      { id: "a", text: "Remembering the VIP's name" },
      { id: "b", text: "Offering water while they wait for a table" },
      { id: "c", text: "Ignoring walk-ins while VIPs are in" },
      { id: "d", text: "Turning people away politely when you're full" },
    ],
    answer: "c",
    explanation: "Every guest must receive baseline hospitality. Ignoring standard diners builds a toxic, elitist venue reputation.",
    reviewed: true,
  },
  {
    id: "q7",
    concept: "s6",
    difficulty: 1,
    format: "multiple_choice",
    prompt: "Guests are waiting for their table. What do you offer them?",
    options: [
      { id: "a", text: "Complimentary water" },
      { id: "b", text: "A discount" },
      { id: "c", text: "Nothing until they sit" },
      { id: "d", text: "The bill from their last visit" },
    ],
    answer: "a",
    explanation: "It pacifies the guest, gives them something to do, and proves your service starts before they even sit down.",
    reviewed: true,
  },
  {
    id: "q8",
    concept: "s7",
    difficulty: 1,
    format: "best_line",
    prompt: "You're fully booked and a couple asks for a table. What's the best thing to say?",
    options: [
      { id: "a", text: "\"No.\"" },
      { id: "b", text: "\"We're full tonight, sorry. We have tables tomorrow, or the place two doors down is great.\"" },
      { id: "c", text: "\"Try again in an hour.\"" },
      { id: "d", text: "Shake your head and walk off" },
    ],
    answer: "b",
    explanation: "Turning people away with a smile and an alternative suggestion protects the brand for their next visit.",
    reviewed: true,
  },
];
