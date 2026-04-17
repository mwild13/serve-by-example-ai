import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { countActiveSeats } from "@/lib/session";

const TIER_MAX_SEATS: Record<string, number> = {
  "single-venue": 25,
  venue_single: 25,
  "multi-venue": 125,
  venue_multi: 125,
};

/**
 * GET /api/management/memberships — list manager's memberships
 * POST /api/management/memberships — invite a staff member
 * DELETE /api/management/memberships — remove a membership
 */
export async function GET(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("venue_memberships")
      .select("id, staff_email, venue_id, status, created_at")
      .eq("manager_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ memberships: data ?? [] });
  } catch (error) {
    console.error("Memberships GET error:", error);
    return NextResponse.json({ error: "Failed to load memberships." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { staffEmail, venueId } = body as { staffEmail?: string; venueId?: string };

    if (!staffEmail || typeof staffEmail !== "string") {
      return NextResponse.json({ error: "staffEmail is required." }, { status: 400 });
    }
    const email = staffEmail.trim().toLowerCase();

    const admin = createSupabaseAdminClient();

    // Get manager's tier to check seat cap
    const { data: profile } = await admin
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    const tier = profile?.plan ?? "free";
    const maxSeats = TIER_MAX_SEATS[tier] ?? 0;

    if (maxSeats === 0) {
      return NextResponse.json(
        { error: "Your plan does not include staff seats. Upgrade to a venue plan." },
        { status: 403 },
      );
    }

    // Check seat cap
    const currentSeats = await countActiveSeats(admin, user.id);
    if (currentSeats >= maxSeats) {
      return NextResponse.json(
        { error: `Seat limit reached (${currentSeats}/${maxSeats}). Upgrade your plan to add more staff.` },
        { status: 403 },
      );
    }

    // Insert membership
    const { data: membership, error: insertError } = await admin
      .from("venue_memberships")
      .upsert(
        {
          manager_id: user.id,
          staff_email: email,
          venue_id: venueId ?? null,
          status: "invited",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "manager_id,staff_email" },
      )
      .select("id, staff_email, venue_id, status")
      .single();

    if (insertError) {
      console.error("Membership insert error:", insertError);
      return NextResponse.json({ error: "Failed to invite staff member." }, { status: 500 });
    }

    // Send Supabase auth invite email (creates account if not exists)
    const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(
      email,
      {
        data: { invited_by_manager: user.id },
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/dashboard`,
      },
    );

    const inviteSent = !inviteError;
    if (inviteError) {
      console.warn("Auth invite email failed (user may already exist):", inviteError.message);
    }

    return NextResponse.json({
      membership,
      inviteSent,
      seatsUsed: currentSeats + 1,
      maxSeats,
    });
  } catch (error) {
    console.error("Memberships POST error:", error);
    return NextResponse.json({ error: "Failed to invite staff." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { membershipId } = body as { membershipId?: string };

    if (!membershipId) {
      return NextResponse.json({ error: "membershipId is required." }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();

    const { error } = await admin
      .from("venue_memberships")
      .update({ status: "removed", updated_at: new Date().toISOString() })
      .eq("id", membershipId)
      .eq("manager_id", user.id);

    if (error) {
      return NextResponse.json({ error: "Failed to remove membership." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Memberships DELETE error:", error);
    return NextResponse.json({ error: "Failed to remove membership." }, { status: 500 });
  }
}
