import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { readJsonBody } from "@/lib/ai-guard";

export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const read = await readJsonBody(req, undefined, { requireJsonContentType: false });
    if (!read.ok) return read.response;
    const { displayName } = read.body;
    const trimmed = typeof displayName === "string" ? displayName.trim() : "";
    if (!trimmed) {
      return NextResponse.json({ error: "Name cannot be empty." }, { status: 400 });
    }

    const adminSupabase = createSupabaseAdminClient();
    const { error } = await adminSupabase
      .from("profiles")
      .update({ display_name: trimmed })
      .eq("id", user.id);

    if (error) {
      console.error("Profile name update error:", error);
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Profile name update error:", err);
    return NextResponse.json({ error: "Could not update display name." }, { status: 500 });
  }
}
