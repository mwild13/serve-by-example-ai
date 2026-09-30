import { NextResponse } from "next/server";
import { managementErrorResponse, requireManager } from "@/lib/management/auth";
import { createVenue, deleteVenue, renameVenue, getManagementSnapshot } from "@/lib/management/service";
import type { NewVenuePayload } from "@/lib/management/types";

// Venue setup is owner-level only (duty managers excluded), matching the
// console's Settings gate. Writes run on the admin client behind
// requireManager(); every venue write is scoped to owner_user_id = caller.
// Clients can no longer write venues directly (audit 2026-09-30, Phase 2).

export async function POST(req: Request) {
  const gate = await requireManager(req, { rateKey: "mgmt-venues", ownerOnly: true, limit: 10 });
  if (!gate.ok) return gate.response;
  const { user, admin } = gate.ctx;

  try {
    const body = (await req.json()) as Partial<NewVenuePayload>;
    const name = body.name?.trim();

    if (!name) {
      return NextResponse.json({ error: "Provide a venue name." }, { status: 400 });
    }

    await createVenue(admin, user.id, { name });
    const snapshot = await getManagementSnapshot(admin, user.id);

    return NextResponse.json(snapshot);
  } catch (error) {
    return managementErrorResponse(error, "Unable to create venue.", "venues POST");
  }
}

export async function PATCH(req: Request) {
  const gate = await requireManager(req, { rateKey: "mgmt-venues", ownerOnly: true });
  if (!gate.ok) return gate.response;
  const { user, admin, assertOwnsVenue } = gate.ctx;

  try {
    const body = await req.json() as { venueId?: string; name?: string; reportSchedule?: { enabled: boolean; dayOfWeek: number } };
    const { venueId, name, reportSchedule } = body;

    if (!venueId) {
      return NextResponse.json({ error: "venueId is required." }, { status: 400 });
    }

    await assertOwnsVenue(venueId);

    if (name?.trim()) {
      await renameVenue(admin, user.id, venueId, name.trim());
    }

    if (reportSchedule !== undefined) {
      // venues has no manager_user_id column — this used to filter on it and
      // silently update nothing (audit 2026-09-30, L2).
      const { error } = await admin
        .from("venues")
        .update({ report_schedule: reportSchedule })
        .eq("id", venueId)
        .eq("owner_user_id", user.id);
      if (error) throw error;
    }

    const snapshot = await getManagementSnapshot(admin, user.id);
    return NextResponse.json(snapshot);
  } catch (error) {
    return managementErrorResponse(error, "Unable to update venue.", "venues PATCH");
  }
}

export async function DELETE(req: Request) {
  const gate = await requireManager(req, { rateKey: "mgmt-venues", ownerOnly: true, limit: 10 });
  if (!gate.ok) return gate.response;
  const { user, admin } = gate.ctx;

  try {
    const { searchParams } = new URL(req.url);
    const venueId = searchParams.get("venueId")?.trim();

    if (!venueId) {
      return NextResponse.json({ error: "Provide a venueId." }, { status: 400 });
    }

    await deleteVenue(admin, user.id, venueId);
    const snapshot = await getManagementSnapshot(admin, user.id);

    return NextResponse.json(snapshot);
  } catch (error) {
    return managementErrorResponse(error, "Unable to delete venue.", "venues DELETE");
  }
}
