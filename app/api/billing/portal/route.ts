import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getUserFromRequest } from "@/lib/supabase-server";

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Billing not configured" }, { status: 503 });
  }

  // Reuse the authenticated client from getUserFromRequest rather than a
  // fresh cookie-only createSupabaseServerClient() — on Cloudflare Pages
  // cookies are often not forwarded to API routes, so a cookie-only client
  // has no auth.uid() during RLS evaluation and this profiles query would
  // silently come back empty even when stripe_customer_id is populated.
  const { user, supabase } = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: "No billing account found" }, { status: 404 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-02-25.clover",
    httpClient: Stripe.createFetchHttpClient(),
  });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? process.env.NEXT_PUBLIC_BASE_URL ?? "";

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${baseUrl}/management/dashboard?tab=settings&subtab=billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Stripe billing portal error:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
