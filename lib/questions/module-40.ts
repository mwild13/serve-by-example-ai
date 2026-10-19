// Module 40, Natural Upselling: questions in the new formats, written from the
// module's True/False statements (lib/verify-questions.ts). Each `concept`
// names the statement it comes from.
//
// Drafts until the owner approves them: `reviewed: false` keeps them out of
// every run. Review copy: docs/Rich Update/batch-4-service-b.md.
import "server-only";
import type { Question } from "@/lib/question-bank";

export const MODULE_40_QUESTIONS: Question[] = [
  {
    id: "q1",
    concept: "s0",
    difficulty: 1,
    format: "best_line",
    prompt: "A guest orders a gin and tonic. What's the best upsell?",
    options: [
      { id: "a", text: "\"Do you want premium?\"" },
      { id: "b", text: "\"Would you like that with Hendrick's?\"" },
      { id: "c", text: "\"Any upgrades?\"" },
      { id: "d", text: "Pour the premium gin without asking" },
    ],
    answer: "b",
    explanation: "\"Would you like that with Hendrick's?\" is more effective than \"Do you want premium?\" because it paints a specific, inviting picture.",
    reviewed: false,
  },
  {
    id: "q2",
    concept: "s1",
    difficulty: 2,
    format: "multiple_choice",
    prompt: "What is natural upselling about?",
    options: [
      { id: "a", text: "Making the guest's experience better" },
      { id: "b", text: "Getting the biggest bill possible" },
      { id: "c", text: "Saying the most expensive item first" },
      { id: "d", text: "Hitting a sales target" },
    ],
    answer: "a",
    explanation: "Natural upselling enhances the guest's experience. The moment it feels pushy, it destroys trust, tips, and any chance of return visits.",
    reviewed: false,
  },
  {
    id: "q3",
    concept: "s2",
    difficulty: 1,
    format: "best_line",
    prompt: "A guest orders the chicken. What's the best way to suggest a side?",
    options: [
      { id: "a", text: "\"Do you want any sides?\"" },
      { id: "b", text: "\"The sweet potato fries are amazing with the chicken.\"" },
      { id: "c", text: "\"Sides are extra.\"" },
      { id: "d", text: "Add fries to the order without asking" },
    ],
    answer: "b",
    explanation: "\"The sweet potato fries are amazing with the chicken\" removes decision fatigue and paints a picture. \"Any sides?\" invites a flat no.",
    reviewed: false,
  },
  {
    id: "q4",
    concept: "s3",
    difficulty: 1,
    format: "spot_mistake",
    prompt: "Which of these beer upsells is weakest?",
    options: [
      { id: "a", text: "\"Would you like a pint of that?\"" },
      { id: "b", text: "\"Would you like a large?\"" },
      { id: "c", text: "\"The pale ale is great with the fish, want to try it?\"" },
      { id: "d", text: "\"Make that a pint of the lager?\"" },
    ],
    answer: "b",
    explanation: "\"A large\" is generic and transactional. \"Would you like a pint of that?\" names the product and sounds like a genuine suggestion.",
    reviewed: false,
  },
  {
    id: "q5",
    concept: "s4",
    difficulty: 2,
    format: "multiple_choice",
    prompt: "What turns an upsell from a pitch into an expert recommendation?",
    options: [
      { id: "a", text: "Knowing your wine pairings and products" },
      { id: "b", text: "Talking quickly" },
      { id: "c", text: "Offering a discount" },
      { id: "d", text: "Mentioning the price" },
    ],
    answer: "a",
    explanation: "Product knowledge is the foundation. A confident pairing suggestion makes the guest feel cared for rather than sold to.",
    reviewed: false,
  },
  {
    id: "q6",
    concept: "s5",
    difficulty: 1,
    format: "multiple_choice",
    prompt: "When is the best moment to suggest dessert?",
    options: [
      { id: "a", text: "As the main plates are cleared" },
      { id: "b", text: "After they ask for the bill" },
      { id: "c", text: "Before mains arrive" },
      { id: "d", text: "Only if they ask" },
    ],
    answer: "a",
    explanation: "Offering the dessert menu as plates are cleared captures the impulse decision before the guest mentally checks out and says they are too full.",
    reviewed: false,
  },
  {
    id: "q7",
    concept: "s6",
    difficulty: 2,
    format: "multiple_choice",
    prompt: "What makes a premium spirit suggestion feel like a recommendation?",
    options: [
      { id: "a", text: "Genuine enthusiasm" },
      { id: "b", text: "Reading the price aloud" },
      { id: "c", text: "Saying it's the manager's choice" },
      { id: "d", text: "Suggesting it to every guest the same way" },
    ],
    answer: "a",
    explanation: "Tone and intent determine whether a suggestion feels like care or a sales grab. Real enthusiasm is the difference.",
    reviewed: false,
  },
  {
    id: "q8",
    concept: "s7",
    difficulty: 2,
    format: "multiple_choice",
    prompt: "Which guests respond to a simple, confident suggestion?",
    options: [
      { id: "a", text: "Only big spenders" },
      { id: "b", text: "Casual pub guests too: every cover is an opportunity" },
      { id: "c", text: "Only regulars" },
      { id: "d", text: "Only tourists" },
    ],
    answer: "b",
    explanation: "Casual pub guests are often the most receptive to a simple, confident suggestion from a staff member they trust. Every cover is an opportunity.",
    reviewed: false,
  },
];
