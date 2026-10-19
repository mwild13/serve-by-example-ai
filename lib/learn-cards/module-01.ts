// Module 1, Beer Pouring: the Learn cards shown before the quiz,
// written from the module's True/False statements (lib/verify-questions.ts).
// `concepts` names the statements each card teaches.
//
// Approved by the owner on 2026-10-19 (cards batch 1). Review copy:
// docs/Rich Update/cards-batch-1-bartending-a.md.
import type { LearnCard } from "@/lib/learn-cards";

export const MODULE_1_CARDS: LearnCard[] = [
  {
    id: "c1",
    concepts: ["s0"],
    title: "Start with a cold glass",
    rule: "Never pour beer into a glass that's still warm from the glass washer.",
    why: "Heat knocks the gas out of the beer. You get a flat pour with too much foam, and the beer is wasted.",
    reviewed: true,
  },
  {
    id: "c2",
    concepts: ["s6", "s3"],
    title: "Tilt, then open the tap fully",
    rule: "Hold the glass at 45 degrees and open the tap fully in one sharp movement. Bring the glass upright as it fills.",
    why: "The beer runs down the side instead of crashing to the bottom, which keeps the head under control. A half-open tap makes more foam, not less.",
    reviewed: true,
  },
  {
    id: "c3",
    concepts: ["s1"],
    title: "The tap never touches the beer",
    rule: "Keep the nozzle clear of the glass and the beer for the whole pour.",
    why: "A nozzle dipped in beer picks up bacteria and passes it on to every glass after. It also breaks health rules.",
    reviewed: true,
  },
  {
    id: "c4",
    concepts: ["s2", "s4"],
    title: "A schooner and its head",
    rule: "In most states a schooner holds 425ml. Finish it with a head of 1 to 1.5 cm. South Australia names its glasses differently.",
    why: "The head holds in the gas and the aroma. Much more than that and the guest is short-changed on beer.",
    reviewed: true,
  },
  {
    id: "c5",
    concepts: ["s7"],
    title: "Don't let it overflow",
    rule: "Stop the pour at the right level. Beer running down the outside of the glass is never normal.",
    why: "It's stock the venue has paid for and can't sell, it hurts the GP, and the guest is left holding a sticky glass.",
    reviewed: true,
  },
  {
    id: "c6",
    concepts: ["s5"],
    title: "Buttery beer means a dirty line",
    rule: "If draught beer tastes like butter, tell your manager: the line needs cleaning.",
    why: "The buttery taste is diacetyl, which builds up in lines that haven't been cleaned. Every pour from that tap tastes off until it's fixed.",
    reviewed: true,
  },
];
