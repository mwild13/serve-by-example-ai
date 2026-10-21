"use client";

import { fetchStaffData } from "@/lib/staff-cache";
import { getShiftStreak } from "@/lib/verify-quiz-client";
import { getRushStats } from "@/lib/rush/client";
import { listLiveGuests } from "@/lib/live-guest-client";
import type { StepModule } from "@/lib/next-step";
import type { TeamWeek } from "@/lib/team-week-shared";

// What the staff desktop's pages load, under one cache key each
// (lib/staff-cache.ts). Several pages share a key: the module list feeds
// Today, Modules, My progress and the drill, so it loads once.

export const STAFF_KEYS = {
  modules: "modules",
  shiftStreak: "shift-streak",
  rush: "rush",
  teamWeek: "team-week",
  liveGuests: "live-guests",
} as const;

export type StaffModule = StepModule & { description?: string | null };

/** The module list, in recommended order (the route's default sort). */
export async function loadModules(token: string): Promise<StaffModule[]> {
  const res = await fetch("/api/training/modules", { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error("Could not load the modules.");
  return ((await res.json()) as { modules: StaffModule[] }).modules;
}

export const loadShiftStreak = getShiftStreak;
export const loadRushStats = getRushStats;
export const loadLiveGuests = listLiveGuests;

export async function loadTeamWeek(token: string): Promise<TeamWeek | null> {
  const res = await fetch("/api/training/team-week", { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return null;
  return ((await res.json()) as { week: TeamWeek | null }).week ?? null;
}

/**
 * Loads every page's data once the shell is up, so the first visit to each
 * page is as quick as a return visit. Failures are ignored here; the page
 * asks again when it opens.
 */
export function warmStaffCache(getToken: () => Promise<string>, opts: { liveGuest: boolean }) {
  const quiet = () => undefined;
  void fetchStaffData(STAFF_KEYS.modules, loadModules, getToken).catch(quiet);
  void fetchStaffData(STAFF_KEYS.shiftStreak, loadShiftStreak, getToken).catch(quiet);
  void fetchStaffData(STAFF_KEYS.teamWeek, loadTeamWeek, getToken).catch(quiet);
  void fetchStaffData(STAFF_KEYS.rush, loadRushStats, getToken).catch(quiet);
  if (opts.liveGuest) void fetchStaffData(STAFF_KEYS.liveGuests, loadLiveGuests, getToken).catch(quiet);
}
