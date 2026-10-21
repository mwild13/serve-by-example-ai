"use client";

import { useEffect, useState } from "react";
import { getShiftStreak } from "@/lib/verify-quiz-client";
import type { ShiftStreak } from "@/lib/shift-streak";
import { useMobileSession } from "./mobile-session-context";

// The shift streak for the gold chip on a screen's avatar. Kept in memory
// for the visit, so moving between tabs shows it straight away and asks the
// server once.

let cached: { token: string; streak: ShiftStreak } | null = null;
let pending: Promise<ShiftStreak> | null = null;
const listeners = new Set<(streak: ShiftStreak) => void>();

function load(token: string): Promise<ShiftStreak> {
  if (!pending) {
    pending = getShiftStreak(token)
      .then((streak) => {
        cached = { token, streak };
        listeners.forEach((listener) => listener(streak));
        return streak;
      })
      .finally(() => {
        pending = null;
      });
  }
  return pending;
}

function refreshShiftStreak(token: string): void {
  void load(token).catch(() => {
    // The chip keeps its last value.
  });
}

export function useShiftStreak(): ShiftStreak | null {
  const { token } = useMobileSession();
  const [streak, setStreak] = useState<ShiftStreak | null>(cached?.token === token ? cached.streak : null);

  useEffect(() => {
    if (!token) return;
    listeners.add(setStreak);
    if (cached?.token !== token) refreshShiftStreak(token);
    return () => {
      listeners.delete(setStreak);
    };
  }, [token]);

  return streak;
}
