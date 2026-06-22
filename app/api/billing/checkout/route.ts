import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getUserFromRequest } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

const B2B_PLANS = new Set(["boutique", "boutique_yearly", "commercial", "commercial_yearly", "enterprise"]);

// Tier + seat_limit embedded in Stripe metadata so webhooks can route without price lookups
const PLAN_METADATA: Record<string, { tier: string; seat_limit: string }> = {
  pro:                  { tier: "pro",        seat_limit: "1" },
  pro_yearly:           { tier: "pro",        seat_limit: "1" },
  boutique:             { tier: "boutique",   seat_limit: "15" },
  boutique_yearly:      { tier: "boutique",   seat_limit: "15" },
  commercial:           { tier: "commercial", seat_limit: "35" },
  commercial_yearly:    { tier: "commercial", seat_limit: "35" },
  enterprise:           { tier: "enterprise", seat_limit: "9999" },
  // Legacy plan keys — kept so existing bookmarked links and emails still resolve
  single_venue:         { tier: "boutique",   seat_limit: "25" },
  single_venue_yearly:  { tier: "boutique",   seat_limit: "25" },
  multi_venue:          { tier: "commercial", seat_limit: "125" },
  multi_venue_yearly:   { tier: "commercial", seat_limit: "125" },
};

function getStripeClient() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-02-25.clover",
    httpClient: Stripe.createFetchHttpClient(),
  });
}

function getPriceIds(): Record<string, string> {
  return {
    pro:                  process.env.STRIPE_PRICE_PRO!,
    pro_yearly:           process.env.STRIPE_PRICE_PRO_YEARLY!,
    boutique:             process.env.STRIPE_PRICE_BOUTIQUE!,
    boutique_yearly:      process.env.STRIPE_PRICE_BOUTIQUE_YEARLY!,
    commercial:           process.env.STRIPE_PRICE_COMMERCIAL!,
    commercial_yearly:    process.env.STRIPE_PRICE_COMMERCIAL_YEARLY!,
    enterprise:           process.env.STRIPE_PRICE_ENTERPRISE!,
    // Legacy price IDs — kept for backward compat with existing subscribers
    single_venue:         process.env.STRIPE_PRICE_SINGLE_VENUE!,
    single_venue_yearly:  process.env.STRIPE_PRICE_SINGLE_VENUE_YEARLY!,
    multi_venue:          process.env.STRIPE_PRICE_MULTI_VENUE!,
    multi_venue_yearly:   process.env.STRIPE_PRICE_MULTI_VENUE_YEARLY!,
  };
}

export async function POST(req: Request) {
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

    const PRICE_IDS = getPriceIds();
    const priceId = PRICE_IDS[plan];
    if (!plan || !priceId) {
      console.error(`Stripe checkout: invalid plan "${plan}". Available: ${Object.keys(PRICE_IDS).join(", ")}`);
      return NextResponse.json(
        { error: `Invalid plan "${plan}". Check STRIPE_PRICE_* env vars are set.` },
        { status: 400 },
      );
    }

    const planMeta = PLAN_METADATA[plan];
    if (!planMeta) {
      return NextResponse.json({ error: `No metadata mapping for plan "${plan}".` }, { status: 400 });
    }

    const { user } = await getUserFromRequest(req);
    const customerEmail = user?.email ?? emailFromBody ?? undefined;

    const subscriptionMetadata: Record<string, string> = {
      priceId,
      tier: planMeta.tier,
      seat_limit: planMeta.seat_limit,
    };
    if (user?.id) subscriptionMetadata.userId = user.id;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const isB2B = B2B_PLANS.has(plan);

    // B2B plans land on management dashboard billing tab post-checkout;
    // B2C pro lands on staff dashboard
    const successUrl = user
      ? isB2B
        ? `${baseUrl}/management/dashboard?tab=settings&subtab=billing&checkout=success&session_id={CHECKOUT_SESSION_ID}`
        : `${baseUrl}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`
      : `${baseUrl}/login?checkout=success&session_id={CHECKOUT_SESSION_ID}`;

    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: customerEmail,
      allow_promotion_codes: true,
      metadata: subscriptionMetadata,
      subscription_data: {
        metadata: subscriptionMetadata,
      },
      success_url: successUrl,
      cancel_url: `${baseUrl}/pricing?checkout=cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Stripe checkout error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
