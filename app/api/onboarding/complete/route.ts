import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  const { user } = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let venueType: string | null = null;
  let experienceLevel: string | null = null;
  try {
    const body = await req.json() as { venueType?: string; experienceLevel?: string };
    venueType = body.venueType ?? null;
    experienceLevel = body.experienceLevel ?? null;
  } catch {
    // Body is optional — skip step uses no payload
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("profiles")
    .upsert(
      {
        id: user.id,
        // profiles.email is NOT NULL with no default. Postgres validates
        // NOT NULL on the full candidate row for INSERT ... ON CONFLICT DO
        // UPDATE even when the row already exists and only an UPDATE runs —
        // omitting email here throws 23502 and the upsert never lands.
        email: user.email ?? "",
        onboarding_completed: true,
        ...(venueType ? { venue_type: venueType } : {}),
        ...(experienceLevel ? { experience_level: experienceLevel } : {}),
      },
      { onConflict: "id" }
    );

  if (error) {
    console.error("Onboarding complete upsert error:", error);
    return NextResponse.json({ error: "Failed to save onboarding data" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
