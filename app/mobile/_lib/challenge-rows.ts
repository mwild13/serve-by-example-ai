import { Clock, Lightbulb, Link as LinkIcon, ListOrdered, MessageCircleQuestion, ScanSearch, TextCursorInput } from "lucide-react";
import { CHALLENGE_LIST, type ChallengeKind } from "@/lib/challenge-content";

// The ten challenges as mobile shows them: the first five on their own
// screens, the rest on the shared one (/mobile/challenge/<slug>). Used by the
// Challenges list and today's challenge on Practise.

export type ChallengeRow = {
  title: string;
  description: string;
  icon: typeof Clock;
  href: string;
  challengeIndex: number;
};

const KIND_ICON: Record<ChallengeKind, typeof Clock> = {
  sequence: ListOrdered,
  fill: TextCursorInput,
  match: LinkIcon,
  spot: ScanSearch,
  choice: MessageCircleQuestion,
};

export const CHALLENGE_ROWS: ChallengeRow[] = [
  { title: "Speed Round", description: "Quick multiple choice questions", icon: Clock, href: "/mobile/speed-round", challengeIndex: 4 },
  { title: "Memory Test", description: "Fill in the blanks in cocktail descriptions", icon: Lightbulb, href: "/mobile/memory-test", challengeIndex: 1 },
  { title: "Ingredient Match", description: "Pair each ingredient with its name", icon: LinkIcon, href: "/mobile/match-pairs", challengeIndex: 2 },
  { title: "Recipe Order", description: "Put the steps of a cocktail in order", icon: ListOrdered, href: "/mobile/recipe-order", challengeIndex: 0 },
  { title: "Menu Audit", description: "Spot the errors in a seasonal menu", icon: ScanSearch, href: "/mobile/menu-audit", challengeIndex: 3 },
  ...CHALLENGE_LIST.filter((c) => c.index >= 5).map((c) => ({
    title: c.title,
    description: c.pitch,
    icon: KIND_ICON[c.kind],
    href: `/mobile/challenge/${c.slug}`,
    challengeIndex: c.index,
  })),
];

/** The challenges done on this device ("sbe_challenges_completed", shared with desktop). */
export function readDoneChallenges(): number[] {
  try {
    const stored = localStorage.getItem("sbe_challenges_completed");
    return stored ? (JSON.parse(stored) as number[]).filter((n) => Number.isInteger(n)) : [];
  } catch {
    return [];
  }
}
