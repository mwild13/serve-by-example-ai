import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import Stripe from "stripe";
import ManagerControlCenterLoader from "@/components/mission-control/ManagerControlCenterLoader";
import { MissionControlSkeleton } from "@/components/mission-control/manager-ui";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getManagementSnapshot } from "@/lib/management/service";
import { getTrialStatus, getDaysRemaining } from "@/lib/trial";
import { isB2BTier, normalizeTier, hasManagerConsoleAccess, isOwnerLevelRole } from "@/lib/session";

// This route is force-dynamic and reads searchParams (see below), which
// means Next.js re-runs this Server Component on every navigation that
// changes the URL — including the in-app tab switcher (?tab=...), which is
// a pure client-side UI concept with nothing to do with server data. Without
// caching, that regenerates a brand-new getManagementSnapshot() promise on
// every single tab click, and per React 19's use() semantics, a promise
// that's still PENDING when ManagerControlCenterLoader renders forces a real
// Suspense re-suspend — which risks discarding ManagerControlCenter's entire
// local state (selectedVenueId, selectedStaffId, filters, etc.), reported as
// the venue-name-in-topbar-goes-stale-on-navigation bug.
//
// Short TTL, module-scoped (required — unstable_cache only caches across
// requests when defined outside the request handler) so repeat calls within
// a session resolve synchronously fast, meaning use() has nothing left to
// suspend on after the first hit. Safe to cache: mutations never depend on
// this path staying fresh — every mutation route returns an updated
// snapshot that ManagerControlCenter applies directly to its own state
// (see applySnapshotResult in ManagerControlCenter.tsx), completely
// bypassing this server-side fetch. Staleness here only affects what a
// fresh page load sees, never "did my change save."
//
// Uses the admin client rather than the request-scoped RLS client, since
// getManagementSnapshot's own queries already scope explicitly by
// owner_user_id/venue ownership (not relying on RLS to do it) — same
// pattern already used by /api/management/memberships.
const getCachedManagementSnapshot = unstable_cache(
  async (userId: string) => getManagementSnapshot(createSupabaseAdminClient(), userId),
  ["management-snapshot"],
  { revalidate: 20 },
);

// Prevent static generation – this page requires auth at runtime
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mission Control | Serve By Example",
  description: "Manager dashboard for team analytics, compliance tracking, and venue management.",
  robots: { index: false, follow: false },
};

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export default async function ManagementDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string; session_id?: string }>;
}) {
  const params = await searchParams;
  const checkoutSuccess = params.checkout === "success";
  const stripeSessionId = params.session_id;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // When landing from a successful B2B checkout, verify with Stripe and update the
  // profile immediately — don't wait for the webhook which fires asynchronously
  // and may not have updated the DB before this page renders.
  if (checkoutSuccess && stripeSessionId && process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2026-02-25.clover",
        httpClient: Stripe.createFetchHttpClient(),
      });
      const stripeSession = await stripe.checkout.sessions.retrieve(stripeSessionId);

      if (stripeSession.payment_status === "paid") {
        // Checkout metadata carries the canonical tier directly (see
        // app/api/billing/checkout/route.ts) — same source the webhook reads,
        // so this immediate sync can never drift from the async webhook path.
        const tier = stripeSession.metadata?.tier;
        if (tier) {
          const admin = createSupabaseAdminClient();
          await admin.from("profiles").update({
            tier: normalizeTier(tier),
            stripe_customer_id: stripeSession.customer as string,
            subscription_status: "active",
          }).eq("id", user.id);
        }
      }
    } catch {
      // If Stripe verification fails, fall through — webhook is the backup
    }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, tier, platform_role, subscription_status, org_id, trial_grace_modal_shown")
    .eq("id", user.id)
    .single();

  const displayName =
    profile?.display_name || user.email?.split("@")[0] || "Manager";
  const plan = profile?.tier ?? "free";
  const tier = profile?.tier ?? "free";
  const platformRole = profile?.platform_role ?? "staff";

  const isAdmin = ADMIN_EMAILS.includes(user.email ?? "");
  const hasVenuePlan = isB2BTier(plan);
  const hasVenueTier = isB2BTier(tier);
  const hasManagerRole = hasManagerConsoleAccess(platformRole);
  // Duty managers (platformRole === "duty_manager") pass hasManagerRole above
  // — they belong in Mission Control — but must never reach Billing/Settings,
  // which stays owner-level only. See lib/session.ts's isOwnerLevelRole doc.
  const isOwnerLevel = isOwnerLevelRole(platformRole) || isAdmin;

  // A lapsed subscription (webhook wrote a terminal status) revokes venue-based access.
  // null means subscription_status has never been written — treat as not lapsed.
  const LAPSED_STATUSES = new Set(["canceled", "incomplete_expired", "unpaid"]);
  const subscriptionLapsed = LAPSED_STATUSES.has(profile?.subscription_status ?? "");
  const hasVenueAccess = (hasVenuePlan || hasVenueTier) && !subscriptionLapsed;

  // Fetch org trial state — trial managers have platform_role set to venue_manager
  // by the trial start endpoint, but we still fetch trial data to drive the sidebar pill.
  let trialTier: string | null = null;
  let trialEndsAt: string | null = null;
  let daysRemaining = 0;
  let trialExpired = false;
  let showExpiredModal = false;

  const orgId = (profile?.org_id ?? null) as string | null;
  if (orgId) {
    const adminForTrial = createSupabaseAdminClient();
    const { data: org } = await adminForTrial
      .from("organizations")
      .select("trial_tier, trial_ends_at, trial_converted")
      .eq("id", orgId)
      .single();

    const trialStatus = getTrialStatus(org);
    if (trialStatus === "active" && org?.trial_tier && org?.trial_ends_at) {
      trialTier = org.trial_tier as string;
      trialEndsAt = org.trial_ends_at as string;
      daysRemaining = getDaysRemaining(org.trial_ends_at as string);
    } else if (trialStatus === "expired" && org?.trial_tier && org?.trial_ends_at) {
      trialTier = org.trial_tier as string;
      trialEndsAt = org.trial_ends_at as string;
      daysRemaining = 0;
      trialExpired = true;
      showExpiredModal = !(profile?.trial_grace_modal_shown ?? false);
    }
  }

  const hasTrialAccess = !!trialTier && !trialExpired;

  if (!isAdmin && !hasVenueAccess && !hasManagerRole && !hasTrialAccess) {
    redirect("/pricing");
  }

  // Intentionally NOT awaited — starts the query immediately, in parallel
  // with the rest of this render, and streams the result into
  // ManagerControlCenterLoader via Suspense/use() below. Do not add an
  // `await` here: an earlier version of this page did that and it blocked
  // the entire page shell behind this one query (see commit ae46df6,
  // "perf(stage-1): Unblock dashboard render"). Cached (see
  // getCachedManagementSnapshot above) so this resolves near-instantly on
  // every navigation after the first, not just the first page load.
  const snapshotPromise = getCachedManagementSnapshot(user.id);

  return (
    <div className="management-app-root">
      <Suspense fallback={<MissionControlSkeleton />}>
        <ManagerControlCenterLoader
          snapshotPromise={snapshotPromise}
          plan={plan}
          isOwnerLevel={isOwnerLevel}
          displayName={displayName}
          trialTier={trialTier}
          trialEndsAt={trialEndsAt}
          daysRemaining={daysRemaining}
          trialExpired={trialExpired}
          showExpiredModal={showExpiredModal}
        />
      </Suspense>
    </div>
  );
}
