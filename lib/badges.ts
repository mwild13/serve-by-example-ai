type BadgeCategory = "technical" | "service" | "compliance" | "streak" | "special";

export type Badge = {
  id: string;
  label: string;
  description: string;
  category: BadgeCategory;
  earned: boolean;
  progress?: { current: number; required: number; unit: string };
};

type ModuleSummaryForBadges = {
  category: "technical" | "service" | "compliance";
  mastered: boolean;
  attempted: boolean;
};

type CategoryScores = {
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

function computeBadges(
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

  // Streak badges (streak from localStorage – may be null on server; treat null as 0)
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

  // Special: SBE Elite (mastered 80%+ of all modules – computed from data, not DB counter)
  const masteredTotal = modules.filter((m) => m.mastered).length;
  const requiredForElite = Math.max(1, Math.ceil(modules.length * 0.8));
  const eliteEarned = modules.length > 0 && masteredTotal >= requiredForElite;
  badges.push({
    id: "sbe-elite",
    label: eliteEarned && sbeElite >= 1 ? `SBE Elite #${sbeElite}` : "SBE Elite",
    description: "Mastered 80% or more of all training modules across the platform.",
    category: "special",
    earned: eliteEarned,
    ...(!eliteEarned ? { progress: { current: masteredTotal, required: requiredForElite, unit: "modules mastered" } } : {}),
  });

  return badges;
}

/**
 * Every badge from GET /api/training/progress's response, earned ones first.
 * The staff desktop (MyProgressPage.tsx) and mobile (Me and Badges) both
 * read it this way. `visitStreak` is the daily-visit count the streak badges
 * use (readVisitStreak below).
 */
export function badgesFromProgress(progress: Record<string, unknown> | null, visitStreak: number): Badge[] {
  const allModules = Array.isArray(progress?.allModules) ? (progress.allModules as { id: number; category: string }[]) : [];
  const mp = (progress?.moduleProgress as Record<number, { mastery?: number; scenariosAttempted?: number }> | undefined) ?? {};
  const summaries: ModuleSummaryForBadges[] = allModules.map((m) => ({
    category: m.category as ModuleSummaryForBadges["category"],
    mastered: (mp[m.id]?.mastery ?? 0) >= 80,
    attempted: (mp[m.id]?.scenariosAttempted ?? 0) > 0,
  }));
  const mastery = (progress?.mastery as Partial<CategoryScores> | undefined) ?? {};
  const scores: CategoryScores = { bartending: mastery.bartending ?? 0, sales: mastery.sales ?? 0, management: mastery.management ?? 0 };
  const list = computeBadges(
    summaries,
    scores,
    visitStreak,
    typeof progress?.bestCorrectStreak === "number" ? progress.bestCorrectStreak : 0,
    typeof progress?.sbeEliteNumber === "number" ? progress.sbeEliteNumber : 0,
  );
  return [...list.filter((b) => b.earned), ...list.filter((b) => !b.earned)];
}

/** The badge to show as "Next to earn": the first one under way, else the first not earned. */
export function nextBadge(badges: Badge[]): Badge | null {
  return badges.find((b) => !b.earned && b.progress && b.progress.current > 0) ?? badges.find((b) => !b.earned) ?? null;
}

/** "42% of 50% avg mastery", "2 of 7 day streak". */
export function badgeProgressText(progress: NonNullable<Badge["progress"]>): string {
  return progress.unit.startsWith("%")
    ? `${progress.current}% of ${progress.required}%${progress.unit.slice(1)}`
    : `${progress.current} of ${progress.required} ${progress.unit}`;
}

/** The daily-visit streak (lib/streak.ts keeps it on this device), read only. */
export function readVisitStreak(): number {
  try {
    return parseInt(localStorage.getItem("sbe-streak-count") ?? "0", 10) || 0;
  } catch {
    return 0;
  }
}
