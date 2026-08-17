"use client";

import { createContext, useContext, type ReactNode } from "react";

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
};

const MobileSessionContext = createContext<MobileSession | null>(null);

export function MobileSessionProvider({
  value,
  children,
}: {
  value: MobileSession;
  children: ReactNode;
}) {
  return (
    <MobileSessionContext.Provider value={value}>
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
