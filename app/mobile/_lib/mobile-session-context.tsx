"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { computeStreak } from "@/lib/streak";

// Phase C file 01 — seeded once by app/mobile/layout.tsx (server) and read
// by any client screen via useMobileSession(). V4's mobile surface is 12
// independent routes rather than one shell component (like DashboardShell),
// so a context is the natural equivalent of DashboardShell's initialToken
// prop — it avoids threading the same handful of values through every leaf
// page.tsx. See v4-migration-plan/01-supabase-client-and-auth.md.

export type MobileSession = {
  /** Supabase access token — attach as `Authorization: Bearer <token>` on API calls. */
  token: string;
  userEmail: string;
  displayName: string;
  /** Resolved plan string from resolveTierAccess() (lib/session.ts) — e.g. "free", "pro", "boutique". */
  tier: string;
  /** Module IDs (1–40) this user can access. Empty array = no module access. */
  allowedModules: number[];
  hasVenueMembership: boolean;
  venueMembershipPaused: boolean;
  /** Saved AI portrait URL (profiles.profile_photo_url), or null if the user has never saved one. */
  profilePhotoUrl: string | null;
  /**
   * Client-only daily-login streak (see lib/streak.ts) — null until the
   * mount effect below resolves, same SSR-safe placeholder pattern every
   * other localStorage read uses in this migration (e.g.
   * BadgesGalleryScreen.tsx's `streak` state). Computed and incremented
   * once here, at the provider that wraps the whole /mobile tree, rather
   * than per-screen (Phase 6, v4-migration-plan/00-bug-batch-plan.md item
   * 13) — that's what makes it "run once per mobile session" regardless of
   * which screen the user lands on first, and it means every consumer
   * (HomeScreen today) reads the already-incremented value instead of
   * racing a sibling effect that hasn't incremented it yet.
   */
  streakCount: number | null;
};

/** What app/mobile/layout.tsx (server) actually seeds — everything except
 * the client-computed streakCount, which this provider fills in itself. */
type MobileSessionSeed = Omit<MobileSession, "streakCount">;

const MobileSessionContext = createContext<MobileSession | null>(null);

export function MobileSessionProvider({
  value,
  children,
}: {
  value: MobileSessionSeed;
  children: ReactNode;
}) {
  const [streakCount, setStreakCount] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStreakCount(computeStreak());
  }, []);

  const merged = useMemo<MobileSession>(() => ({ ...value, streakCount }), [value, streakCount]);

  return (
    <MobileSessionContext.Provider value={merged}>
      {children}
    </MobileSessionContext.Provider>
  );
}

/**
 * Read the auth/tier context seeded by app/mobile/layout.tsx. Every screen
 * under app/mobile/_components renders inside that layout, so the provider
 * is always present in practice — this throws rather than silently falling
 * back, so a screen mounted outside the /mobile route tree fails loudly
 * instead of shipping with a blank token.
 */
export function useMobileSession(): MobileSession {
  const ctx = useContext(MobileSessionContext);
  if (!ctx) {
    throw new Error(
      "useMobileSession() must be used within MobileSessionProvider (app/mobile/layout.tsx)"
    );
  }
  return ctx;
}
