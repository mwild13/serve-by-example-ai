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

// Human-readable label per tier. venue_single/venue_multi are the pre-rename
// legacy values (kept for old Supabase rows) and display as their modern
// equivalent — Boutique / Commercial — so the UI never shows a raw DB string.
const TIER_DISPLAY_NAMES: Record<Tier, string> = {
  free: "Free",
  pro: "Pro",
  boutique: "Boutique",
  commercial: "Commercial",
  enterprise: "Enterprise",
  venue_single: "Boutique",
  venue_multi: "Commercial",
};

// Tiers that unlock venue-based (B2B) management access, i.e. /management/dashboard.
const B2B_TIERS: Tier[] = ["boutique", "commercial", "enterprise", "venue_single", "venue_multi"];

// Tiers whose venue-switcher UI should show multi-venue controls.
// venue_single/venue_multi are legacy aliases for boutique/commercial.
const MULTI_VENUE_TIERS: Tier[] = ["commercial", "enterprise", "venue_multi"];

// Single source of truth for mapping a raw profiles.tier / plan string (including
// pre-rename legacy values) to the canonical Tier. Every tier-branching check in
// the app should normalize through this — do not re-implement this map elsewhere.
const TIER_ALIASES: Record<string, Tier> = {
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

export function normalizeTier(raw: string | null | undefined): Tier {
  if (!raw) return "free";
  return TIER_ALIASES[raw] ?? "free";
}

/** True for any tier that grants venue-based (B2B) management access. */
export function isB2BTier(raw: string | null | undefined): boolean {
  return B2B_TIERS.includes(normalizeTier(raw));
}

/** True for tiers whose venue switcher should show multi-venue controls. */
export function isMultiVenueTier(raw: string | null | undefined): boolean {
  return MULTI_VENUE_TIERS.includes(normalizeTier(raw));
}

export function tierDisplayName(raw: string | null | undefined): string {
  return TIER_DISPLAY_NAMES[normalizeTier(raw)];
}

export function tierSeatLimit(raw: string | null | undefined): number {
  return TIER_SEATS[normalizeTier(raw)];
}

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

  const tier = normalizeTier(profile?.tier);

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
      const trialTier = normalizeTier(org.trial_tier);
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

// ── Shared tier-resolution chain (dashboard + mobile) ────────

export type TierAccessInput = {
  tier: string | null;
  org_id: string | null;
  subscription_status: string | null;
  management_unlocked?: boolean | null;
};

export type ResolvedTierAccess = {
  plan: string;
  allowedModules: number[];
  hasVenueMembership: boolean;
  venueMembershipPaused: boolean;
  managementUnlocked: boolean;
};

const LAPSED_SUBSCRIPTION_STATUSES = new Set(["canceled", "incomplete_expired", "unpaid"]);
const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing", "past_due"]);

/**
 * Canonical tier-resolution chain: own profile tier → lapsed-subscription
 * downgrade → org trial sync → sponsored venue-membership fallback (paused
 * if the sponsor's own org trial has expired). Extracted from
 * app/dashboard/page.tsx so /dashboard and /mobile (app/mobile/layout.tsx)
 * share one implementation instead of two hand-copied chains drifting apart
 * — see v4-migration-plan/01-supabase-client-and-auth.md. Deliberately
 * separate from resolveAccess() above: that function is the general-purpose
 * API-route resolver and doesn't model the lapsed-subscription or
 * paused-sponsor cases these two page-level entry points need.
 */
export async function resolveTierAccess(
  admin: SupabaseClient,
  userEmail: string | undefined,
  profile: TierAccessInput,
): Promise<ResolvedTierAccess> {
  let plan = profile.tier ?? "free";

  // Lapsed-subscription downgrade: only revoke when the webhook has explicitly
  // written a terminal status. null means subscription_status has never been
  // written — trust tier in that case.
  if (plan !== "free" && LAPSED_SUBSCRIPTION_STATUSES.has(profile.subscription_status ?? "")) {
    plan = "free";
  }

  // Trial gate: runs for any user without an active Stripe subscription (null = trial/new).
  // Skipped for paying subscribers — their tier is authoritative.
  if (!ACTIVE_SUBSCRIPTION_STATUSES.has(profile.subscription_status ?? "") && profile.org_id) {
    const { data: org } = await admin
      .from("organizations")
      .select("trial_tier, trial_ends_at, trial_converted")
      .eq("id", profile.org_id)
      .single();
    const trialStatus = getTrialStatus(org);
    if (trialStatus === "active" && org?.trial_tier) {
      plan = org.trial_tier as string;
    } else if (trialStatus === "expired") {
      plan = "free";
    }
  }

  // Sponsored venue staff (invited by a manager) get full training access
  // even on the free plan tier — unless the sponsoring manager's own org
  // trial has expired, in which case sponsored access pauses.
  let hasVenueMembership = false;
  let venueMembershipPaused = false;
  if (plan === "free" && userEmail) {
    const { data: membership } = await admin
      .from("organization_members")
      .select("id, manager_id")
      .eq("staff_email", userEmail.toLowerCase())
      .in("status", ["invited", "active"])
      .limit(1)
      .maybeSingle();
    hasVenueMembership = !!membership;

    if (membership?.manager_id) {
      const { data: managerProfile } = await admin
        .from("profiles")
        .select("org_id")
        .eq("id", membership.manager_id)
        .single();

      if (managerProfile?.org_id) {
        const { data: managerOrg } = await admin
          .from("organizations")
          .select("trial_tier, trial_ends_at, trial_converted")
          .eq("id", managerProfile.org_id)
          .single();

        if (getTrialStatus(managerOrg) === "expired") {
          venueMembershipPaused = true;
        }
      }
    }
  }

  const normalizedTier = normalizeTier(plan);
  const allowedModules = hasVenueMembership
    ? (venueMembershipPaused ? [] : ALL_MODULES)
    : TIER_MODULES[normalizedTier];

  // Sponsored staff on the free tier must never see management content,
  // even if management_unlocked was previously set in their profile.
  const managementUnlocked = hasVenueMembership && plan === "free"
    ? false
    : (profile.management_unlocked ?? false);

  return { plan, allowedModules, hasVenueMembership, venueMembershipPaused, managementUnlocked };
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
