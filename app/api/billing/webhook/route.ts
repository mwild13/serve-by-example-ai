import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { B2B_TIERS, TIER_SEAT_LIMITS, priceToTierMap } from "@/lib/billing-plans";
import {
  applySubscription,
  assertWritten,
  downgradeByCustomer,
  orgNameFromEmail,
  upsertOrganization,
} from "@/lib/billing-sync";
import { reportError } from "@/lib/report-error";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-02-25.clover",
    httpClient: Stripe.createFetchHttpClient(),
  });

  const PRICE_TO_TIER = priceToTierMap();

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
      await applySubscription(supabase, event.data.object as Stripe.Subscription, PRICE_TO_TIER);
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
    await reportError(err, { route: "/api/billing/webhook", url: req.url });
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
  const stripeCustomerId = session.customer as string;
  const customerEmail = session.customer_details?.email ?? undefined;

  // New checkout embeds tier directly in metadata; legacy products fall back to price map
  const tier = session.metadata?.tier ?? (priceId ? PRICE_TO_TIER[priceId] : undefined);
  if (!tier) return;

  const seatLimit = session.metadata?.seat_limit
    ? parseInt(session.metadata.seat_limit, 10)
    : (TIER_SEAT_LIMITS[tier] ?? 0);

  const profileUpdate: Record<string, unknown> = {
    tier,
    stripe_customer_id: stripeCustomerId,
  };

  // The subscription's own events usually arrive before this one, while no
  // profile carries the Stripe customer id yet, so their update matches no
  // row and the renewal date was never stored. Read it here, where the
  // account is known.
  if (typeof session.subscription === "string") {
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    if (subscription.status === "active" || subscription.status === "trialing") {
      const rawPeriodEnd = subscription.items.data[0]?.current_period_end;
      profileUpdate.subscription_status = subscription.status;
      profileUpdate.subscription_period_end = rawPeriodEnd ? new Date(rawPeriodEnd * 1000).toISOString() : null;
    }
  }

  // Checkout needs a signed-in account (app/api/billing/checkout/route.ts),
  // so every session carries the buyer's id. One without it was not started
  // by this site, for example a payment link made in the Stripe dashboard.
  // It is logged, not guessed at by email.
  if (!userId) {
    console.error(`Webhook: checkout session ${session.id} has no userId in its metadata; no plan was applied.`);
    return;
  }
  const resolvedUserId = userId;

  assertWritten(await supabase.from("profiles").update(profileUpdate).eq("id", resolvedUserId), "profiles update");

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

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabase: ReturnType<typeof createSupabaseAdminClient>,
) {
  const customerId = subscription.customer as string;
  if (!customerId) return;
  await downgradeByCustomer(customerId, supabase);
}

async function handleInvoicePaid(
  invoice: Stripe.Invoice,
  supabase: ReturnType<typeof createSupabaseAdminClient>,
) {
  const customerId = invoice.customer as string;
  if (!customerId) return;
  // Re-confirm active status on successful renewal. The accompanying
  // customer.subscription.updated event updates subscription_period_end.
  assertWritten(await supabase
    .from("profiles")
    .update({ subscription_status: "active" })
    .eq("stripe_customer_id", customerId), "profiles update");
}

async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice,
  supabase: ReturnType<typeof createSupabaseAdminClient>,
) {
  const customerId = invoice.customer as string;
  if (!customerId) return;
  // Record past_due without revoking access. Stripe retries automatically;
  // customer.subscription.deleted fires only when all retries are exhausted.
  assertWritten(await supabase
    .from("profiles")
    .update({ subscription_status: "past_due" })
    .eq("stripe_customer_id", customerId), "profiles update");
}
