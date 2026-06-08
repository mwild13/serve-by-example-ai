import { redirect } from "next/navigation";
import Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import DashboardShell from "@/components/DashboardShell";

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
            plan,
            tier: PLAN_TO_TIER[plan] ?? "free",
            stripe_customer_id: stripeSession.customer as string,
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
    .select("display_name, plan, stripe_customer_id, management_unlocked, notif_reminders, notif_weekly_digest, notif_achievement_alerts")
    .eq("id", user.id)
    .single();

  const displayName =
    profile?.display_name ||
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    user.email?.split("@")[0] ||
    "there";

  let plan = profile?.plan ?? "free";

  // For paid users, verify the Stripe subscription is still active on every load.
  // This self-heals when the cancellation webhook wasn't received.
  if (plan !== "free" && profile?.stripe_customer_id && process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2026-02-25.clover",
        httpClient: Stripe.createFetchHttpClient(),
      });
      const subscriptions = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id as string,
        limit: 5,
      });
      const hasActive = subscriptions.data.some(
        (s) => s.status === "active" || s.status === "trialing"
      );
      if (!hasActive) {
        const admin = createSupabaseAdminClient();
        await admin.from("profiles").update({ plan: "free", tier: "free" }).eq("id", user.id);
        plan = "free";
      }
    } catch {
      // Stripe unreachable — preserve current plan to avoid incorrectly revoking access
    }
  }

  // Check if user has an active venue membership (invited by a manager).
  // These users get full training access even on the free plan tier.
  // Use admin client to bypass RLS – the filter is scoped to this user's email.
  let hasVenueMembership = false;
  if (plan === "free" && user.email) {
    const admin = createSupabaseAdminClient();
    const { data: membership } = await admin
      .from("venue_memberships")
      .select("id")
      .eq("staff_email", user.email.toLowerCase())
      .in("status", ["invited", "active"])
      .limit(1)
      .maybeSingle();
    hasVenueMembership = !!membership;
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
      initialToken={session?.access_token ?? ""}
      initialNav={initialNav}
    />
  );
}