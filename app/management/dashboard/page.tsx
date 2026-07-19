import { redirect } from "next/navigation";
import { Suspense } from "react";
import Stripe from "stripe";
import ManagerControlCenter from "@/components/mission-control/ManagerControlCenter";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getTrialStatus, getDaysRemaining } from "@/lib/trial";

// Prevent static generation – this page requires auth at runtime
export const dynamic = "force-dynamic";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const PRICE_TO_PLAN: Record<string, string> = {
  [process.env.STRIPE_PRICE_SINGLE_VENUE ?? ""]: "single-venue",
  [process.env.STRIPE_PRICE_SINGLE_VENUE_YEARLY ?? ""]: "single-venue",
  [process.env.STRIPE_PRICE_MULTI_VENUE ?? ""]: "multi-venue",
  [process.env.STRIPE_PRICE_MULTI_VENUE_YEARLY ?? ""]: "multi-venue",
};

const PLAN_TO_TIER: Record<string, string> = {
  "single-venue": "venue_single",
  "multi-venue": "venue_multi",
};

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
        const priceId = stripeSession.metadata?.priceId;
        const plan = priceId ? PRICE_TO_PLAN[priceId] : undefined;
        if (plan) {
          const admin = createSupabaseAdminClient();
          await admin.from("profiles").update({
            tier: PLAN_TO_TIER[plan] ?? "free",
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

  const B2B_TIERS = ["boutique", "commercial", "enterprise", "venue_single", "venue_multi", "single-venue", "multi-venue"];

  const isAdmin = ADMIN_EMAILS.includes(user.email ?? "");
  const hasVenuePlan = B2B_TIERS.includes(plan);
  const hasVenueTier = B2B_TIERS.includes(tier);
  const hasManagerRole = platformRole === "venue_manager" || platformRole === "multi_venue_manager" || platformRole === "admin";

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

  return (
    <div className="management-app-root">
      <Suspense fallback={null}>
        <ManagerControlCenter
          plan={plan}
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
