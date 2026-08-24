"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { TrainingProgress } from "./use-training-progress";

// Perf fix (Phase 1a, mobile bug-fix plan) — useTrainingProgress() used to
// run its own fetch effect independently in every consuming screen
// (HomeScreen, LearnHubScreen, ProgressScreen, ChallengesScreen,
// BadgesGalleryScreen), so navigating between them re-ran the full
// /api/training/progress round trip from zero every time — the direct cause
// of "Continue Learning" appearing to hang on first login, then "arriving"
// only after navigating away and back. This provider fetches once per
// /mobile session (mounted alongside MobileSessionProvider in
// app/mobile/layout.tsx) and every screen reads the same shared state via
// useTrainingProgress() in use-training-progress.ts, which now just
// delegates to this context — no consumer import paths changed, the public
// {status, data, error, refetch} shape is identical.
//
// Correctness note: because this is now shared state instead of
// fetch-on-every-mount, any screen that WRITES an attempt (QuizScreen,
// ScenarioPracticeScreen, ArenaScreen, the challenge screens via
// use-challenge-complete.ts) must call refetch() after a successful save —
// otherwise Home/Learn/Me would keep showing stale progress after a
// completed quiz/scenario/challenge, which the old per-mount refetch used to
// paper over accidentally. See those files for the added refetch() calls.

type State =
  | { status: "loading"; data: null; error: null }
  | { status: "error"; data: null; error: string }
  | { status: "ready"; data: TrainingProgress; error: null };

type TrainingProgressContextValue = State & { refetch: () => void };

const TrainingProgressContext = createContext<TrainingProgressContextValue | null>(null);

export function TrainingProgressProvider({
  token,
  children,
}: {
  token: string;
  children: ReactNode;
}) {
  const [state, setState] = useState<State>({ status: "loading", data: null, error: null });
  const [refetchToken, setRefetchToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState((prev) => (prev.status === "ready" ? prev : { status: "loading", data: null, error: null }));
      try {
        const res = await fetch("/api/training/progress", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Failed to load training progress (${res.status})`);
        const data = (await res.json()) as TrainingProgress;
        if (!cancelled) setState({ status: "ready", data, error: null });
      } catch (err) {
        if (!cancelled) {
          setState({
            status: "error",
            data: null,
            error: err instanceof Error ? err.message : "Failed to load training progress.",
          });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token, refetchToken]);

  const refetch = useCallback(() => setRefetchToken((n) => n + 1), []);

  const value: TrainingProgressContextValue = { ...state, refetch };

  return <TrainingProgressContext.Provider value={value}>{children}</TrainingProgressContext.Provider>;
}

/** Internal — used only by use-training-progress.ts's public useTrainingProgress() export. */
export function useTrainingProgressContext(): TrainingProgressContextValue {
  const ctx = useContext(TrainingProgressContext);
  if (!ctx) {
    throw new Error(
      "useTrainingProgress() must be used within TrainingProgressProvider (app/mobile/layout.tsx)",
    );
  }
  return ctx;
}
