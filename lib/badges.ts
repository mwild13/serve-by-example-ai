export type BadgeCategory = "technical" | "service" | "compliance" | "streak" | "special";

export type Badge = {
  id: string;
  label: string;
  description: string;
  category: BadgeCategory;
  earned: boolean;
  progress?: { current: number; required: number; unit: string };
};

export type ModuleSummaryForBadges = {
  category: "technical" | "service" | "compliance";
  mastered: boolean;
  attempted: boolean;
};

export type CategoryScores = {
  bartending: number; // 0-100 avg mastery %
  sales: number;
  management: number;
};

type CategoryDef = {
  key: "technical" | "service" | "compliance";
  scoreKey: keyof CategoryScores;
  starter: { id: string; label: string; description: string };
  skilled: { id: string; label: string; description: string };
  expert:  { id: string; label: string; description: string };
  master:  { id: string; label: string; description: string };
};

const CATEGORY_DEFS: CategoryDef[] = [
  {
    key: "technical",
    scoreKey: "bartending",
    starter: { id: "tech-starter", label: "First Pour",       description: "Completed your first technical training module." },
    skilled: { id: "tech-skilled", label: "Bartender",        description: "Reached 50% average mastery across all technical modules." },
    expert:  { id: "tech-expert",  label: "Head Bartender",   description: "Reached 80% average mastery across all technical modules." },
    master:  { id: "tech-master",  label: "Master Bartender", description: "Reached 95% average mastery across all technical modules." },
  },
  {
    key: "service",
    scoreKey: "sales",
    starter: { id: "svc-starter", label: "First Shift",       description: "Completed your first service training module." },
    skilled: { id: "svc-skilled", label: "Server",            description: "Reached 50% average mastery across all service modules." },
    expert:  { id: "svc-expert",  label: "Floor Manager",     description: "Reached 80% average mastery across all service modules." },
    master:  { id: "svc-master",  label: "Master of Service", description: "Reached 95% average mastery across all service modules." },
  },
  {
    key: "compliance",
    scoreKey: "management",
    starter: { id: "com-starter", label: "By the Book",        description: "Completed your first compliance training module." },
    skilled: { id: "com-skilled", label: "RSA Ready",          description: "Reached 50% average mastery across all compliance modules." },
    expert:  { id: "com-expert",  label: "Compliance Officer", description: "Reached 80% average mastery across all compliance modules." },
    master:  { id: "com-master",  label: "Venue Ready",        description: "Reached 95% average mastery across all compliance modules." },
  },
];

const STREAK_DEFS = [
  { id: "streak-3",  label: "Consistent", description: "Trained 3 days in a row.",  required: 3  },
  { id: "streak-7",  label: "Dedicated",  description: "Trained 7 days in a row.",  required: 7  },
  { id: "streak-30", label: "On Fire",    description: "Trained 30 days in a row.", required: 30 },
];

export function computeBadges(
  modules: ModuleSummaryForBadges[],
  scores: CategoryScores,
  streak: number,
  bestStreak: number,
  sbeElite: number,
): Badge[] {
  const badges: Badge[] = [];

  // Category badges
  for (const def of CATEGORY_DEFS) {
    const catModules = modules.filter((m) => m.category === def.key);
    const anyAttempted = catModules.some((m) => m.attempted);
    const score = scores[def.scoreKey];

    badges.push({
      id: def.starter.id,
      label: def.starter.label,
      description: def.starter.description,
      category: def.key,
      earned: anyAttempted,
    });

    badges.push({
      id: def.skilled.id,
      label: def.skilled.label,
      description: def.skilled.description,
      category: def.key,
      earned: score >= 50,
      ...(!anyAttempted || score >= 50 ? {} : { progress: { current: Math.round(score), required: 50, unit: "% avg mastery" } }),
    });

    badges.push({
      id: def.expert.id,
      label: def.expert.label,
      description: def.expert.description,
      category: def.key,
      earned: score >= 80,
      ...(score >= 80 ? {} : { progress: { current: Math.round(score), required: 80, unit: "% avg mastery" } }),
    });

    badges.push({
      id: def.master.id,
      label: def.master.label,
      description: def.master.description,
      category: def.key,
      earned: score >= 95,
      ...(score >= 95 ? {} : { progress: { current: Math.round(score), required: 95, unit: "% avg mastery" } }),
    });
  }

  // Streak badges (streak from localStorage — may be null on server; treat null as 0)
  for (const def of STREAK_DEFS) {
    badges.push({
      id: def.id,
      label: def.label,
      description: def.description,
      category: "streak",
      earned: streak >= def.required,
      ...(streak >= def.required ? {} : { progress: { current: streak, required: def.required, unit: "day streak" } }),
    });
  }

  // Special: Pro (25 correct in a row)
  badges.push({
    id: "pro",
    label: "Pro",
    description: "Answered 25 questions correctly in a row across any module.",
    category: "special",
    earned: bestStreak >= 25,
    ...(bestStreak >= 25 ? {} : { progress: { current: bestStreak, required: 25, unit: "correct in a row" } }),
  });

  // Special: SBE Elite (full platform completion)
  const eliteEarned = sbeElite >= 1;
  badges.push({
    id: "sbe-elite",
    label: eliteEarned ? `SBE Elite #${sbeElite}` : "SBE Elite",
    description: "Achieved 80%+ mastery across all 20 training modules. The complete platform.",
    category: "special",
    earned: eliteEarned,
    ...(!eliteEarned ? { progress: { current: modules.filter((m) => m.mastered).length, required: 20, unit: "modules mastered" } } : {}),
  });

  return badges;
}

export function countEarned(badges: Badge[]): number {
  return badges.filter((b) => b.earned).length;
}

export function recentEarned(badges: Badge[], limit = 3): Badge[] {
  return badges.filter((b) => b.earned).slice(0, limit);
}
