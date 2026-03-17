import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

// Map Stripe Price IDs back to plan names
const PRICE_TO_PLAN: Record<string, string> = {
  [process.env.STRIPE_PRICE_PRO!]: "pro",
  [process.env.STRIPE_PRICE_SINGLE_VENUE!]: "single-venue",
  [process.env.STRIPE_PRICE_MULTI_VENUE!]: "multi-venue",
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
    const plan = priceId ? PRICE_TO_PLAN[priceId] : undefined;
    const stripeCustomerId = session.customer as string;
    const customerEmail = session.customer_details?.email;

    if (plan) {
      if (userId) {
        // Logged-in user: directly update by user ID
        await supabase
          .from("profiles")
          .update({ plan, stripe_customer_id: stripeCustomerId })
          .eq("id", userId);
      } else if (customerEmail) {
        // Guest checkout: find the Supabase user by email and update their profile.
        // If they haven't created an account yet, this no-ops and the subscription
        // will be linked the next time the webhook fires (e.g. renewal) after they sign up.
        const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 });
        const matched = users.find((u) => u.email === customerEmail);
        if (matched) {
          await supabase
            .from("profiles")
            .update({ plan, stripe_customer_id: stripeCustomerId })
            .eq("id", matched.id);
        } else {
          // User hasn't signed up yet — store the pending plan on the Stripe customer
          // so we can retrieve it when they register (handled in the sign-up flow).
          await stripe.customers.update(stripeCustomerId, {
            metadata: { pending_plan: plan },
          });
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
      await supabase
        .from("profiles")
        .update({ plan })
        .eq("stripe_customer_id", customerId);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    if (customerId) {
      await supabase
        .from("profiles")
        .update({ plan: "free" })
        .eq("stripe_customer_id", customerId);
    }
  }

  return NextResponse.json({ received: true });
}
