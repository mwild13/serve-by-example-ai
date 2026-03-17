import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getUserFromRequest } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

/**
 * Called after a user signs up or signs in.
 * Checks whether this email has a pending Stripe subscription
 * (set on the Stripe customer when they paid before creating an account)
 * and applies the plan to their profile.
 */
export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user?.email) return NextResponse.json({ linked: false });

    // Find Stripe customers with this email
    const customers = await stripe.customers.list({ email: user.email, limit: 5 });

    for (const customer of customers.data) {
      const pendingPlan = customer.metadata?.pending_plan;
      if (pendingPlan) {
        const adminSupabase = createSupabaseAdminClient();

        await adminSupabase
          .from("profiles")
          .update({ plan: pendingPlan, stripe_customer_id: customer.id })
          .eq("id", user.id);

        // Clear the pending flag so it isn't applied twice
        await stripe.customers.update(customer.id, {
          metadata: { pending_plan: "" },
        });

        return NextResponse.json({ linked: true, plan: pendingPlan });
      }
    }

    return NextResponse.json({ linked: false });
  } catch (error) {
    console.error("Link pending subscription error:", error);
    return NextResponse.json({ linked: false });
  }
}
