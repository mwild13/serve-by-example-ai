import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { TRIAL_ELIGIBLE_TIERS, isTrialEligibleTier, getDaysRemaining } from "@/lib/trial";
import { TIER_SEATS } from "@/lib/session";

export const dynamic = "force-dynamic";

// Staff invited via venue_memberships cannot start a trial — their manager is the subscriber.
// New users with no platform_role are allowed and will be assigned a manager role on trial start.
const BLOCKED_ROLES = new Set(["staff"]);

// Maps trial tier to the appropriate manager platform_role.
const TIER_TO_ROLE: Record<string, string> = {
  boutique: "venue_manager",
  commercial: "multi_venue_manager",
  venue_single: "venue_manager",
  venue_multi: "multi_venue_manager",
};

export async function POST(req: Request) {
  const { user } = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { tier?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { tier } = body;
  if (!tier || !isTrialEligibleTier(tier)) {
    return NextResponse.json(
      { error: `tier must be one of: ${TRIAL_ELIGIBLE_TIERS.join(", ")}` },
      { status: 400 },
    );
  }

  const admin = createSupabaseAdminClient();

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id, platform_role, subscription_active, org_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  if (BLOCKED_ROLES.has(profile.platform_role as string)) {
    return NextResponse.json(
      { error: "Staff accounts cannot start a trial — contact your manager" },
      { status: 403 },
    );
  }

  if (profile.subscription_active) {
    return NextResponse.json({ error: "Already subscribed" }, { status: 409 });
  }

  // Assign manager role to new users who have no platform_role yet.
  // This allows the management dashboard access gate to pass on redirect.
  if (!profile.platform_role) {
    await admin
      .from("profiles")
      .update({ platform_role: TIER_TO_ROLE[tier] ?? "venue_manager" })
      .eq("id", user.id);
  }

  const trialStartedAt = new Date();
  const trialEndsAt = new Date(trialStartedAt.getTime() + 14 * 24 * 60 * 60 * 1000);
  const seatLimit = TIER_SEATS[tier as keyof typeof TIER_SEATS] ?? 0;
  const now = new Date().toISOString();

  // Org exists — check for prior trial, then apply trial columns
  if (profile.org_id) {
    const { data: org } = await admin
      .from("organizations")
      .select("id, trial_tier")
      .eq("id", profile.org_id)
      .single();

    if (org?.trial_tier) {
      return NextResponse.json(
        { error: "This organisation has already used its free trial" },
        { status: 409 },
      );
    }

    const { error: updateError } = await admin
      .from("organizations")
      .update({
        trial_tier: tier,
        trial_started_at: trialStartedAt.toISOString(),
        trial_ends_at: trialEndsAt.toISOString(),
        trial_converted: false,
        seat_limit: seatLimit,
        updated_at: now,
      })
      .eq("id", profile.org_id);

    if (updateError) {
      console.error("[TRIAL] Failed to update org:", updateError.message);
      return NextResponse.json({ error: "Failed to start trial" }, { status: 500 });
    }

    console.log(
      `[TRIAL] Started: user=${user.id} org=${profile.org_id} tier=${tier} ends=${trialEndsAt.toISOString()}`,
    );

    return NextResponse.json({
      trial_tier: tier,
      trial_ends_at: trialEndsAt.toISOString(),
      days_remaining: getDaysRemaining(trialEndsAt.toISOString()),
    });
  }

  // No org yet — create one and link to profile
  const orgName = user.email ? (user.email.split("@")[1] ?? "My Organisation") : "My Organisation";

  const { data: newOrg, error: orgError } = await admin
    .from("organizations")
    .insert({
      name: orgName,
      owner_user_id: user.id,
      seat_limit: seatLimit,
      trial_tier: tier,
      trial_started_at: trialStartedAt.toISOString(),
      trial_ends_at: trialEndsAt.toISOString(),
      trial_converted: false,
      updated_at: now,
    })
    .select("id")
    .single();

  if (orgError || !newOrg) {
    console.error("[TRIAL] Failed to create org:", orgError?.message);
    return NextResponse.json({ error: "Failed to start trial" }, { status: 500 });
  }

  await admin.from("profiles").update({ org_id: newOrg.id }).eq("id", user.id);

  console.log(
    `[TRIAL] Started: user=${user.id} org=${newOrg.id} tier=${tier} ends=${trialEndsAt.toISOString()}`,
  );

  return NextResponse.json({
    trial_tier: tier,
    trial_ends_at: trialEndsAt.toISOString(),
    days_remaining: getDaysRemaining(trialEndsAt.toISOString()),
  });
}
