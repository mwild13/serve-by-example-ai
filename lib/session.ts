/**
 * session.ts – Session displacement & tier access helpers.
 *
 * "One Device per Purchase": generates a session UUID on login,
 * stores it in the profiles table, and provides a helper to
 * verify the session matches (middleware / API).
 *
 * Tier access: determines what modules a user can reach based on
 * their tier or a sponsor (organization_members).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { getTrialStatus } from "@/lib/trial";

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

  // No session stamped yet – allow through (first login)
  if (!stored) return { valid: true };

  return {
    valid: stored === sessionId,
    currentSessionId: stored,
  };
}

// ── Tier access control ──────────────────────────────────────

export type Tier =
  | "free"
  | "pro"
  | "boutique"
  | "commercial"
  | "enterprise"
  | "venue_single"   // legacy — kept for backward compat
  | "venue_multi";   // legacy — kept for backward compat

export type AccessInfo = {
  tier: Tier;
  allowedModules: number[]; // 1 = bartending, 2 = sales, 3 = management, 4 = management-console
  maxSeats: number;
  isSponsored: boolean; // true if access comes via organization_members
  sponsorManagerId?: string;
  isTrial?: boolean; // true if access comes from an active org trial
};

const ALL_MODULES = Array.from({ length: 40 }, (_, i) => i + 1);

const TIER_MODULES: Record<Tier, number[]> = {
  free: [],
  pro: ALL_MODULES,
  boutique: ALL_MODULES,
  commercial: ALL_MODULES,
  enterprise: ALL_MODULES,
  venue_single: ALL_MODULES,
  venue_multi: ALL_MODULES,
};

export const TIER_SEATS: Record<Tier, number> = {
  free: 0,
  pro: 0,
  boutique: 15,
  commercial: 35,
  enterprise: 9999,
  venue_single: 15,
  venue_multi: 35,
};

/**
 * Resolve a user's effective access level.
 * Checks own subscription first, then falls back to sponsor (organization_members).
 */
export async function resolveAccess(
  admin: SupabaseClient,
  userId: string,
  userEmail: string | undefined,
): Promise<AccessInfo> {
  // 1. Check user's own profile tier
  const { data: profile } = await admin
    .from("profiles")
    .select("tier, org_id")
    .eq("id", userId)
    .single();

  // Map legacy plan values to tier values
  const rawTier = profile?.tier ?? "free";
  const tierMap: Record<string, Tier> = {
    free: "free",
    pro: "pro",
    boutique: "boutique",
    commercial: "commercial",
    enterprise: "enterprise",
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

  // 2. Check if the user's org has an active trial (manager path).
  // Trial state lives on organizations so both manager and staff paths can resolve it
  // via a single join without cross-profile lookups.
  if (profile?.org_id) {
    const { data: org } = await admin
      .from("organizations")
      .select("trial_tier, trial_ends_at, trial_converted")
      .eq("id", profile.org_id)
      .single();

    const trialStatus = getTrialStatus(org);
    if (trialStatus === "active" && org?.trial_tier) {
      const trialTier = (tierMap[org.trial_tier] ?? org.trial_tier) as Tier;
      return {
        tier: trialTier,
        allowedModules: TIER_MODULES[trialTier] ?? ALL_MODULES,
        maxSeats: TIER_SEATS[trialTier] ?? 0,
        isSponsored: false,
        isTrial: true,
      };
    }
  }

  // 3. Check if the user is sponsored via organization_members.
  // An active membership is sufficient – no need to re-check the manager's plan.
  // This matches the dashboard page logic which grants access on membership alone.
  if (userEmail) {
    const { data: membership } = await admin
      .from("organization_members")
      .select("manager_id")
      .ilike("staff_email", userEmail)
      .in("status", ["active", "invited"])
      .eq("seat_counted", true)
      .limit(1)
      .maybeSingle();

    if (membership) {
      return {
        tier: "venue_single",
        allowedModules: ALL_MODULES,
        maxSeats: 0,
        isSponsored: true,
        sponsorManagerId: membership.manager_id as string,
      };
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
    .from("organization_members")
    .select("id", { count: "exact", head: true })
    .eq("manager_id", managerId)
    .in("status", ["invited", "active"])
    .eq("seat_counted", true);

  if (venueId) {
    query = query.eq("venue_id", venueId);
  }

  const { count } = await query;
  return count ?? 0;
}
