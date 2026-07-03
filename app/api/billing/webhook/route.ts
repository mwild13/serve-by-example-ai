import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const B2B_TIERS = new Set(["boutique", "commercial", "enterprise"]);

// Default seat limits for new purchases — B2B checkout passes seat_limit in metadata too
const TIER_SEAT_LIMITS: Record<string, number> = {
  boutique: 15,
  commercial: 35,
  enterprise: 9999,
};

function orgNameFromEmail(email: string): string {
  const domain = email.split("@")[1] ?? "";
  return domain || "My Organisation";
}

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-02-25.clover",
    httpClient: Stripe.createFetchHttpClient(),
  });

  // Map Stripe Price IDs → plan/tier names.
  // New price IDs (boutique/commercial/enterprise) alongside legacy IDs for backward compat.
  const PRICE_TO_TIER: Record<string, string> = {
    [process.env.STRIPE_PRICE_PRO!]: "pro",
    [process.env.STRIPE_PRICE_PRO_YEARLY!]: "pro",
    [process.env.STRIPE_PRICE_SINGLE_VENUE!]: "boutique",
    [process.env.STRIPE_PRICE_SINGLE_VENUE_YEARLY!]: "boutique",
    [process.env.STRIPE_PRICE_MULTI_VENUE!]: "commercial",
    [process.env.STRIPE_PRICE_MULTI_VENUE_YEARLY!]: "commercial",
    [process.env.STRIPE_PRICE_BOUTIQUE!]: "boutique",
    [process.env.STRIPE_PRICE_BOUTIQUE_YEARLY!]: "boutique",
    [process.env.STRIPE_PRICE_COMMERCIAL!]: "commercial",
    [process.env.STRIPE_PRICE_COMMERCIAL_YEARLY!]: "commercial",
    [process.env.STRIPE_PRICE_ENTERPRISE!]: "enterprise",
  };

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Webhook signature verification failed." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  // Idempotency guard with transaction isolation: insert into billing_events with unique
  // constraint on stripe_event_id. If duplicate, return 200 immediately without processing.
  // Postgres UNIQUE constraint is atomic, preventing race condition on concurrent retries.
  const { error: idempotencyError } = await supabase
    .from("billing_events")
    .insert({ stripe_event_id: event.id, event_type: event.type });

  if (idempotencyError) {
    if (idempotencyError.code === "23505") {
      // Already processed — return 200 without re-running handlers
      console.log(`[IDEMPOTENT] Stripe event ${event.id} already in billing_events`);
      return NextResponse.json({ received: true });
    }
    console.error("Webhook: billing_events insert failed:", idempotencyError.message);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      await handleCheckoutComplete(
        event.data.object as Stripe.Checkout.Session,
        stripe,
        supabase,
        PRICE_TO_TIER,
      );
    }

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated"
    ) {
      await handleSubscriptionUpsert(
        event.data.object as Stripe.Subscription,
        supabase,
        PRICE_TO_TIER,
      );
    }

    if (event.type === "customer.subscription.deleted") {
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabase);
    }

    if (event.type === "invoice.paid") {
      await handleInvoicePaid(event.data.object as Stripe.Invoice, supabase);
    }

    if (event.type === "invoice.payment_failed") {
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice, supabase);
    }
  } catch (err) {
    // Remove the billing_events row so Stripe can safely retry
    await supabase.from("billing_events").delete().eq("stripe_event_id", event.id);
    console.error(`Webhook: handler threw for ${event.type}:`, err);
    return NextResponse.json({ error: "Processing failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// ── Event handlers ────────────────────────────────────────────

async function handleCheckoutComplete(
  session: Stripe.Checkout.Session,
  stripe: Stripe,
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  PRICE_TO_TIER: Record<string, string>,
) {
  const userId = session.metadata?.userId;
  const priceId = session.metadata?.priceId;
  const isFounder = session.metadata?.is_founder_purchase === "true";
  const stripeCustomerId = session.customer as string;
  const customerEmail = session.customer_details?.email ?? undefined;

  // New checkout embeds tier directly in metadata; legacy products fall back to price map
  const tier = session.metadata?.tier ?? (priceId ? PRICE_TO_TIER[priceId] : undefined);
  if (!tier) return;

  const seatLimit = session.metadata?.seat_limit
    ? parseInt(session.metadata.seat_limit, 10)
    : (TIER_SEAT_LIMITS[tier] ?? 0);

  const profileUpdate: Record<string, unknown> = {
    plan: tier,
    tier,
    stripe_customer_id: stripeCustomerId,
    subscription_active: true,
    ...(isFounder && { is_founders_user: true }),
  };

  // Resolve user ID — prefer the explicit userId from metadata (logged-in checkout),
  // then fall back to email lookup (guest checkout)
  let resolvedUserId: string | undefined = userId;

  if (!resolvedUserId && customerEmail) {
    const { data: authRows } = await supabase
      .schema("auth")
      .from("users")
      .select("id")
      .ilike("email", customerEmail)
      .limit(1);
    resolvedUserId = (authRows?.[0] as { id: string } | undefined)?.id;

    if (!resolvedUserId) {
      // No account — invite user and create profile so they can set a password
      const { data: invite, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
        customerEmail,
        { data: { is_founders_user: isFounder } },
      );
      if (!inviteError && invite?.user) {
        resolvedUserId = invite.user.id;
        await supabase.from("profiles").upsert({ id: resolvedUserId, ...profileUpdate });
      } else {
        console.error("Webhook: failed to invite new user:", inviteError?.message);
        await stripe.customers.update(stripeCustomerId, { metadata: { pending_plan: tier } });
        return;
      }
    }
  }

  if (!resolvedUserId) return;

  await supabase.from("profiles").update(profileUpdate).eq("id", resolvedUserId);

  if (B2B_TIERS.has(tier)) {
    await upsertOrganization(supabase, {
      stripeCustomerId,
      ownerUserId: resolvedUserId,
      name: customerEmail ? orgNameFromEmail(customerEmail) : "My Organisation",
      tier,
      seatLimit,
    });
  }
}

async function handleSubscriptionUpsert(
  subscription: Stripe.Subscription,
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  PRICE_TO_TIER: Record<string, string>,
) {
  const customerId = subscription.customer as string;
  if (!customerId) return;

  // past_due: keep access alive while Stripe retries payment automatically.
  // Stripe fires customer.subscription.deleted if all retries are exhausted —
  // that's when downgradeByCustomer runs. Do not downgrade here.
  if (subscription.status === "past_due") {
    await supabase
      .from("profiles")
      .update({ subscription_status: "past_due" })
      .eq("stripe_customer_id", customerId);
    return;
  }

  const HARD_REVOKE_STATUSES = ["canceled", "unpaid", "incomplete_expired"];
  if (HARD_REVOKE_STATUSES.includes(subscription.status)) {
    await downgradeByCustomer(customerId, supabase);
    return;
  }

  // active or trialing
  const priceId = subscription.items.data[0]?.price.id;
  // Prefer metadata (set by new checkout); fall back to price map for legacy products
  const tier =
    subscription.metadata?.tier ?? (priceId ? PRICE_TO_TIER[priceId] : undefined);

  if (!tier) return;

  const seatLimit = subscription.metadata?.seat_limit
    ? parseInt(subscription.metadata.seat_limit, 10)
    : (TIER_SEAT_LIMITS[tier] ?? 0);

  const rawPeriodEnd = subscription.items.data[0]?.current_period_end;
  const periodEnd = rawPeriodEnd ? new Date(rawPeriodEnd * 1000).toISOString() : null;

  await supabase
    .from("profiles")
    .update({
      plan: tier,
      tier,
      subscription_active: true,
      subscription_status: subscription.status,
      subscription_period_end: periodEnd,
    })
    .eq("stripe_customer_id", customerId);

  if (B2B_TIERS.has(tier)) {
    await supabase
      .from("organizations")
      .update({
        subscription_tier: tier,
        seat_limit: seatLimit,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_customer_id", customerId);
  }
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabase: ReturnType<typeof createSupabaseAdminClient>,
) {
  const customerId = subscription.customer as string;
  if (!customerId) return;
  await downgradeByCustomer(customerId, supabase);
}

// ── Shared helpers ────────────────────────────────────────────

async function downgradeByCustomer(
  customerId: string,
  supabase: ReturnType<typeof createSupabaseAdminClient>,
) {
  await supabase
    .from("profiles")
    .update({
      plan: "free",
      tier: "free",
      subscription_active: false,
      subscription_status: "canceled",
    })
    .eq("stripe_customer_id", customerId);

  // B2B orgs: revoke access and zero out seats; row is kept for audit trail
  await supabase
    .from("organizations")
    .update({
      subscription_tier: "free",
      seat_limit: 0,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", customerId);
}

async function handleInvoicePaid(
  invoice: Stripe.Invoice,
  supabase: ReturnType<typeof createSupabaseAdminClient>,
) {
  const customerId = invoice.customer as string;
  if (!customerId) return;
  // Re-confirm active status on successful renewal. The accompanying
  // customer.subscription.updated event updates subscription_period_end.
  await supabase
    .from("profiles")
    .update({ subscription_active: true, subscription_status: "active" })
    .eq("stripe_customer_id", customerId);
}

async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice,
  supabase: ReturnType<typeof createSupabaseAdminClient>,
) {
  const customerId = invoice.customer as string;
  if (!customerId) return;
  // Record past_due without revoking access. Stripe retries automatically;
  // customer.subscription.deleted fires only when all retries are exhausted.
  await supabase
    .from("profiles")
    .update({ subscription_status: "past_due" })
    .eq("stripe_customer_id", customerId);
}

async function upsertOrganization(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  opts: {
    stripeCustomerId: string;
    ownerUserId: string;
    name: string;
    tier: string;
    seatLimit: number;
  },
) {
  // Check for existing org by stripe_customer_id first (returning subscriber)
  const { data: existing } = await supabase
    .from("organizations")
    .select("id")
    .eq("stripe_customer_id", opts.stripeCustomerId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("organizations")
      .update({
        subscription_tier: opts.tier,
        seat_limit: opts.seatLimit,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    // Ensure profile is linked (may have been cleared on a prior downgrade)
    await supabase.from("profiles").update({ org_id: existing.id }).eq("id", opts.ownerUserId);
    return;
  }

  // New org — insert and link to profile
  const { data: newOrg } = await supabase
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

  if (newOrg?.id) {
    await supabase.from("profiles").update({ org_id: newOrg.id }).eq("id", opts.ownerUserId);
  }
}
