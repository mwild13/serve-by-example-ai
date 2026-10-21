import type { NextStep } from "@/lib/next-step";

// What each next step says, on the staff desktop's Today (the green card) and
// on mobile Home (the stack card), so both surfaces offer the same thing in
// the same words. The step itself comes from pickNextSteps() in
// lib/next-step.ts.

export type StepCopy = { kicker: string; title: string; body: string; cta: string; alt: string };

export function copyFor(step: NextStep, reviewDue: number): StepCopy {
  switch (step.kind) {
    case "challenge":
      return {
        kicker: "Start here",
        title: "Try a challenge",
        body: "Five quick games on the basics of the floor. Modules, drills and Live Guest come with a plan.",
        cta: "Play a challenge",
        alt: "Or play a challenge",
      };
    case "first-module":
      return {
        kicker: "Your first step",
        title: step.module.title,
        body: `${step.module.recommendation_reason ?? "The place to start"}. Read a few short cards, then answer questions on them.`,
        cta: "Start this module",
        alt: `Or start ${step.module.title}`,
      };
    case "preshift":
      return {
        kicker: "Before your shift",
        title: "Pre-shift drill",
        body: "Six quick questions from what you've learnt, about three minutes. Finish it and your shift streak grows.",
        cta: "Start the drill",
        alt: "Or do the pre-shift drill",
      };
    case "continue-module":
      return {
        kicker: "Pick up where you left off",
        title: step.module.title,
        body: "You've started this one. Pass its quiz and it's mastered.",
        cta: "Continue",
        alt: `Or continue ${step.module.title}`,
      };
    case "review":
      return {
        kicker: "Due for a look",
        title: "Keep it fresh",
        body: `${reviewDue === 1 ? "One thing you've mastered is" : `${reviewDue} things you've mastered are`} due for review. A mixed drill brings them back before they fade.`,
        cta: "Start a mixed drill",
        alt: "Or a mixed drill",
      };
    case "next-module":
      return {
        kicker: "Next on your path",
        title: step.module.title,
        body: `${step.module.recommendation_reason ?? "Next up"}. Read a few short cards, then answer questions on them.`,
        cta: "Start this module",
        alt: `Or start ${step.module.title}`,
      };
    case "live-guest":
      return {
        kicker: "Put it into practice",
        title: "Talk to a guest",
        body: "A guest who talks back, over three or four replies. Then see what they were thinking at each turn.",
        cta: "Open Live Guest",
        alt: "Or talk to a guest",
      };
    case "drill":
      return {
        kicker: "Keep it sharp",
        title: "Mixed drill",
        body: "Ten questions from every module you've started, never two in a row from the same one.",
        cta: "Start a mixed drill",
        alt: "Or a mixed drill",
      };
  }
}
