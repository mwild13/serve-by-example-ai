import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getUserFromRequest } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { readJsonBody } from "@/lib/ai-guard";
import { rateLimit } from "@/lib/rate-limit";
import { attributionFromRequest, attributionToStripeMetadata } from "@/lib/attribution";
import { B2B_PLANS, PLAN_METADATA, getPriceIds } from "@/lib/billing-plans";
import { reportError } from "@/lib/report-error";

export const dynamic = "force-dynamic";

// A second checkout while one of these is live would open a second Stripe
// subscription and charge the customer twice.
const LIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing", "past_due"]);

function getStripeClient() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-02-25.clover",
    httpClient: Stripe.createFetchHttpClient(),
  });
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
    const read = await readJsonBody(req, undefined, { requireJsonContentType: false });
    if (!read.ok) return read.response;
    const body = read.body;
    const plan = typeof body.plan === "string" ? body.plan : "";

    const PRICE_IDS = getPriceIds();
    const priceId = PRICE_IDS[plan];
    if (!plan || !priceId) {
      console.error(`Stripe checkout: invalid plan "${plan.slice(0, 40)}", or its STRIPE_PRICE_* variable is not set.`);
      return NextResponse.json({ error: "That plan is not available. Please choose a plan again." }, { status: 400 });
    }

    const planMeta = PLAN_METADATA[plan];
    if (!planMeta) {
      return NextResponse.json({ error: "That plan is not available. Please choose a plan again." }, { status: 400 });
    }

    // Checkout needs an account first. Paying as a guest made the webhook
    // create the account by invite while the return page asked the buyer to
    // sign up, so a new customer could be told their email already existed.
    const { user } = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: "Sign in or create an account to continue.", code: "SIGN_IN_REQUIRED" },
        { status: 401 },
      );
    }
    if (!rateLimit(`checkout:user:${user.id}`, 10)) {
      return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
    }

    const admin = createSupabaseAdminClient();
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("tier, subscription_status, stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();
    if (profileError) {
      console.error("Stripe checkout: profile lookup failed:", profileError.message);
      return NextResponse.json({ error: "Unable to start checkout. Please try again." }, { status: 500 });
    }
    const hasLiveSubscription =
      !!profile?.stripe_customer_id &&
      (profile.tier ?? "free") !== "free" &&
      LIVE_SUBSCRIPTION_STATUSES.has((profile.subscription_status as string | null) ?? "");
    if (hasLiveSubscription) {
      return NextResponse.json(
        {
          error: "You already have an active subscription. Change or cancel it from Billing before starting a new one.",
          code: "ALREADY_SUBSCRIBED",
        },
        { status: 409 },
      );
    }

    const subscriptionMetadata: Record<string, string> = {
      priceId,
      tier: planMeta.tier,
      seat_limit: planMeta.seat_limit,
      userId: user.id,
      // Which campaign this buyer first arrived from, if any (lib/attribution.ts).
      ...attributionToStripeMetadata(attributionFromRequest(req)),
    };

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const isB2B = B2B_PLANS.has(plan);

    // B2B plans land on management dashboard billing tab post-checkout;
    // B2C pro lands on staff dashboard
    const successUrl = isB2B
      ? `${baseUrl}/management/dashboard?tab=settings&subtab=billing&checkout=success&session_id={CHECKOUT_SESSION_ID}`
      : `${baseUrl}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`;

    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email ?? undefined,
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
    await reportError(error, { route: "/api/billing/checkout", url: req.url });
    return NextResponse.json({ error: "Unable to start checkout. Please try again." }, { status: 500 });
  }
}
