import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase-server";
import { getManagementSnapshot } from "@/lib/management/service";

export async function GET(req: Request) {
  try {
    const { user, supabase } = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const snapshot = await getManagementSnapshot(supabase, user.id);
    return NextResponse.json(snapshot);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load management snapshot.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}