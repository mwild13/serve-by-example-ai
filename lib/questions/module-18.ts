// Module 18, Evacuation Protocols: questions in the new formats, written from the
// module's True/False statements (lib/verify-questions.ts). Each `concept`
// names the statement it comes from.
//
// Drafts until the owner approves them: `reviewed: false` keeps them out of
// every run. Review copy: docs/Rich Update/batch-5-compliance-a.md.
import "server-only";
import type { Question } from "@/lib/question-bank";

export const MODULE_18_QUESTIONS: Question[] = [
  {
    id: "q1",
    concept: "s0",
    difficulty: 1,
    format: "multiple_choice",
    prompt: "Where is the emergency assembly point usually?",
    options: [
      { id: "a", text: "Inside the venue, near the bar" },
      { id: "b", text: "A safe distance from the building, such as a car park or nearby street" },
      { id: "c", text: "In the foyer" },
      { id: "d", text: "Wherever staff decide on the day" },
    ],
    answer: "b",
    explanation: "Assembly points must be a safe distance away from the building structure, usually in a carpark or adjacent street.",
    reviewed: false,
  },
  {
    id: "q2",
    concept: "s1",
    difficulty: 1,
    format: "best_line",
    prompt: "The fire alarm goes off and a guest picks up their drink to leave. What's the best thing to say?",
    options: [
      { id: "a", text: "\"Bring it with you.\"" },
      { id: "b", text: "\"Please leave your drink and keep a hand on the rail. This way to the exit.\"" },
      { id: "c", text: "\"Finish it first.\"" },
      { id: "d", text: "Nothing, just point at the door" },
    ],
    answer: "b",
    explanation: "Drinks spill, causing slip hazards in stairwells, and holding glasses prevents people from using handrails safely.",
    reviewed: false,
  },
  {
    id: "q3",
    concept: "s2",
    difficulty: 1,
    format: "multiple_choice",
    prompt: "How do people leave a burning building?",
    options: [
      { id: "a", text: "By the fire stairs" },
      { id: "b", text: "By the lift" },
      { id: "c", text: "Whichever way is fastest" },
      { id: "d", text: "By the lift if the stairs are busy" },
    ],
    answer: "a",
    explanation: "Elevators can lose power or open directly onto a fire floor. Always use the emergency fire stairs.",
    reviewed: false,
  },
  {
    id: "q4",
    concept: "s3",
    difficulty: 2,
    format: "multiple_choice",
    prompt: "Who's in charge during an evacuation?",
    options: [
      { id: "a", text: "The general manager" },
      { id: "b", text: "The fire warden" },
      { id: "c", text: "The most senior bartender" },
      { id: "d", text: "Whoever pulls the alarm" },
    ],
    answer: "b",
    explanation: "The designated fire warden outranks the general manager during an emergency. All staff must follow their sweeping commands.",
    reviewed: false,
  },
  {
    id: "q5",
    concept: "s5",
    difficulty: 1,
    format: "multiple_choice",
    prompt: "The alarm sounds while you're in the staff room. What about your bag and jacket?",
    options: [
      { id: "a", text: "Grab them quickly" },
      { id: "b", text: "Leave them and evacuate straight away" },
      { id: "c", text: "Grab them if they're close" },
      { id: "d", text: "Ask the warden" },
    ],
    answer: "b",
    explanation: "Bags and jackets are replaceable; human life is not. Evacuate the second the primary alarm sounds.",
    reviewed: false,
  },
  {
    id: "q6",
    concept: "s6",
    difficulty: 1,
    format: "spot_mistake",
    prompt: "Which of these breaks the fire safety rules?",
    options: [
      { id: "a", text: "Stock boxes stacked in front of a fire exit" },
      { id: "b", text: "Exit signs lit" },
      { id: "c", text: "A clear path to the fire stairs" },
      { id: "d", text: "Staff who know where the assembly point is" },
    ],
    answer: "a",
    explanation: "A blocked fire exit is a severe WHS violation and can cause a lethal crush situation in a panicked evacuation.",
    reviewed: false,
  },
  {
    id: "q7",
    concept: "s7",
    difficulty: 2,
    format: "multiple_choice",
    prompt: "How should staff move during an evacuation?",
    options: [
      { id: "a", text: "Run, to get everyone out fastest" },
      { id: "b", text: "Walk swiftly and calmly, telling guests to do the same" },
      { id: "c", text: "Wait for every guest to leave first" },
      { id: "d", text: "Stay at the bar until told" },
    ],
    answer: "b",
    explanation: "Staff must project calm authority. Walk swiftly and purposefully, and loudly instruct guests to do the same.",
    reviewed: false,
  },
  {
    id: "q8",
    concept: "s0",
    difficulty: 3,
    format: "order_steps",
    prompt: "The fire alarm sounds. Put these in order.",
    steps: [
      { id: "a", text: "Stop what you're doing and follow the fire warden" },
      { id: "b", text: "Direct guests to the nearest exit, leaving drinks and bags" },
      { id: "c", text: "Walk out by the fire stairs, not the lift" },
      { id: "d", text: "Gather at the assembly point" },
    ],
    explanation: "The fire warden is in charge. Guests leave drinks and bags behind, everyone walks out by the stairs, and you gather at the assembly point away from the building.",
    reviewed: false,
  },
];
