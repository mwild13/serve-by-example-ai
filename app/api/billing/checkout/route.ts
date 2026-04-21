import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getUserFromRequest } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
  httpClient: Stripe.createFetchHttpClient(),
});

const PRICE_IDS: Record<string, string> = {
  pro: process.env.STRIPE_PRICE_PRO!,
  single_venue: process.env.STRIPE_PRICE_SINGLE_VENUE!,
  multi_venue: process.env.STRIPE_PRICE_MULTI_VENUE!,
};

export async function POST(req: Request) {
  // Upfront env var checks — surfaces misconfiguration clearly
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("Stripe checkout: STRIPE_SECRET_KEY is not set.");
    return NextResponse.json({ error: "Payment system is not configured (missing secret key)." }, { status: 500 });
  }
  if (!process.env.NEXT_PUBLIC_BASE_URL) {
    console.error("Stripe checkout: NEXT_PUBLIC_BASE_URL is not set.");
    return NextResponse.json({ error: "Payment system is not configured (missing base URL)." }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { plan, email: emailFromBody } = body;

    const priceId = PRICE_IDS[plan];
    if (!plan || !priceId) {
      console.error(`Stripe checkout: invalid plan "${plan}". Available: ${Object.keys(PRICE_IDS).join(", ")}`);
      return NextResponse.json({ error: `Invalid plan "${plan}". Check STRIPE_PRICE_* env vars are set.` }, { status: 400 });
    }

    // Auth is optional — checkout works whether or not the user is signed in.
    const { user } = await getUserFromRequest(req);

    const customerEmail = user?.email ?? emailFromBody ?? undefined;
    const subscriptionMetadata: Record<string, string> = { priceId };
    if (user?.id) subscriptionMetadata.userId = user.id;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: customerEmail,
      // session.metadata — read by the checkout.session.completed webhook event
      metadata: subscriptionMetadata,
      // subscription_data.metadata — read by subscription.updated / subscription.deleted events
      subscription_data: {
        metadata: subscriptionMetadata,
      },
      // Logged-in users land on the dashboard; guests land on login with a flag
      // so they can create an account and get their plan linked via the webhook.
      success_url: user
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?checkout=success`
        : `${process.env.NEXT_PUBLIC_BASE_URL}/login?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?checkout=cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Stripe checkout error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
