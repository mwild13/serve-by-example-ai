import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getUserFromRequest } from "@/lib/supabase-server";

const VALID_MODULES = ["bartending", "sales", "management"] as const;

export async function GET(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const mod = url.searchParams.get("module");

    if (!mod || !VALID_MODULES.includes(mod as typeof VALID_MODULES[number])) {
      return NextResponse.json({ error: "Invalid module." }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const { data } = await admin
      .from("user_level_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("module", mod)
      .maybeSingle();

    return NextResponse.json({
      progress: data ?? {
        current_level: 1,
        level1_score: 0,
        level1_completed: false,
        level2_score: 0,
        level2_completed: false,
        level3_score: 0,
        level3_completed: false,
        level4_unlocked: false,
      },
    });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const mod = body.module as string;

    if (!mod || !VALID_MODULES.includes(mod as typeof VALID_MODULES[number])) {
      return NextResponse.json({ error: "Invalid module." }, { status: 400 });
    }

    const currentLevel = Math.max(1, Math.min(4, Number(body.currentLevel) || 1));
    const level1Score = Math.max(0, Number(body.level1Score) || 0);
    const level1Completed = Boolean(body.level1Completed);
    const level2Score = Math.max(0, Number(body.level2Score) || 0);
    const level2Completed = Boolean(body.level2Completed);
    const level3Score = Math.max(0, Number(body.level3Score) || 0);
    const level3Completed = Boolean(body.level3Completed);
    const level4Unlocked = Boolean(body.level4Unlocked);

    const admin = createSupabaseAdminClient();
    const now = new Date().toISOString();

    // Read existing row so we never clear previously-earned stage completions.
    // Completed flags and scores are additive — once earned, never revoked.
    const { data: existing } = await admin
      .from("user_level_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("module", mod)
      .maybeSingle();

    await admin.from("user_level_progress").upsert(
      {
        user_id: user.id,
        module: mod,
        current_level: Math.max(currentLevel, existing?.current_level ?? 1),
        level1_score: Math.max(level1Score, existing?.level1_score ?? 0),
        level1_completed: level1Completed || (existing?.level1_completed ?? false),
        level2_score: Math.max(level2Score, existing?.level2_score ?? 0),
        level2_completed: level2Completed || (existing?.level2_completed ?? false),
        level3_score: Math.max(level3Score, existing?.level3_score ?? 0),
        level3_completed: level3Completed || (existing?.level3_completed ?? false),
        level4_unlocked: level4Unlocked || (existing?.level4_unlocked ?? false),
        last_active_at: now,
        updated_at: now,
      },
      { onConflict: "user_id,module" },
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
