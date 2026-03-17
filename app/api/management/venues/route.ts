import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createVenue, deleteVenue, getManagementSnapshot } from "@/lib/management/service";
import type { NewVenuePayload } from "@/lib/management/types";

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

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

export async function DELETE(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

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
