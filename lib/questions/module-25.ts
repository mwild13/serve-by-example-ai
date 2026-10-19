// Module 25, Allergy Shield: questions in the new formats, written from the
// module's True/False statements (lib/verify-questions.ts). Each `concept`
// names the statement it comes from.
//
// Drafts until the owner approves them: `reviewed: false` keeps them out of
// every run. Review copy: docs/Rich Update/batch-6-compliance-b.md.
import "server-only";
import type { Question } from "@/lib/question-bank";

export const MODULE_25_QUESTIONS: Question[] = [
  {
    id: "q1",
    concept: "s0",
    difficulty: 1,
    format: "multiple_choice",
    prompt: "A guest tells you they have a nut allergy. When does the kitchen hear about it?",
    options: [
      { id: "a", text: "Straight away, by telling the chef directly" },
      { id: "b", text: "When the docket prints" },
      { id: "c", text: "When the food is ready" },
      { id: "d", text: "Only if it's severe" },
    ],
    answer: "a",
    explanation: "Written tickets can be missed in a rush. A direct verbal call to the chef closes the gap and creates a verbal confirmation loop.",
    reviewed: false,
  },
  {
    id: "q2",
    concept: "s1",
    difficulty: 2,
    format: "multiple_choice",
    prompt: "The menu says \"contains nuts\". Is that enough?",
    options: [
      { id: "a", text: "Yes, the guest has been warned" },
      { id: "b", text: "No: confirm the allergy and alert the kitchen before the order goes in" },
      { id: "c", text: "Yes, unless they ask" },
      { id: "d", text: "Only for children" },
    ],
    answer: "b",
    explanation: "Menu warnings are the starting point, not the endpoint. Staff must proactively confirm the allergy and alert the kitchen before placing the order.",
    reviewed: false,
  },
  {
    id: "q3",
    concept: "s2",
    difficulty: 2,
    format: "multiple_choice",
    prompt: "Why can a trace of nuts on shared equipment be dangerous?",
    options: [
      { id: "a", text: "It can trigger anaphylaxis in a severely allergic guest" },
      { id: "b", text: "It changes the taste" },
      { id: "c", text: "It's only a labelling issue" },
      { id: "d", text: "It isn't: it's too small to matter" },
    ],
    answer: "a",
    explanation: "Cross-contamination on a shared cutting board or pan is enough to cause a life-threatening reaction in a sensitised guest.",
    reviewed: false,
  },
  {
    id: "q4",
    concept: "s3",
    difficulty: 1,
    format: "best_line",
    prompt: "A guest with an allergy offers to go and tell the kitchen themselves, because you're busy. What's the best thing to say?",
    options: [
      { id: "a", text: "\"Great, the kitchen's through there.\"" },
      { id: "b", text: "\"Thanks, but I'll tell the chef myself right now, so nothing gets missed.\"" },
      { id: "c", text: "\"They probably won't listen.\"" },
      { id: "d", text: "\"It's on the docket anyway.\"" },
    ],
    answer: "b",
    explanation: "The serving staff are the communication bridge between guest and kitchen. This responsibility cannot be delegated to the guest.",
    reviewed: false,
  },
  {
    id: "q5",
    concept: "s4",
    difficulty: 1,
    format: "multiple_choice",
    prompt: "Where must the allergy information go?",
    options: [
      { id: "a", text: "Clearly on the POS ticket, as well as telling the chef" },
      { id: "b", text: "On a sticky note" },
      { id: "c", text: "Only in your head" },
      { id: "d", text: "On the guest's bill" },
    ],
    answer: "a",
    explanation: "The ticket is the kitchen's primary instruction document. Allergy data missing from the docket is allergy data at risk.",
    reviewed: false,
  },
  {
    id: "q6",
    concept: "s5",
    difficulty: 1,
    format: "spot_mistake",
    prompt: "Which of these allergy habits is wrong?",
    options: [
      { id: "a", text: "Asking every table about allergies" },
      { id: "b", text: "Asking about allergies only for big groups" },
      { id: "c", text: "Telling the chef directly" },
      { id: "d", text: "Marking the docket clearly" },
    ],
    answer: "b",
    explanation: "Every single order taken must prompt an allergy check from the server, regardless of group size.",
    reviewed: false,
  },
  {
    id: "q7",
    concept: "s7",
    difficulty: 2,
    format: "multiple_choice",
    prompt: "A guest says they're \"just a little intolerant\" to gluten. What do you do?",
    options: [
      { id: "a", text: "Nothing, it's not a real allergy" },
      { id: "b", text: "Follow the full allergy protocol" },
      { id: "c", text: "Ask them to choose another dish" },
      { id: "d", text: "Mention it to the chef if you remember" },
    ],
    answer: "b",
    explanation: "The level of sensitivity varies enormously between guests. Any declared intolerance must be treated with full allergy protocol.",
    reviewed: false,
  },
  {
    id: "q8",
    concept: "s6",
    difficulty: 3,
    format: "order_steps",
    prompt: "A guest has a nut allergy. Put the steps in order.",
    steps: [
      { id: "a", text: "Confirm the allergy with the guest" },
      { id: "b", text: "Tell the chef directly and mark the docket" },
      { id: "c", text: "Double-check with the chef before the dish leaves the pass" },
      { id: "d", text: "Serve the dish and confirm it's the allergy-safe one" },
    ],
    explanation: "Confirm the allergy, tell the chef and mark the docket, then double-check with the kitchen before the plate touches the table.",
    reviewed: false,
  },
];
