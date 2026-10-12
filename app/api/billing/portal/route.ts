import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getUserFromRequest } from "@/lib/supabase-server";
import { rateLimit } from "@/lib/rate-limit";
import { siteOrigin } from "@/lib/site-url";
import { getPriceIds, isUpgrade } from "@/lib/billing-plans";

// Where Stripe sends the customer back to. The caller names one of these; it
// never supplies a URL.
const RETURN_PATHS: Record<string, string> = {
  management: "/management/dashboard?tab=settings&subtab=billing",
  dashboard: "/dashboard?nav=settings",
  mobile: "/mobile/settings",
  membership: "/membership",
};

// Where a member lands after confirming an upgrade. `upgraded=1` makes the
// Manager Console read the new plan from Stripe before it renders, so it does
// not depend on the webhook having arrived (app/management/dashboard/page.tsx).
const UPGRADED_PATH = "/management/dashboard?tab=settings&subtab=billing&upgraded=1";

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
  if (!rateLimit(`billing-portal:user:${user.id}`, 10)) {
    return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
  }

  // The Manager Console sends no body, so it keeps the management return.
  const body: unknown = await req.json().catch(() => null);
  const requested = body && typeof body === "object" ? (body as { returnTo?: unknown }).returnTo : undefined;
  const upgradeTo = body && typeof body === "object" ? (body as { upgradeTo?: unknown }).upgradeTo : undefined;
  const returnPath = (typeof requested === "string" && RETURN_PATHS[requested]) || RETURN_PATHS.management;

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, tier")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: "No billing account found" }, { status: 404 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-02-25.clover",
    httpClient: Stripe.createFetchHttpClient(),
  });

  const baseUrl = siteOrigin(req);

  try {
    // An upgrade opens the portal on Stripe's own confirmation page, which
    // shows the prorated charge and takes the payment. The plan has to be a
    // step up from the member's current one, and the portal's settings in
    // Stripe have to list its price, or Stripe refuses the session.
    let flowData: Stripe.BillingPortal.SessionCreateParams.FlowData | undefined;
    if (upgradeTo !== undefined) {
      const priceId = typeof upgradeTo === "string" ? getPriceIds()[upgradeTo] : undefined;
      if (typeof upgradeTo !== "string" || !priceId || !isUpgrade((profile.tier as string | null) ?? "free", upgradeTo)) {
        return NextResponse.json(
          { error: "You already have this plan or a higher one. To change it, contact us at info@servebyexample.co." },
          { status: 400 },
        );
      }
      const subscriptions = await stripe.subscriptions.list({ customer: profile.stripe_customer_id, limit: 10 });
      const subscription = subscriptions.data.find((s) => s.status === "active" || s.status === "trialing");
      const item = subscription?.items.data[0];
      if (!subscription || !item) {
        return NextResponse.json(
          { error: "Your current subscription has a payment problem. Fix it in Billing, then try the upgrade again." },
          { status: 400 },
        );
      }
      flowData = {
        type: "subscription_update_confirm",
        subscription_update_confirm: {
          subscription: subscription.id,
          items: [{ id: item.id, price: priceId, quantity: 1 }],
        },
        after_completion: { type: "redirect", redirect: { return_url: `${baseUrl}${UPGRADED_PATH}` } },
      };
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${baseUrl}${returnPath}`,
      ...(flowData ? { flow_data: flowData } : {}),
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Stripe billing portal error:", message);
    // 400, not 502: a 5xx body can be replaced by the proxy's own error page
    // before it reaches the browser, which left the button showing a generic
    // failure with no reason.
    return NextResponse.json({ error: `Billing could not be opened: ${message}` }, { status: 400 });
  }
}
