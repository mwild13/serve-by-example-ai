/**
 * auth.ts – Server-side gate for every /api/management/* route.
 *
 * Management writes run with the service-role (admin) client, which bypasses
 * RLS entirely. That makes this function the real access boundary: it must
 * establish who the caller is, that they may use the Manager Console, and
 * that any venue/staff id they name is theirs — before a route touches the
 * admin client. See docs/handoff/security/2026-09-30-audit-remediation-todo.md
 * (Phase 2) and the audit's C1–C3 findings.
 *
 * The access rule mirrors app/management/dashboard/page.tsx's page gate so the
 * API never admits someone the page would redirect, or vice versa:
 *   admin email OR non-lapsed B2B tier OR manager platform_role OR active trial.
 * `ownerOnly` mirrors the page's isOwnerLevel (Billing/Settings): owner-level
 * platform_role or admin email — duty managers are excluded.
 */

import type { User } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getUserFromRequest } from "@/lib/supabase-server";
import {
  hasManagerConsoleAccess,
  isB2BTier,
  isMultiVenueTier,
  isOwnerLevelRole,
  normalizeTier,
  tierSeatLimit,
  validateSession,
  type Tier,
} from "@/lib/session";
import { getTrialStatus } from "@/lib/trial";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getCookieValue } from "@/lib/training-attempt";

export type AdminClient = ReturnType<typeof createSupabaseAdminClient>;

const LAPSED_SUBSCRIPTION_STATUSES = new Set(["canceled", "incomplete_expired", "unpaid"]);

/** Thrown by the ownership assertions; routes turn it into a JSON response. */
export class ManagementAccessError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ManagementAccessError";
  }
}

type ManagerProfile = {
  platformRole: string;
  tier: string;
  orgId: string | null;
};

export type ManagerEntitlement = {
  /** Paid B2B tier, else active trial tier; null when neither applies. */
  tier: Tier | null;
  seatLimit: number;
  /** Infinity for multi-venue tiers and admins. */
  venueLimit: number;
};

type ManagerContext = {
  user: User;
  admin: AdminClient;
  profile: ManagerProfile;
  isOwnerLevel: boolean;
  entitlement: ManagerEntitlement;
  /** Throws 404 unless `venueId` is a venue this caller owns. */
  assertOwnsVenue: (venueId: string) => Promise<void>;
  /** Throws 404 unless `staffId` is a venue_staff row this caller manages. */
  assertOwnsStaff: (staffId: string) => Promise<void>;
};

export type RequireManagerOptions = {
  /** Owner-level only (Billing/Settings/venue setup) — excludes duty managers. */
  ownerOnly?: boolean;
  /** Rate-limit bucket name, e.g. "mgmt-staff". */
  rateKey: string;
  /** Requests per minute per user (IP gets 3× this). Default 30. */
  limit?: number;
};

export type RequireManagerResult =
  | { ok: true; ctx: ManagerContext }
  | { ok: false; response: Response };

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function deny(status: number, code: string, error: string, log?: Record<string, unknown>): { ok: false; response: Response } {
  if (log) console.warn(JSON.stringify({ event: "management_access_denied", code, ...log }));
  return { ok: false, response: Response.json({ error, code }, { status }) };
}

