// Module 15, RSA Compliance: the Learn cards shown before the quiz,
// written from the module's True/False statements (lib/verify-questions.ts).
// `concepts` names the statements each card teaches.
//
// Draft for the owner's review (cards batch 5). Review copy:
// docs/Rich Update/cards-batch-5-compliance-a.md.
import type { LearnCard } from "@/lib/learn-cards";

export const MODULE_15_CARDS: LearnCard[] = [
  {
    id: "c1",
    concepts: ["s0", "s4", "s5"],
    title: "Refuse when intoxicated",
    rule: "You must refuse service to anyone unduly intoxicated. Ordering food doesn't change that, and there's no \"one last drink\".",
    why: "Serving them risks heavy fines, your RSA and the venue's licence. Service stops the moment the signs show.",
    reviewed: false,
  },
  {
    id: "c2",
    concepts: ["s1"],
    title: "Know the signs",
    rule: "Slurred speech and loss of coordination are clear signs of intoxication.",
    why: "Spotting the signs early means you can stop service before it becomes a problem.",
    reviewed: false,
  },
  {
    id: "c3",
    concepts: ["s2", "s7"],
    title: "Minors and ID",
    rule: "Never serve alcohol to a minor, even if a parent orders it. Accept only government-issued photo ID.",
    why: "Rules vary by state, but venue policy is to refuse. A licence, passport or proof-of-age card counts; a student card doesn't.",
    reviewed: false,
  },
  {
    id: "c4",
    concepts: ["s3"],
    title: "Free water, always",
    rule: "Free drinking water must always be available to guests.",
    why: "It's an RSA requirement in licensed Australian venues.",
    reviewed: false,
  },
  {
    id: "c5",
    concepts: ["s6"],
    title: "Point to the law",
    rule: "When you refuse service, explain that the law requires it. It isn't your personal choice.",
    why: "\"I could lose my job and face a big fine\" takes the refusal off you personally, which calms things down.",
    reviewed: false,
  },
];
