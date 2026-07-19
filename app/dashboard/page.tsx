import { redirect } from "next/navigation";
import Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getTrialStatus } from "@/lib/trial";
import DashboardShell from "@/app/dashboard/_components/DashboardShell";

const PRICE_TO_PLAN: Record<string, string> = {
  [process.env.STRIPE_PRICE_PRO ?? ""]: "pro",
  [process.env.STRIPE_PRICE_PRO_YEARLY ?? ""]: "pro",
  [process.env.STRIPE_PRICE_SINGLE_VENUE ?? ""]: "single-venue",
  [process.env.STRIPE_PRICE_SINGLE_VENUE_YEARLY ?? ""]: "single-venue",
  [process.env.STRIPE_PRICE_MULTI_VENUE ?? ""]: "multi-venue",
  [process.env.STRIPE_PRICE_MULTI_VENUE_YEARLY ?? ""]: "multi-venue",
};

const PLAN_TO_TIER: Record<string, string> = {
  pro: "pro",
  "single-venue": "venue_single",
  "multi-venue": "venue_multi",
};

// Prevent static generation – this page requires auth at runtime
export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string; nav?: string; session_id?: string }>;
}) {
  const params = await searchParams;
  const checkoutSuccess = params.checkout === "success";
  const stripeSessionId = params.session_id;
  const initialNav = params.nav;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // When landing from a successful payment, verify with Stripe and update the
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

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, tier, org_id, stripe_customer_id, management_unlocked, notif_reminders, notif_weekly_digest, notif_achievement_alerts, subscription_status, onboarding_completed")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarding_completed) {
    redirect(
      stripeSessionId
        ? `/onboarding?checkout=success&session_id=${stripeSessionId}`
        : "/onboarding"
    );
  }

  const displayName =
    profile?.display_name ||
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    user.email?.split("@")[0] ||
    "there";

  let plan = profile?.tier ?? "free";

  // Subscription gate: only revoke when the webhook has explicitly written a terminal status.
  // null means subscription_status has never been written — trust tier in that case.
  const LAPSED_STATUSES = new Set(["canceled", "incomplete_expired", "unpaid"]);
  if (plan !== "free" && LAPSED_STATUSES.has(profile?.subscription_status ?? "")) {
    plan = "free";
  }

  // Trial gate: runs for any user without an active Stripe subscription (null = trial/new).
  // Syncs plan to the live org trial state so:
  //   - active trial  → plan = trial_tier  (elevates free users; corrects manual DB edits)
  //   - expired trial → plan = "free"      (locks out after trial ends)
  // Skipped for paying subscribers — their tier is authoritative.
  const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing", "past_due"]);
  if (!ACTIVE_SUBSCRIPTION_STATUSES.has(profile?.subscription_status ?? "") && profile?.org_id) {
    const adminForTrial = createSupabaseAdminClient();
    const { data: org } = await adminForTrial
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

  // Check if user has an active venue membership (invited by a manager).
  // These users get full training access even on the free plan tier.
  // Use admin client to bypass RLS – the filter is scoped to this user's email.
  let hasVenueMembership = false;
  let venueMembershipPaused = false;
  if (plan === "free" && user.email) {
    const admin = createSupabaseAdminClient();
    const { data: membership } = await admin
      .from("organization_members")
      .select("id, manager_id")
      .eq("staff_email", user.email.toLowerCase())
      .in("status", ["invited", "active"])
      .limit(1)
      .maybeSingle();
    hasVenueMembership = !!membership;

    // If sponsored, check whether the manager's org trial has expired.
    // An expired trial means training is paused for all staff on that org.
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

  // Sponsored venue staff (free plan + venue membership) must never see management content,
  // even if management_unlocked was previously set in their profile.
  const managementUnlocked = hasVenueMembership && plan === "free"
    ? false
    : (profile?.management_unlocked ?? false);

  return (
    <DashboardShell
      displayName={displayName}
      plan={plan}
      checkoutSuccess={checkoutSuccess}
      userEmail={user.email ?? ""}
      managementUnlockedInitial={managementUnlocked}
      notifReminders={profile?.notif_reminders ?? true}
      notifWeeklyDigest={profile?.notif_weekly_digest ?? true}
      notifAchievementAlerts={profile?.notif_achievement_alerts ?? true}
      hasVenueMembership={hasVenueMembership}
      venueMembershipPaused={venueMembershipPaused}
      initialToken={session?.access_token ?? ""}
      initialNav={initialNav}
    />
  );
}