import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getUserFromRequest } from "@/lib/supabase-server";
import { syncMasteryToVenueStaff } from "@/lib/mastery";

export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
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
        .ilike("email", user.email)
        .eq("venue_id", venue.id)
        .maybeSingle();

      if (byEmail) {
        existingRow = byEmail;
      }
    }

    const alreadyLinked = !!(existingRow && byUserId);

    // Resolve display name once — used for both venue_staff insert and venue_memberships upsert
    const { data: profile } = await admin
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle();

    const staffName = (profile?.display_name as string | null | undefined)
      ?? user.email?.split("@")[0]
      ?? "Staff Member";

    if (existingRow) {
      // Update existing row: set staff_user_id and email if missing
      await admin
        .from("venue_staff")
        .update({
          staff_user_id: user.id,
          ...(user.email ? { email: user.email } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingRow.id);
    } else {
      await admin
        .from("venue_staff")
        .insert({
          id: crypto.randomUUID(),
          venue_id: venue.id,
          manager_user_id: (venue as { owner_user_id?: string }).owner_user_id ?? user.id,
          staff_user_id: user.id,
          name: staffName,
          email: user.email ?? null,
          role: "New Staff",
          progress: 0,
          service_score: 0,
          sales_score: 0,
          product_score: 0,
          last_active_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
    }

    // Grant module access: upsert venue_memberships so resolveAccess returns the manager's tier
    if (user.email && venue.owner_user_id) {
      await admin
        .from("venue_memberships")
        .upsert(
          {
            manager_id: venue.owner_user_id,
            staff_email: user.email.toLowerCase(),
            venue_id: venue.id,
            status: "active",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "manager_id,staff_email" },
        );
    }

    // Sync any existing training data to the manager dashboard immediately
    if (user.email) {
      await syncMasteryToVenueStaff(admin, user.id, user.email);
    }

    return NextResponse.json({
      success: true,
      venueName: venue.name as string,
      alreadyLinked,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
