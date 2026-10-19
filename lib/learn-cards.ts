// Learn cards: the short lessons a module opens with, before its quiz (Rich
// update, Phase 4). Each card teaches one rule and why it matters, written
// from the module's True/False statements in lib/verify-questions.ts.
//
// Cards hold no answer key, so unlike the question bank they are safe in the
// browser. Each module's cards are a separate chunk, loaded only when that
// module opens. A card is only shown once the owner has reviewed it
// (`reviewed: true`). See docs/MASTERY_ENGINE.md.

export type LearnCard = {
  /** Stable within a module ("c1", "c2"...). Never reuse one for a different card. */
  id: string;
  /** The statements this card teaches ("s0".."s7"), so a quiz miss can point back to it. */
  concepts: string[];
  title: string;
  /** The one rule, in a sentence or two. */
  rule: string;
  /** Why it matters: to the guest, the GP or safety. */
  why: string;
  /** Owner has checked it. Unreviewed cards are never shown. */
  reviewed: boolean;
};

export const LEARN_CARD_LOADERS: Partial<Record<number, () => Promise<LearnCard[]>>> = {
  1: () => import("@/lib/learn-cards/module-01").then((m) => m.MODULE_1_CARDS),
  2: () => import("@/lib/learn-cards/module-02").then((m) => m.MODULE_2_CARDS),
  3: () => import("@/lib/learn-cards/module-03").then((m) => m.MODULE_3_CARDS),
  4: () => import("@/lib/learn-cards/module-04").then((m) => m.MODULE_4_CARDS),
  5: () => import("@/lib/learn-cards/module-05").then((m) => m.MODULE_5_CARDS),
  6: () => import("@/lib/learn-cards/module-06").then((m) => m.MODULE_6_CARDS),
  7: () => import("@/lib/learn-cards/module-07").then((m) => m.MODULE_7_CARDS),
  8: () => import("@/lib/learn-cards/module-08").then((m) => m.MODULE_8_CARDS),
  9: () => import("@/lib/learn-cards/module-09").then((m) => m.MODULE_9_CARDS),
  10: () => import("@/lib/learn-cards/module-10").then((m) => m.MODULE_10_CARDS),
  11: () => import("@/lib/learn-cards/module-11").then((m) => m.MODULE_11_CARDS),
  12: () => import("@/lib/learn-cards/module-12").then((m) => m.MODULE_12_CARDS),
  13: () => import("@/lib/learn-cards/module-13").then((m) => m.MODULE_13_CARDS),
  14: () => import("@/lib/learn-cards/module-14").then((m) => m.MODULE_14_CARDS),
  15: () => import("@/lib/learn-cards/module-15").then((m) => m.MODULE_15_CARDS),
  16: () => import("@/lib/learn-cards/module-16").then((m) => m.MODULE_16_CARDS),
  17: () => import("@/lib/learn-cards/module-17").then((m) => m.MODULE_17_CARDS),
  18: () => import("@/lib/learn-cards/module-18").then((m) => m.MODULE_18_CARDS),
  19: () => import("@/lib/learn-cards/module-19").then((m) => m.MODULE_19_CARDS),
  20: () => import("@/lib/learn-cards/module-20").then((m) => m.MODULE_20_CARDS),
  21: () => import("@/lib/learn-cards/module-21").then((m) => m.MODULE_21_CARDS),
  22: () => import("@/lib/learn-cards/module-22").then((m) => m.MODULE_22_CARDS),
  23: () => import("@/lib/learn-cards/module-23").then((m) => m.MODULE_23_CARDS),
  24: () => import("@/lib/learn-cards/module-24").then((m) => m.MODULE_24_CARDS),
  25: () => import("@/lib/learn-cards/module-25").then((m) => m.MODULE_25_CARDS),
  26: () => import("@/lib/learn-cards/module-26").then((m) => m.MODULE_26_CARDS),
  27: () => import("@/lib/learn-cards/module-27").then((m) => m.MODULE_27_CARDS),
  28: () => import("@/lib/learn-cards/module-28").then((m) => m.MODULE_28_CARDS),
  29: () => import("@/lib/learn-cards/module-29").then((m) => m.MODULE_29_CARDS),
  30: () => import("@/lib/learn-cards/module-30").then((m) => m.MODULE_30_CARDS),
  31: () => import("@/lib/learn-cards/module-31").then((m) => m.MODULE_31_CARDS),
  32: () => import("@/lib/learn-cards/module-32").then((m) => m.MODULE_32_CARDS),
  33: () => import("@/lib/learn-cards/module-33").then((m) => m.MODULE_33_CARDS),
  34: () => import("@/lib/learn-cards/module-34").then((m) => m.MODULE_34_CARDS),
  35: () => import("@/lib/learn-cards/module-35").then((m) => m.MODULE_35_CARDS),
  36: () => import("@/lib/learn-cards/module-36").then((m) => m.MODULE_36_CARDS),
  37: () => import("@/lib/learn-cards/module-37").then((m) => m.MODULE_37_CARDS),
  38: () => import("@/lib/learn-cards/module-38").then((m) => m.MODULE_38_CARDS),
  39: () => import("@/lib/learn-cards/module-39").then((m) => m.MODULE_39_CARDS),
  40: () => import("@/lib/learn-cards/module-40").then((m) => m.MODULE_40_CARDS),
};

/** The reviewed cards for a module, or none. A module with no cards opens straight on its quiz. */
export async function loadLearnCards(moduleId: number): Promise<LearnCard[]> {
  const load = LEARN_CARD_LOADERS[moduleId];
  if (!load) return [];
  return (await load()).filter((card) => card.reviewed);
}
