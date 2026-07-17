import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createVenue, deleteVenue, renameVenue, getManagementSnapshot } from "@/lib/management/service";
import type { NewVenuePayload } from "@/lib/management/types";

export async function POST(req: Request) {
  try {
    const { user, supabase } = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as Partial<NewVenuePayload>;
    const name = body.name?.trim();

    if (!name) {
      return NextResponse.json({ error: "Provide a venue name." }, { status: 400 });
    }

    await createVenue(supabase, user.id, { name });
    const snapshot = await getManagementSnapshot(supabase, user.id);

    return NextResponse.json(snapshot);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create venue.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { user, supabase } = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json() as { venueId?: string; name?: string; reportSchedule?: { enabled: boolean; dayOfWeek: number } };
    const { venueId, name, reportSchedule } = body;

    if (!venueId) {
      return NextResponse.json({ error: "venueId is required." }, { status: 400 });
    }

    if (name?.trim()) {
      await renameVenue(supabase, user.id, venueId, name.trim());
    }

    if (reportSchedule !== undefined) {
      const admin = createSupabaseAdminClient();
      await admin
        .from("venues")
        .update({ report_schedule: reportSchedule })
        .eq("id", venueId)
        .eq("manager_user_id", user.id);
    }

    const snapshot = await getManagementSnapshot(supabase, user.id);
    return NextResponse.json(snapshot);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to rename venue.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { user, supabase } = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const venueId = searchParams.get("venueId")?.trim();

    if (!venueId) {
      return NextResponse.json({ error: "Provide a venueId." }, { status: 400 });
    }

    await deleteVenue(supabase, user.id, venueId);
    const snapshot = await getManagementSnapshot(supabase, user.id);

    return NextResponse.json(snapshot);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete venue.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
