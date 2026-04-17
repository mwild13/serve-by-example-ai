import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
  httpClient: Stripe.createFetchHttpClient(),
});

// Map Stripe Price IDs back to plan names
const PRICE_TO_PLAN: Record<string, string> = {
  [process.env.STRIPE_PRICE_PRO!]: "pro",
  [process.env.STRIPE_PRICE_SINGLE_VENUE!]: "single-venue",
  [process.env.STRIPE_PRICE_MULTI_VENUE!]: "multi-venue",
};

// Map plan names → normalised tier column values
const PLAN_TO_TIER: Record<string, string> = {
  pro: "pro",
  "single-venue": "venue_single",
  "multi-venue": "venue_multi",
};

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Webhook signature verification failed." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const priceId = session.metadata?.priceId;
    const isFounder = session.metadata?.is_founder_purchase === "true";
    const plan = priceId ? PRICE_TO_PLAN[priceId] : undefined;
    const stripeCustomerId = session.customer as string;
    const customerEmail = session.customer_details?.email;

    if (plan) {
      const tier = PLAN_TO_TIER[plan] ?? "free";
      const profileUpdate: Record<string, unknown> = {
        plan,
        tier,
        stripe_customer_id: stripeCustomerId,
        ...(isFounder && { is_founders_user: true }),
      };

      if (userId) {
        // Logged-in user: directly update by user ID
        await supabase.from("profiles").update(profileUpdate).eq("id", userId);
      } else if (customerEmail) {
        // Guest checkout: find existing Supabase user by email
        const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 });
        const matched = users.find((u) => u.email === customerEmail);

        if (matched) {
          await supabase.from("profiles").update(profileUpdate).eq("id", matched.id);
        } else {
          // No account yet — create one and send a "Set your password" invite email
          const { data: invite, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
            customerEmail,
            { data: { is_founders_user: isFounder } }
          );

          if (!inviteError && invite?.user) {
            await supabase.from("profiles").upsert({
              id: invite.user.id,
              ...profileUpdate,
            });
          } else {
            console.error("Webhook: failed to invite new user:", inviteError?.message);
            // Fall back to tagging the Stripe customer so sign-up flow can pick it up
            await stripe.customers.update(stripeCustomerId, {
              metadata: { pending_plan: plan },
            });
          }
        }
      }
    }
  }

  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    const priceId = subscription.items.data[0]?.price.id;
    const plan = PRICE_TO_PLAN[priceId ?? ""];
    const customerId = subscription.customer as string;

    if (plan && customerId) {
      const tier = PLAN_TO_TIER[plan] ?? "free";
      await supabase
        .from("profiles")
        .update({ plan, tier })
        .eq("stripe_customer_id", customerId);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    if (customerId) {
      await supabase
        .from("profiles")
        .update({ plan: "free", tier: "free" })
        .eq("stripe_customer_id", customerId);
    }
  }

  return NextResponse.json({ received: true });
}
