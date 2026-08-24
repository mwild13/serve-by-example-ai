import { redirect } from "next/navigation";
import Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { normalizeTier, resolveTierAccess } from "@/lib/session";
import DashboardShell from "@/app/dashboard/_components/DashboardShell";

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
        // Checkout metadata carries the canonical tier directly (see
        // app/api/billing/checkout/route.ts) — same source the webhook reads,
        // so this immediate sync can never drift from the async webhook path.
        const tier = stripeSession.metadata?.tier;
        if (tier) {
          const checkoutAdmin = createSupabaseAdminClient();
          await checkoutAdmin.from("profiles").update({
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

  // Tier resolution (own tier → lapsed-subscription downgrade → org trial
  // sync → sponsored venue-membership fallback) lives in resolveTierAccess()
  // so this chain can't drift from the one app/mobile/layout.tsx runs — see
  // v4-migration-plan/01-supabase-client-and-auth.md.
  const admin = createSupabaseAdminClient();
  const { plan, hasVenueMembership, venueMembershipPaused, managementUnlocked } =
    await resolveTierAccess(admin, user.email ?? undefined, {
      tier: profile?.tier ?? null,
      org_id: profile?.org_id ?? null,
      subscription_status: profile?.subscription_status ?? null,
      management_unlocked: profile?.management_unlocked ?? null,
    });

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