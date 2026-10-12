// Writes a Stripe subscription's state onto the account: the profile's tier
// and status, and for a venue plan the organisation that holds its seats.
//
// Used by the webhook (app/api/billing/webhook/route.ts) and by the Manager
// Console when a member returns from an upgrade in the billing portal, so the
// new plan shows without waiting for the webhook.

import type Stripe from "stripe";
import type { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { B2B_TIERS, planForSubscription } from "@/lib/billing-plans";

type AdminClient = ReturnType<typeof createSupabaseAdminClient>;

// supabase-js returns a write error instead of throwing it. Unchecked, a
// failed update still answered Stripe with 200, Stripe never retried, and a
// paying customer stayed on the free tier. Throwing here reaches the catch in
// the webhook's POST, which answers 500 so Stripe delivers the event again.
export function assertWritten(result: { error: { message: string } | null }, what: string): void {
  if (result.error) throw new Error(`${what} failed: ${result.error.message}`);
}

export function orgNameFromEmail(email: string): string {
  const domain = email.split("@")[1] ?? "";
  return domain || "My Organisation";
}

export async function applySubscription(
  supabase: AdminClient,
  subscription: Stripe.Subscription,
  priceToTier: Record<string, string>,
) {
  const customerId = subscription.customer as string;
  if (!customerId) return;

  // past_due: keep access alive while Stripe retries payment automatically.
  // Stripe fires customer.subscription.deleted if all retries are exhausted —
  // that's when downgradeByCustomer runs. Do not downgrade here.
  if (subscription.status === "past_due") {
    assertWritten(await supabase
      .from("profiles")
      .update({ subscription_status: "past_due" })
      .eq("stripe_customer_id", customerId), "profiles update");
    return;
  }

  const HARD_REVOKE_STATUSES = ["canceled", "unpaid", "incomplete_expired"];
  if (HARD_REVOKE_STATUSES.includes(subscription.status)) {
    await downgradeByCustomer(customerId, supabase);
    return;
  }

  // active or trialing
  const plan = planForSubscription(subscription.items.data[0]?.price.id, subscription.metadata, priceToTier);
  if (!plan) return;
  const { tier, seatLimit } = plan;

  const rawPeriodEnd = subscription.items.data[0]?.current_period_end;
  const periodEnd = rawPeriodEnd ? new Date(rawPeriodEnd * 1000).toISOString() : null;

  assertWritten(await supabase
    .from("profiles")
    .update({
      tier,
      subscription_status: subscription.status,
      subscription_period_end: periodEnd,
    })
    .eq("stripe_customer_id", customerId), "profiles update");

  if (!B2B_TIERS.has(tier)) {
    // A venue subscription moved down to a personal plan: its organisation
    // keeps no seats. No row matches for an account that never had one.
    assertWritten(await supabase
      .from("organizations")
      .update({ subscription_tier: "free", seat_limit: 0, updated_at: new Date().toISOString() })
      .eq("stripe_customer_id", customerId), "organizations update");
    return;
  }

  // The account that pays for this subscription. None is found for a brand
  // new checkout, whose subscription events arrive before the profile carries
  // the customer id; checkout.session.completed sets the organisation up then.
  const { data: owners } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .limit(1);
  const ownerUserId = owners?.[0]?.id as string | undefined;

  if (ownerUserId) {
    // Creates the organisation when a personal plan has just become a venue
    // plan, and updates it otherwise.
    const { data: owner } = await supabase.auth.admin.getUserById(ownerUserId);
    const email = owner?.user?.email;
    await upsertOrganization(supabase, {
      stripeCustomerId: customerId,
      ownerUserId,
      name: email ? orgNameFromEmail(email) : "My Organisation",
      tier,
      seatLimit,
    });
    return;
  }

  assertWritten(await supabase
    .from("organizations")
    .update({
      subscription_tier: tier,
      seat_limit: seatLimit,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", customerId), "organizations update");
}

export async function downgradeByCustomer(
  customerId: string,
  supabase: AdminClient,
) {
  assertWritten(await supabase
    .from("profiles")
    .update({
      tier: "free",
      subscription_status: "canceled",
    })
    .eq("stripe_customer_id", customerId), "profiles update");

  // B2B orgs: revoke access and zero out seats; row is kept for audit trail
  assertWritten(await supabase
    .from("organizations")
    .update({
      subscription_tier: "free",
      seat_limit: 0,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", customerId), "organizations update");
}

export async function upsertOrganization(
  supabase: AdminClient,
  opts: {
    stripeCustomerId: string;
    ownerUserId: string;
    name: string;
    tier: string;
    seatLimit: number;
  },
) {
  // Check for existing org by stripe_customer_id first (returning subscriber / upgrade)
  const { data: existing } = await supabase
    .from("organizations")
    .select("id")
    .eq("stripe_customer_id", opts.stripeCustomerId)
    .maybeSingle();

  if (existing) {
    assertWritten(await supabase
      .from("organizations")
      .update({
        subscription_tier: opts.tier,
        seat_limit: opts.seatLimit,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id), "organizations update");
    // Ensure profile is linked (may have been cleared on a prior downgrade)
    assertWritten(await supabase.from("profiles").update({ org_id: existing.id }).eq("id", opts.ownerUserId), "profiles update");
    return;
  }

  // Fall back to owner lookup — handles trial → paid conversion where the trial org
  // was created without a Stripe customer ID. Attaches the Stripe customer ID and
  // marks the trial as converted in a single update.
  const { data: profileData } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", opts.ownerUserId)
    .single();

  // Only an organisation this account owns. A profile linked to someone
  // else's organisation must not attach its own subscription to it.
  const { data: ownedOrg } = profileData?.org_id
    ? await supabase
        .from("organizations")
        .select("id")
        .eq("id", profileData.org_id)
        .eq("owner_user_id", opts.ownerUserId)
        .maybeSingle()
    : { data: null };

  if (ownedOrg) {
    assertWritten(await supabase
      .from("organizations")
      .update({
        stripe_customer_id: opts.stripeCustomerId,
        subscription_tier: opts.tier,
        seat_limit: opts.seatLimit,
        trial_converted: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", ownedOrg.id), "organizations update");
    // Profile link already correct — no update needed
    return;
  }

  // No existing org — insert and link to profile
  const { data: newOrg, error: newOrgError } = await supabase
    .from("organizations")
    .insert({
      name: opts.name,
      stripe_customer_id: opts.stripeCustomerId,
      subscription_tier: opts.tier,
      seat_limit: opts.seatLimit,
      owner_user_id: opts.ownerUserId,
    })
    .select("id")
    .single();

  if (newOrgError) throw new Error(`organizations insert failed: ${newOrgError.message}`);

  if (newOrg?.id) {
    assertWritten(await supabase.from("profiles").update({ org_id: newOrg.id }).eq("id", opts.ownerUserId), "profiles update");
  }
}
