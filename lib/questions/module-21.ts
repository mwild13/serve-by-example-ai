// Module 21, Call Behind: questions in the new formats, written from the
// module's True/False statements (lib/verify-questions.ts). Each `concept`
// names the statement it comes from.
//
// Drafts until the owner approves them: `reviewed: false` keeps them out of
// every run. Review copy: docs/Rich Update/batch-6-compliance-b.md.
import "server-only";
import type { Question } from "@/lib/question-bank";

export const MODULE_21_QUESTIONS: Question[] = [
  {
    id: "q1",
    concept: "s0",
    difficulty: 1,
    format: "best_line",
    prompt: "You need to get past a bartender in a narrow bar. What do you say?",
    options: [
      { id: "a", text: "Nothing: just squeeze through" },
      { id: "b", text: "\"Behind!\"" },
      { id: "c", text: "\"Excuse me\" quietly" },
      { id: "d", text: "Tap them on the back" },
    ],
    answer: "b",
    explanation: "This is the most important vocal command in the industry. A single unannounced pass can cause a tray drop or serious burn injury.",
    reviewed: false,
  },
  {
    id: "q2",
    concept: "s1",
    difficulty: 1,
    format: "multiple_choice",
    prompt: "When do you need to call \"Behind!\"?",
    options: [
      { id: "a", text: "Only with a full tray" },
      { id: "b", text: "Any time you pass through an occupied space, even empty-handed" },
      { id: "c", text: "Only when carrying hot plates" },
      { id: "d", text: "Only in a rush" },
    ],
    answer: "b",
    explanation: "The call is required any time you move through an occupied space — even empty-handed. Collisions can happen without a tray.",
    reviewed: false,
  },
  {
    id: "q3",
    concept: "s2",
    difficulty: 1,
    format: "best_line",
    prompt: "You're about to step around a blind corner into the kitchen. What do you call?",
    options: [
      { id: "a", text: "\"Behind!\"" },
      { id: "b", text: "\"Corner!\"" },
      { id: "c", text: "Nothing" },
      { id: "d", text: "\"Hot!\"" },
    ],
    answer: "b",
    explanation: "Blind corners are collision black spots in busy venues. \"Corner!\" gives oncoming traffic a split second to stop.",
    reviewed: false,
  },
  {
    id: "q4",
    concept: "s4",
    difficulty: 2,
    format: "multiple_choice",
    prompt: "How should you move through a packed venue?",
    options: [
      { id: "a", text: "Sideways, elbows tucked in" },
      { id: "b", text: "Arms out, to make space" },
      { id: "c", text: "Fast, head down" },
      { id: "d", text: "Behind a colleague" },
    ],
    answer: "a",
    explanation: "Turning sideways and tucking elbows in — the \"compressed walk\" — minimises your physical footprint in a packed venue.",
    reviewed: false,
  },
  {
    id: "q5",
    concept: "s5",
    difficulty: 1,
    format: "spot_mistake",
    prompt: "Which of these is wrong in a busy service?",
    options: [
      { id: "a", text: "Calling \"Behind!\" as you pass" },
      { id: "b", text: "Running between the bar and kitchen" },
      { id: "c", text: "Calling \"Corner!\" at a blind corner" },
      { id: "d", text: "Calling \"Coming through!\" in the dining room" },
    ],
    answer: "b",
    explanation: "Running causes collisions and spills. Walk fast with purpose and call ahead — \"Coming through!\" — to clear your path.",
    reviewed: false,
  },
  {
    id: "q6",
    concept: "s6",
    difficulty: 1,
    format: "best_line",
    prompt: "You're carrying plates through a crowded dining room. What's the best thing to say?",
    options: [
      { id: "a", text: "\"Move!\"" },
      { id: "b", text: "\"Coming through!\"" },
      { id: "c", text: "Nothing: guests will see you" },
      { id: "d", text: "\"Watch out, hot!\" to everyone" },
    ],
    answer: "b",
    explanation: "This verbal signal tells both guests and staff to clear a path and is standard professional floor navigation.",
    reviewed: false,
  },
  {
    id: "q7",
    concept: "s7",
    difficulty: 2,
    format: "multiple_choice",
    prompt: "Who uses vocal safety calls?",
    options: [
      { id: "a", text: "Only new staff" },
      { id: "b", text: "Everyone, however experienced" },
      { id: "c", text: "Only kitchen staff" },
      { id: "d", text: "Only on busy nights" },
    ],
    answer: "b",
    explanation: "Every seasoned professional uses these calls because collisions do not discriminate by experience. The habit is what keeps everyone safe.",
    reviewed: false,
  },
  {
    id: "q8",
    concept: "s3",
    difficulty: 2,
    format: "multiple_choice",
    prompt: "Why is pushing past a colleague without warning dangerous?",
    options: [
      { id: "a", text: "It causes tray drops, spills and injuries" },
      { id: "b", text: "It's only rude, not dangerous" },
      { id: "c", text: "It slows you down" },
      { id: "d", text: "It's fine in a rush" },
    ],
    answer: "a",
    explanation: "Physical contact without warning during a rush causes tray drops, spills, and injuries. The busier the venue, the more critical the call.",
    reviewed: false,
  },
];
