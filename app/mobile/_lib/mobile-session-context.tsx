"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, WifiOff } from "lucide-react";
import { computeStreak } from "@/lib/streak";
import { flushRetryQueue, getPendingCount } from "./retry-queue";

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
  /**
   * Priority 3 (offline resilience, 2026-08-22). Starts `true` — matches
   * what SSR renders (no banner), then corrected from `navigator.onLine` in
   * the mount effect below, same SSR-safe-then-correct pattern as
   * streakCount above (never read a browser global during initial render).
   */
  isOnline: boolean;
  /** Count of queued challenges/save retries not yet flushed. See retry-queue.ts. */
  pendingSyncCount: number;
};

/** What app/mobile/layout.tsx (server) actually seeds — everything except
 * the client-computed fields this provider fills in itself. */
type MobileSessionSeed = Omit<MobileSession, "streakCount" | "isOnline" | "pendingSyncCount">;

const MobileSessionContext = createContext<MobileSession | null>(null);

export function MobileSessionProvider({
  value,
  children,
}: {
  value: MobileSessionSeed;
  children: ReactNode;
}) {
  const [streakCount, setStreakCount] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStreakCount(computeStreak());
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOnline(navigator.onLine);
    setPendingSyncCount(getPendingCount());

    async function attemptFlush() {
      const remaining = await flushRetryQueue(value.token);
      setPendingSyncCount(remaining);
    }

    function handleOnline() {
      setIsOnline(true);
      void attemptFlush();
    }
    function handleOffline() {
      setIsOnline(false);
    }
    function handleVisibility() {
      if (document.visibilityState === "visible" && navigator.onLine) {
        void attemptFlush();
      }
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    document.addEventListener("visibilitychange", handleVisibility);

    // Items may already be queued from a previous offline session — flush
    // immediately if we're online on this mount rather than waiting for the
    // next online/foreground event.
    if (navigator.onLine) void attemptFlush();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const merged = useMemo<MobileSession>(
    () => ({ ...value, streakCount, isOnline, pendingSyncCount }),
    [value, streakCount, isOnline, pendingSyncCount],
  );

  return (
    <MobileSessionContext.Provider value={merged}>
      {(!isOnline || pendingSyncCount > 0) && <SyncStatusBanner isOnline={isOnline} pendingSyncCount={pendingSyncCount} />}
      {children}
    </MobileSessionContext.Provider>
  );
}

// Single insertion point for the whole /mobile tree (rendered here in the
// provider, not per-screen) — reuses the exact visual pattern already
// established by ScenarioPracticeScreen.tsx's save-failure banner
// (AlertTriangle, --red-mobile, pill-radius), rather than inventing new
// styling for offline state.
function SyncStatusBanner({ isOnline, pendingSyncCount }: { isOnline: boolean; pendingSyncCount: number }) {
  const offline = !isOnline;
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 390,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 16px",
        background: offline ? "var(--red-mobile)" : "var(--gold-mobile)",
      }}
    >
      {offline ? (
        <WifiOff size={14} strokeWidth={2} color="var(--bg-mobile-dark)" aria-hidden="true" />
      ) : (
        <AlertTriangle size={14} strokeWidth={2} color="var(--bg-mobile-dark)" aria-hidden="true" />
      )}
      <span style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: "var(--bg-mobile-dark)" }}>
        {offline
          ? "You're offline — changes will sync when you reconnect."
          : `Syncing ${pendingSyncCount} pending change${pendingSyncCount === 1 ? "" : "s"}…`}
      </span>
    </div>
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
