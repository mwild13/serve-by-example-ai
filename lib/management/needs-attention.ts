import type { StaffMember } from "@/lib/management/types";

// Single source of truth for "which staff need attention" — used to live
// as two independently-defined rules: ManagerControlCenter.tsx's Overview
// computation (onboarding stagnation, 14+ day inactivity, zero progress,
// non-on-track status) and TeamsPerformancePanel.tsx's narrower
// status-only filter. The two tabs' counts looked "wrong" against each
// other only because they were answering different questions, not because
// one was buggy — both now call this.

export function parseLastActiveDays(lastActive: string): number | null {
  if (lastActive === "Not started") return null; // flag for onboarding stagnation
  const match = lastActive.match(/^(\d+)\s+days?\s+ago$/);
  if (match) return parseInt(match[1], 10);
  if (lastActive === "Today") return 0;
  if (lastActive === "Yesterday") return 1;
  return null;
}

// "Active in the last N days" — shared by the Overview tile, the notice reel
// and the venue health score so all three count the same people. A staff
// member with an unreadable timestamp ("Recently") counts as active, which is
// how formatLastActive() in service.ts intends that label.
export function wasActiveWithinDays(lastActive: string, days: number): boolean {
  if (lastActive === "Not started") return false;
  const daysAgo = parseLastActiveDays(lastActive);
  return daysAgo === null ? true : daysAgo < days;
}

export function needsAttention(member: StaffMember): boolean {
  // Onboarding Stagnation: never started training
  if (member.lastActive === "Not started") return true;

  // Inactivity/Absence: no activity for 14+ days
  const daysInactive = parseLastActiveDays(member.lastActive);
  if (daysInactive !== null && daysInactive >= 14) return true;

  // Zero-Progress Alert: 0% completion on active staff
  if (member.progress === 0 && member.lastActive !== "Not started") return true;

  // Fallback to status-based flagging for other issues
  return member.status !== "on-track";
}

export function filterNeedsAttention(staff: StaffMember[]): StaffMember[] {
  return staff.filter(needsAttention);
}
