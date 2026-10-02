import { NextResponse } from "next/server";
import { managementErrorResponse, requireManager } from "@/lib/management/auth";
import { createInventoryItem, deleteInventoryItem, getManagementSnapshot } from "@/lib/management/service";
import type { NewInventoryPayload } from "@/lib/management/types";
import { readJsonBody } from "@/lib/ai-guard";

// Writes run on the admin client behind requireManager(), which checks the
// caller's role and session; the service functions scope every write to the
// caller's own venues/rows. Clients can no longer write venue_inventory_items
// directly (audit 2026-09-30, Phase 2).

export async function POST(req: Request) {
  const gate = await requireManager(req, { rateKey: "mgmt-inventory" });
  if (!gate.ok) return gate.response;
  const { user, admin } = gate.ctx;

  try {
    const read = await readJsonBody(req, undefined, { requireJsonContentType: false });
    if (!read.ok) return read.response;
    const body = read.body as Partial<NewInventoryPayload>;
    const category = body.category?.trim();
    const name = body.name?.trim();
    const venueId = body.venueId?.trim();

    if (!category || !name) {
      return NextResponse.json({ error: "Provide both an inventory category and product name." }, { status: 400 });
    }

    await createInventoryItem(admin, user.id, { category, name, venueId });
    const snapshot = await getManagementSnapshot(admin, user.id);

    return NextResponse.json(snapshot);
  } catch (error) {
    return managementErrorResponse(error, "Unable to add inventory item.", "inventory POST");
  }
}

export async function DELETE(req: Request) {
  const gate = await requireManager(req, { rateKey: "mgmt-inventory" });
  if (!gate.ok) return gate.response;
  const { user, admin } = gate.ctx;

  try {
    const read2 = await readJsonBody(req, undefined, { requireJsonContentType: false });
    if (!read2.ok) return read2.response;
    const { id } = read2.body as { id?: string };

    if (!id) {
      return NextResponse.json({ error: "Provide an item id to delete." }, { status: 400 });
    }

    await deleteInventoryItem(admin, user.id, id);
    const snapshot = await getManagementSnapshot(admin, user.id);

    return NextResponse.json(snapshot);
  } catch (error) {
    return managementErrorResponse(error, "Unable to delete inventory item.", "inventory DELETE");
  }
}