export async function requireManager(req: Request, opts: RequireManagerOptions): Promise<RequireManagerResult> {
  // 1. Identity. getUserFromRequest validates the JWT with Supabase Auth
  //    (auth.getUser), never by decoding it locally or trusting getSession().
  const { user } = await getUserFromRequest(req);
  if (!user) return deny(401, "UNAUTHORIZED", "Unauthorized");

  // 2. Rate limit before any DB work.
  const ip = getClientIp(req);
  const limit = opts.limit ?? 30;
  if (!rateLimit(`${opts.rateKey}:user:${user.id}`, limit) || !rateLimit(`${opts.rateKey}:ip:${ip}`, limit * 3)) {
    return deny(429, "RATE_LIMITED", "Too many requests. Try again in a minute.", { reason: "rate_limited", userId: user.id, ip, rateKey: opts.rateKey });
  }

  const admin = createSupabaseAdminClient();

  // 3. One-device session. Same semantics as middleware.ts: a present cookie
  //    that doesn't match the stored session is a conflict; a missing cookie
  //    is allowed (not every login path stamps one).
  const browserSessionId = getCookieValue(req, "sbe_session_id");
  if (browserSessionId) {
    const session = await validateSession(admin, user.id, browserSessionId);
    if (!session.valid) {
      return deny(409, "SESSION_CONFLICT", "Session conflict detected. Please resume this device.");
    }
  }

  // 4. Role / tier / trial, read from the DB with the admin client — never
  //    from the request.
  const { data: profileRow } = await admin
    .from("profiles")
    .select("tier, platform_role, subscription_status, org_id")
    .eq("id", user.id)
    .maybeSingle();

  const platformRole = (profileRow?.platform_role as string | null) ?? "staff";
  const tier = (profileRow?.tier as string | null) ?? "free";
  const orgId = (profileRow?.org_id as string | null) ?? null;

  const isAdmin = adminEmails().includes((user.email ?? "").toLowerCase());
  const subscriptionLapsed = LAPSED_SUBSCRIPTION_STATUSES.has((profileRow?.subscription_status as string | null) ?? "");
  const hasVenueAccess = isB2BTier(tier) && !subscriptionLapsed;
  const hasManagerRole = hasManagerConsoleAccess(platformRole);
  const isOwnerLevel = isOwnerLevelRole(platformRole) || isAdmin;

  let hasTrialAccess = false;
  let trialTier: string | null = null;
  if (!isAdmin && !hasVenueAccess && orgId) {
    const { data: org } = await admin
      .from("organizations")
      .select("trial_tier, trial_ends_at, trial_converted")
      .eq("id", orgId)
      .maybeSingle();
    hasTrialAccess = getTrialStatus(org) === "active" && !!org?.trial_tier;
    if (hasTrialAccess) trialTier = org?.trial_tier as string;
  }

  if (!isAdmin && !hasVenueAccess && !hasManagerRole && !hasTrialAccess) {
    return deny(403, "MANAGER_ACCESS_REQUIRED", "Manager Console access is required.", { reason: "not_manager", userId: user.id, rateKey: opts.rateKey });
  }
  if (opts.ownerOnly && !isOwnerLevel) {
    return deny(403, "OWNER_ACCESS_REQUIRED", "Only the venue owner can do this.", { reason: "not_owner", userId: user.id, rateKey: opts.rateKey });
  }

  const assertOwnsVenue = async (venueId: string) => {
    const { data } = await admin
      .from("venues")
      .select("id")
      .eq("id", venueId)
      .eq("owner_user_id", user.id)
      .maybeSingle();
    if (!data) throw new ManagementAccessError(404, "VENUE_NOT_FOUND", "Venue not found.");
  };

  const assertOwnsStaff = async (staffId: string) => {
    const { data } = await admin
      .from("venue_staff")
      .select("id")
      .eq("id", staffId)
      .eq("manager_user_id", user.id)
      .maybeSingle();
    if (!data) throw new ManagementAccessError(404, "STAFF_NOT_FOUND", "Staff member not found.");
  };

  return {
    ok: true,
    ctx: {
      user,
      admin,
      profile: { platformRole, tier, orgId },
      isOwnerLevel,
      entitlement: resolveEntitlement(isAdmin, hasVenueAccess ? tier : trialTier),
      assertOwnsVenue,
      assertOwnsStaff,
    },
  };
}

// Single-venue tiers (Boutique / legacy venue_single) are one venue by product
// design (pricing page, TrialBillingSection); multi-venue tiers are uncapped.
export function resolveEntitlement(isAdmin: boolean, rawTier: string | null): ManagerEntitlement {
  if (isAdmin) return { tier: "enterprise", seatLimit: tierSeatLimit("enterprise"), venueLimit: Infinity };
  if (!rawTier || !isB2BTier(rawTier)) return { tier: null, seatLimit: 0, venueLimit: 0 };
  const tier = normalizeTier(rawTier);
  return { tier, seatLimit: tierSeatLimit(tier), venueLimit: isMultiVenueTier(tier) ? Infinity : 1 };
}

/**
 * Maps an error thrown inside a management route to a client response.
 * ManagementAccessError keeps its status/message; anything else is logged
 * server-side and returned as a generic message (raw PostgREST errors used
 * to reach the browser — audit L5).
 */
export function managementErrorResponse(error: unknown, fallbackMessage: string, route: string, fallbackStatus = 400): Response {
  if (error instanceof ManagementAccessError) {
    return Response.json({ error: error.message, code: error.code }, { status: error.status });
  }
  console.error(`[${route}]`, error);
  return Response.json({ error: fallbackMessage }, { status: fallbackStatus });
}
