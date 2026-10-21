"use client";

import { useCallback } from "react";
import { useStaffData } from "@/lib/staff-cache";
import { STAFF_KEYS, loadShiftStreak } from "@/lib/staff-data";
import type { ShiftStreak } from "@/lib/shift-streak";
import { useMobileSession } from "./mobile-session-context";

// The staff desktop's data cache (lib/staff-cache.ts, lib/staff-data.ts) on
// mobile. MobileSessionProvider makes this person its owner, so moving
// between tabs shows the last data straight away while a fresh copy loads.

/** A stable token getter for the cache's loaders. */
export function useGetToken(): () => Promise<string> {
  const { token } = useMobileSession();
  return useCallback(async () => token, [token]);
}

/** The shift streak for the gold chip on a screen's avatar. */
export function useShiftStreak(): ShiftStreak | null {
  const getToken = useGetToken();
  return useStaffData(STAFF_KEYS.shiftStreak, loadShiftStreak, getToken).data ?? null;
}
