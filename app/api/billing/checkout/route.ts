import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getUserFromRequest } from "@/lib/supabase-server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

const PRICE_IDS: Record<string, string> = {
  pro: process.env.STRIPE_PRICE_PRO!,
  single_venue: process.env.STRIPE_PRICE_SINGLE_VENUE!,
  multi_venue: process.env.STRIPE_PRICE_MULTI_VENUE!,
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { plan, email: emailFromBody } = body;

    const priceId = PRICE_IDS[plan];
    if (!plan || !priceId) {
      return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
    }
    // emailFromBody is available for future use when supporting guest checkouts

    // Auth is optional — checkout works whether or not the user is signed in.
    const { user } = await getUserFromRequest(req);

    const customerEmail = user?.email ?? emailFromBody ?? undefined;
    const metadata: Record<string, string> = { priceId };
    if (user?.id) metadata.userId = user.id;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: customerEmail,
      metadata,
      // Logged-in users land on the dashboard; guests land on login with a flag
      // so they can create an account and get their plan linked via the webhook.
      success_url: user
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?checkout=success`
        : `${process.env.NEXT_PUBLIC_BASE_URL}/login?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?checkout=cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Stripe error." }, { status: 500 });
  }
}
