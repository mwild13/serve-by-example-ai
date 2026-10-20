import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getUserFromRequest } from "@/lib/supabase-server";
import { rateLimit } from "@/lib/rate-limit";
import { readJsonBody } from "@/lib/ai-guard";
import { cleanShiftDays } from "@/lib/shift-streak";
import { loadShiftStreak } from "@/lib/shift-streak-store";

const MAX_BODY_BYTES = 256;

/** The person's shift streak and shift days (Rich update, Phase 12). See lib/shift-streak.ts. */
export async function GET(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    if (!rateLimit(`shift-streak:user:${user.id}`, 30)) {
      return NextResponse.json({ error: "Too many requests. Try again in a minute.", code: "RATE_LIMITED" }, { status: 429 });
    }
    return NextResponse.json(await loadShiftStreak(createSupabaseAdminClient(), user.id));
  } catch (error) {
    console.error("shift-streak GET error:", error);
    return NextResponse.json({ error: "Could not load your streak.", code: "STREAK_FAILED" }, { status: 500 });
  }
}

/** Saves the weekdays the person usually works: { shiftDays: [0..6] }. Empty means every day. */
export async function PUT(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    if (!rateLimit(`shift-days:user:${user.id}`, 10)) {
      return NextResponse.json({ error: "Too many requests. Try again in a minute.", code: "RATE_LIMITED" }, { status: 429 });
    }
    const read = await readJsonBody(req, MAX_BODY_BYTES);
    if (!read.ok) return read.response;
    const shiftDays = cleanShiftDays(read.body.shiftDays);
    if (!shiftDays) return NextResponse.json({ error: "Choose the days you work.", code: "INVALID_INPUT" }, { status: 400 });

    const admin = createSupabaseAdminClient();
    const { error } = await admin
      .from("shift_schedules")
      .upsert({ user_id: user.id, shift_days: shiftDays, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    if (error) throw error;
    return NextResponse.json(await loadShiftStreak(admin, user.id));
  } catch (error) {
    console.error("shift-streak PUT error:", error);
    return NextResponse.json({ error: "Could not save your shift days.", code: "STREAK_FAILED" }, { status: 500 });
  }
}
