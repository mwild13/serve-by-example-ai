import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await req.json();
    const validCode = process.env.FOUNDERS_SECRET_CODE;

    if (!validCode || code?.trim() !== validCode) {
      return NextResponse.json({ error: "Invalid founders code." }, { status: 400 });
    }

    // Use admin client to bypass RLS — the anon client respects RLS policies
    // which may block updates to is_founders_user even for authenticated users.
    const adminSupabase = createSupabaseAdminClient();
    const { error } = await adminSupabase
      .from("profiles")
      .update({ is_founders_user: true })
      .eq("id", user.id);

    if (error) {
      console.error("Supabase founder flag update error:", error);
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Founders activation error:", err);
    return NextResponse.json({ error: "Could not activate founders access." }, { status: 500 });
  }
}
