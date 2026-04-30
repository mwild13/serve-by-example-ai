/**
 * session.ts — Session displacement & tier access helpers.
 *
 * "One Device per Purchase": generates a session UUID on login,
 * stores it in the profiles table, and provides a helper to
 * verify the session matches (middleware / API).
 *
 * Tier access: determines what modules a user can reach based on
 * their tier or a sponsor (venue_memberships).
 */

import type { SupabaseClient } from "@supabase/supabase-js";

// ── Session displacement ─────────────────────────────────────

export function generateSessionId(): string {
  return crypto.randomUUID();
}

/**
 * Write the new session ID to the profiles table.
 * Called on every login event (sign-in, sign-up, token refresh from new device).
 */
export async function stampSession(
  admin: SupabaseClient,
  userId: string,
  sessionId: string,
): Promise<void> {
  await admin
    .from("profiles")
    .update({ current_session_id: sessionId })
    .eq("id", userId);
}

/**
 * Check whether the provided sessionId matches the one stored in profiles.
 * Returns { valid: true } if they match or if the column doesn't exist yet.
 */
export async function validateSession(
  admin: SupabaseClient,
  userId: string,
  sessionId: string | null,
): Promise<{ valid: boolean; currentSessionId?: string }> {
  if (!sessionId) return { valid: false };

  const { data, error } = await admin
    .from("profiles")
    .select("current_session_id")
    .eq("id", userId)
    .single();

  // If column doesn't exist yet (migration not run), allow through
  if (error || !data) return { valid: true };

  const stored = data.current_session_id as string | null;

  // No session stamped yet — allow through (first login)
  if (!stored) return { valid: true };

  return {
    valid: stored === sessionId,
    currentSessionId: stored,
  };
}

// ── Tier access control ──────────────────────────────────────

export type Tier = "free" | "pro" | "venue_single" | "venue_multi";

export type AccessInfo = {
  tier: Tier;
  allowedModules: number[]; // 1 = bartending, 2 = sales, 3 = management, 4 = management-console
  maxSeats: number;
  isSponsored: boolean; // true if access comes via venue_memberships
  sponsorManagerId?: string;
};

const TIER_MODULES: Record<Tier, number[]> = {
  free: [],
  pro: [1, 2],
  venue_single: [1, 2, 3, 4],
  venue_multi: [1, 2, 3, 4],
};

const TIER_SEATS: Record<Tier, number> = {
  free: 0,
  pro: 0,
  venue_single: 25,
  venue_multi: 125, // 5 venues * 25
};

/**
 * Resolve a user's effective access level.
 * Checks own subscription first, then falls back to sponsor (venue_memberships).
 */
export async function resolveAccess(
  admin: SupabaseClient,
  userId: string,
  userEmail: string | undefined,
): Promise<AccessInfo> {
  // 1. Check user's own profile tier
  const { data: profile } = await admin
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .single();

  // Map legacy plan values to tier values
  const rawTier = profile?.plan ?? "free";
  const tierMap: Record<string, Tier> = {
    free: "free",
    pro: "pro",
    "single-venue": "venue_single",
    "multi-venue": "venue_multi",
    venue_single: "venue_single",
    venue_multi: "venue_multi",
  };
  const tier = tierMap[rawTier] ?? "free";

  if (tier !== "free") {
    return {
      tier,
      allowedModules: TIER_MODULES[tier],
      maxSeats: TIER_SEATS[tier],
      isSponsored: false,
    };
  }

  // 2. Check if the user is sponsored via venue_memberships
  if (userEmail) {
    const { data: membership } = await admin
      .from("venue_memberships")
      .select("manager_id, status")
      .ilike("staff_email", userEmail)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (membership) {
      // Get the manager's tier and role to determine what access the staff gets
      const { data: managerProfile } = await admin
        .from("profiles")
        .select("plan, platform_role")
        .eq("id", membership.manager_id)
        .single();

      const managerRawTier = managerProfile?.plan ?? "free";
      const managerTier = tierMap[managerRawTier] ?? "free";
      const managerRole = (managerProfile?.platform_role ?? "staff") as string;

      // Grant access if manager has a venue plan OR a venue/admin platform role
      const managerHasVenueAccess =
        managerTier === "venue_single" ||
        managerTier === "venue_multi" ||
        managerRole === "venue_manager" ||
        managerRole === "multi_venue_manager" ||
        managerRole === "admin";

      if (managerHasVenueAccess) {
        const effectiveTier: Tier =
          managerTier === "venue_multi" || managerRole === "multi_venue_manager"
            ? "venue_multi"
            : "venue_single";
        return {
          tier: effectiveTier,
          allowedModules: TIER_MODULES[effectiveTier],
          maxSeats: 0, // staff don't manage seats
          isSponsored: true,
          sponsorManagerId: membership.manager_id as string,
        };
      }
    }
  }

  return {
    tier: "free",
    allowedModules: TIER_MODULES.free,
    maxSeats: 0,
    isSponsored: false,
  };
}

/**
 * Check how many active memberships a manager has for seat cap enforcement.
 */
export async function countActiveSeats(
  admin: SupabaseClient,
  managerId: string,
  venueId?: string,
): Promise<number> {
  let query = admin
    .from("venue_memberships")
    .select("id", { count: "exact", head: true })
    .eq("manager_id", managerId)
    .in("status", ["invited", "active"]);

  if (venueId) {
    query = query.eq("venue_id", venueId);
  }

  const { count } = await query;
  return count ?? 0;
}
