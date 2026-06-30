import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getUserFromRequest } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const challengeIndex = Number(body.challengeIndex);

    // Validate challenge index (0-4)
    if (!Number.isFinite(challengeIndex) || challengeIndex < 0 || challengeIndex > 4) {
      return NextResponse.json({ error: "Invalid challenge index. Must be 0-4." }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();

    // Upsert: insert if new, ignore if already exists (UNIQUE constraint)
    const { data, error } = await admin
      .from("user_challenges")
      .upsert(
        {
          user_id: user.id,
          challenge_index: challengeIndex,
          completed_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,challenge_index",
        }
      )
      .select("id, challenge_index, completed_at")
      .single();

    if (error) {
      console.error("[challenges/save] Supabase error:", error);
      return NextResponse.json({ error: "Failed to save challenge completion" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("[challenges/save] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
