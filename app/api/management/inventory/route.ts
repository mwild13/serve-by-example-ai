import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase-server";
import { createInventoryItem, deleteInventoryItem, getManagementSnapshot } from "@/lib/management/service";
import type { NewInventoryPayload } from "@/lib/management/types";

export async function POST(req: Request) {
  try {
    const { user, supabase } = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as Partial<NewInventoryPayload>;
    const category = body.category?.trim();
    const name = body.name?.trim();
    const venueId = body.venueId?.trim();

    if (!category || !name) {
      return NextResponse.json({ error: "Provide both an inventory category and product name." }, { status: 400 });
    }

    await createInventoryItem(supabase, user.id, { category, name, venueId });
    const snapshot = await getManagementSnapshot(supabase, user.id);

    return NextResponse.json(snapshot);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to add inventory item.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { user, supabase } = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = (await req.json()) as { id?: string };

    if (!id) {
      return NextResponse.json({ error: "Provide an item id to delete." }, { status: 400 });
    }

    await deleteInventoryItem(supabase, user.id, id);
    const snapshot = await getManagementSnapshot(supabase, user.id);

    return NextResponse.json(snapshot);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete inventory item.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}