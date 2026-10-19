// Module 22, Ice Well Burn: questions in the new formats, written from the
// module's True/False statements (lib/verify-questions.ts). Each `concept`
// names the statement it comes from.
//
// Approved by the owner on 2026-10-19 (batch 6). Review copy:
// docs/Rich Update/batch-6-compliance-b.md.
import "server-only";
import type { Question } from "@/lib/question-bank";

export const MODULE_22_QUESTIONS: Question[] = [
  {
    id: "q1",
    concept: "s0",
    difficulty: 1,
    format: "multiple_choice",
    prompt: "A glass breaks in the ice well. When do you burn it?",
    options: [
      { id: "a", text: "Immediately" },
      { id: "b", text: "At close" },
      { id: "c", text: "Once the rush is over" },
      { id: "d", text: "Only if you can see shards" },
    ],
    answer: "a",
    explanation: "Glass shards in ice are invisible to the eye. The only safe WHS protocol is pouring hot water to melt every last cube.",
    reviewed: true,
  },
  {
    id: "q2",
    concept: "s1",
    difficulty: 2,
    format: "multiple_choice",
    prompt: "You've picked out the glass you can see. Can you keep using the ice?",
    options: [
      { id: "a", text: "Yes, if no more pieces are visible" },
      { id: "b", text: "No: invisible shards stay in the ice, so the whole well is burnt" },
      { id: "c", text: "Yes, from the other end of the well" },
      { id: "d", text: "Yes, for soft drinks only" },
    ],
    answer: "b",
    explanation: "Invisible micro-shards remain embedded in the ice. Partial clearing is not safe — the entire well must be burned.",
    reviewed: true,
  },
  {
    id: "q3",
    concept: "s2",
    difficulty: 1,
    format: "multiple_choice",
    prompt: "What do you use to burn an ice well?",
    options: [
      { id: "a", text: "Hot water" },
      { id: "b", text: "Cold water" },
      { id: "c", text: "A scoop and a bin" },
      { id: "d", text: "Salt" },
    ],
    answer: "a",
    explanation: "Hot water is the fastest and most thorough method to melt all ice and flush potential shards down the drain safely.",
    reviewed: true,
  },
  {
    id: "q4",
    concept: "s4",
    difficulty: 2,
    format: "multiple_choice",
    prompt: "What's the most common cause of glass in the ice well?",
    options: [
      { id: "a", text: "Using a glass to scoop ice" },
      { id: "b", text: "Glasses falling off the shelf" },
      { id: "c", text: "Guests leaning over the bar" },
      { id: "d", text: "The glasswasher" },
    ],
    answer: "a",
    explanation: "This is exactly why the scoop rule exists. Glass on glass creates chips that vanish into the ice instantly.",
    reviewed: true,
  },
  {
    id: "q5",
    concept: "s5",
    difficulty: 2,
    format: "spot_mistake",
    prompt: "A new starter talks you through a burn. Which part is wrong?",
    options: [
      { id: "a", text: "I stop serving from the well straight away" },
      { id: "b", text: "I melt it all with hot water" },
      { id: "c", text: "I expect it to take under two minutes" },
      { id: "d", text: "I check it's clear before refilling" },
    ],
    answer: "c",
    explanation: "Melting a full ice well, draining it and confirming it's clear is a genuine service shutdown. It takes far longer than two minutes.",
    reviewed: true,
  },
  {
    id: "q6",
    concept: "s6",
    difficulty: 1,
    format: "multiple_choice",
    prompt: "Where does the ice scoop go after each use?",
    options: [
      { id: "a", text: "Back in a clean holder" },
      { id: "b", text: "Left in the ice" },
      { id: "c", text: "On the bar top" },
      { id: "d", text: "In the sink" },
    ],
    answer: "a",
    explanation: "Leaving the scoop in the ice or on the bar top risks contaminating it with bacteria or foreign objects between uses.",
    reviewed: true,
  },
  {
    id: "q7",
    concept: "s7",
    difficulty: 1,
    format: "multiple_choice",
    prompt: "It's a busy Friday and the ice well is contaminated. What now?",
    options: [
      { id: "a", text: "Burn it now, however busy the bar is" },
      { id: "b", text: "Wait until close" },
      { id: "c", text: "Serve from it carefully" },
      { id: "d", text: "Use it for the kitchen only" },
    ],
    answer: "a",
    explanation: "Contaminated ice must never serve another customer. Burning the well is immediate regardless of how busy the bar is.",
    reviewed: true,
  },
  {
    id: "q8",
    concept: "s0",
    difficulty: 3,
    format: "order_steps",
    prompt: "A glass breaks in the ice well. Put the Burn Protocol in order.",
    steps: [
      { id: "a", text: "Stop serving from the well" },
      { id: "b", text: "Pour hot water in to melt every cube" },
      { id: "c", text: "Drain the well and check it's clear" },
      { id: "d", text: "Refill with fresh ice" },
    ],
    explanation: "Glass shards in ice are invisible. Stop using the well at once, melt every cube with hot water, check it's clear, and only then refill it.",
    reviewed: true,
  },
];
