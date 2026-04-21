import { NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
  httpClient: Stripe.createFetchHttpClient(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id." }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ verified: false, error: "Payment not complete." }, { status: 402 });
    }

    return NextResponse.json({
      verified: true,
      customer_email: session.customer_details?.email ?? "",
      metadata: session.metadata ?? {},
    });
  } catch (error) {
    console.error("Verify session error:", error);
    return NextResponse.json({ error: "Could not verify session." }, { status: 500 });
  }
}
