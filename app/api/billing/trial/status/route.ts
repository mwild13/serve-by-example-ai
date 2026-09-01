import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getTrialStatus } from "@/lib/trial";

export const dynamic = "force-dynamic";

// Lets the public pricing page (and any other logged-out-tolerant surface)
// tell "fresh visitor, genuinely trial-eligible" apart from "already used
// their trial / already subscribed" BEFORE the visitor clicks anything —
// /api/billing/trial/start already has this logic (409s on a repeat
// trial), but that only tells you after a failed attempt. Always 200s so
// callers don't need special-case error handling for "not logged in".
export async function GET(req: Request) {
  const { user } = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ authenticated: false, subscriptionActive: false, trialStatus: "none", trialTier: null });
  }

  const admin = createSupabaseAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("subscription_status, org_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.org_id) {
    return NextResponse.json({
      authenticated: true,
      subscriptionActive: profile?.subscription_status === "active",
      trialStatus: "none",
      trialTier: null,
    });
  }

  const { data: org } = await admin
    .from("organizations")
    .select("trial_tier, trial_ends_at, trial_converted")
    .eq("id", profile.org_id)
    .maybeSingle();

  return NextResponse.json({
    authenticated: true,
    subscriptionActive: profile.subscription_status === "active",
    trialStatus: getTrialStatus(org ?? null),
    trialTier: org?.trial_tier ?? null,
  });
}
