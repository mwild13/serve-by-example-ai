import type { StaffMember, StaffStatus } from "@/lib/management/types";

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

// The status shown across the console, worked out from progress and
// activity every time staff are loaded. venue_staff.status is written once,
// when a person is added, and never updated, so it is no longer read.
// Someone who has not started stays "on-track" here: the tables label them
// "Not started", and needsAttention() below flags them on its own rule.
export function deriveStaffStatus(progress: number, lastActive: string): StaffStatus {
  if (progress >= 100) return "on-track";
  const daysInactive = parseLastActiveDays(lastActive);
  if (daysInactive === null) return "on-track";
  if (daysInactive >= 30) return "inactive";
  if (daysInactive >= 14) return "attention";
  return "on-track";
}

export function needsAttention(member: StaffMember): boolean {
  // Finished training: nothing for a manager to chase, however long ago the
  // last session was. Without this, a venue whose team had all finished and
  // gone quiet showed every person as needing attention.
  if (member.progress >= 100) return false;

  // Onboarding Stagnation: never started training
  if (member.lastActive === "Not started") return true;

  // Inactivity/Absence: no activity for 14+ days
  const daysInactive = parseLastActiveDays(member.lastActive);
  if (daysInactive !== null && daysInactive >= 14) return true;

  // Zero-Progress Alert: 0% completion on active staff
  if (member.progress === 0 && member.lastActive !== "Not started") return true;

  // Covered by the rules above for real staff, whose status comes from
  // deriveStaffStatus(). Kept for the demo data, which sets status by hand.
  return member.status !== "on-track";
}

export function filterNeedsAttention(staff: StaffMember[]): StaffMember[] {
  return staff.filter(needsAttention);
}
