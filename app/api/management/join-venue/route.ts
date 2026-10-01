import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getUserFromRequest } from "@/lib/supabase-server";
import { syncMasteryToVenueStaff } from "@/lib/mastery";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// The one /api/management route without requireManager(): the caller is the
// staff member joining, not a manager.
//
// Venue codes are 4 digits (9,000 possibilities), so without a limit the
// whole space can be walked in minutes to join any venue and get its
// sponsored training access (audit 2026-09-30, H2). Longer codes and manager
// approval follow in a later phase; this caps guessing now. In-memory per
// isolate, so the daily cap is a soft ceiling.
const JOIN_PER_MINUTE_USER = 5;
const JOIN_PER_MINUTE_IP = 20;
const JOIN_PER_DAY_USER = 20;
const DAY_MS = 24 * 60 * 60 * 1000;

function logJoinRejection(reason: string, userId: string, ip: string) {
  console.warn(JSON.stringify({ event: "join_venue_rejected", reason, userId, ip }));
}

export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const ip = getClientIp(req);
    if (
      !rateLimit(`join-venue:user:${user.id}`, JOIN_PER_MINUTE_USER) ||
      !rateLimit(`join-venue:ip:${ip}`, JOIN_PER_MINUTE_IP) ||
      !rateLimit(`join-venue:user-day:${user.id}`, JOIN_PER_DAY_USER, DAY_MS)
    ) {
      logJoinRejection("rate_limited", user.id, ip);
      return NextResponse.json({ error: "Too many attempts. Please wait and try again." }, { status: 429 });
    }

    const body = await req.json() as { venueCode?: unknown };
    const venueCode = typeof body.venueCode === "number"
      ? body.venueCode
      : typeof body.venueCode === "string"
        ? parseInt(body.venueCode, 10)
        : null;

    if (!venueCode || isNaN(venueCode)) {
      return NextResponse.json({ error: "Invalid venue code." }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();

    // Find venue by code
    const { data: venue, error: venueError } = await admin
      .from("venues")
      .select("id, name, owner_user_id")
      .eq("venue_code", venueCode)
      .single();

    if (venueError || !venue) {
      logJoinRejection("venue_not_found", user.id, ip);
      return NextResponse.json({ error: "Venue not found. Check the code and try again." }, { status: 404 });
    }

    // Check if staff row already exists for this user (by staff_user_id or email)
    let existingRow: { id: string } | null = null;

    const { data: byUserId } = await admin
      .from("venue_staff")
      .select("id")
      .eq("staff_user_id", user.id)
      .eq("venue_id", venue.id)
      .maybeSingle();

    if (byUserId) {
      existingRow = byUserId;
    } else if (user.email) {
      const { data: byEmail } = await admin
        .from("venue_staff")
        .select("id")
        .eq("email", user.email.toLowerCase())
        .eq("venue_id", venue.id)
        .maybeSingle();

      if (byEmail) {
        existingRow = byEmail;
      }
    }

    const alreadyLinked = !!existingRow;

    // Resolve display name once — used for both venue_staff insert and organization_members upsert
    const { data: profile } = await admin
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle();

    const staffName = (profile?.display_name as string | null | undefined)
      ?? user.email?.split("@")[0]
      ?? "Staff Member";

    // Id of a venue_staff row this request creates, so it can be rolled back
    // if the membership write below is refused (e.g. the seat-limit trigger).
    let insertedStaffId: string | null = null;

    if (existingRow) {
      // Update existing row: set staff_user_id and email if missing
      const { error: staffUpdateError } = await admin
        .from("venue_staff")
        .update({
          staff_user_id: user.id,
          ...(user.email ? { email: user.email.toLowerCase() } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingRow.id);
      if (staffUpdateError) throw staffUpdateError;
    } else {
      const newStaffId = crypto.randomUUID();
      const { error: staffInsertError } = await admin
        .from("venue_staff")
        .insert({
          id: newStaffId,
          venue_id: venue.id,
          manager_user_id: (venue as { owner_user_id?: string }).owner_user_id ?? user.id,
          staff_user_id: user.id,
          name: staffName,
          email: user.email?.toLowerCase() ?? null,
          role: "New Staff",
          progress: 0,
          service_score: 0,
          sales_score: 0,
          product_score: 0,
          last_active_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      if (staffInsertError) throw staffInsertError;
      insertedStaffId = newStaffId;
    }

    // Grant module access: upsert organization_members so resolveAccess returns the manager's tier
    if (user.email && venue.owner_user_id) {
      const { data: existingMember } = await admin
        .from("organization_members")
        .select("id")
        .eq("manager_id", venue.owner_user_id)
        .eq("staff_email", user.email.toLowerCase())
        .eq("venue_id", venue.id)
        .not("status", "eq", "removed")
        .maybeSingle();

      const { error: memberError } = existingMember
        ? await admin
          .from("organization_members")
          .update({ status: "active", user_id: user.id, updated_at: new Date().toISOString() })
          .eq("id", existingMember.id)
        : await admin
          .from("organization_members")
          .insert({
            manager_id: venue.owner_user_id,
            user_id: user.id,
            staff_email: user.email.toLowerCase(),
            venue_id: venue.id,
            status: "active",
            role: "staff",
            seat_counted: true,
          });

      if (memberError) {
        if (insertedStaffId) {
          await admin.from("venue_staff").delete().eq("id", insertedStaffId);
        }
        const seatLimitReached = memberError.message?.includes("Seat limit reached");
        logJoinRejection(seatLimitReached ? "seat_limit" : "membership_write_failed", user.id, ip);
        if (seatLimitReached) {
          return NextResponse.json(
            { error: "This venue has no free staff seats. Ask your manager to free a seat or upgrade their plan." },
            { status: 409 },
          );
        }
        throw memberError;
      }
    }

    // Sync any existing training data to the manager dashboard immediately
    await syncMasteryToVenueStaff(admin, user.id);

    return NextResponse.json({
      success: true,
      venueName: venue.name as string,
      alreadyLinked,
    });
  } catch (err) {
    console.error("Join venue error:", err);
    return NextResponse.json({ error: "Could not join the venue. Please try again." }, { status: 500 });
  }
}
