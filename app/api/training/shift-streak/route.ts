import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getUserFromRequest } from "@/lib/supabase-server";
import { rateLimit } from "@/lib/rate-limit";
import { readJsonBody } from "@/lib/ai-guard";
import { cleanReminderTime, cleanShiftDays } from "@/lib/shift-streak";
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

/**
 * Saves the weekdays the person usually works and their reminder time:
 * { shiftDays?: [0..6], reminderTime?: "16:30" | null }. Either can be left
 * out to keep it. Empty days means every day; a null time turns reminders off.
 */
export async function PUT(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    if (!rateLimit(`shift-days:user:${user.id}`, 10)) {
      return NextResponse.json({ error: "Too many requests. Try again in a minute.", code: "RATE_LIMITED" }, { status: 429 });
    }
    const read = await readJsonBody(req, MAX_BODY_BYTES);
    if (!read.ok) return read.response;
    const row: Record<string, unknown> = { user_id: user.id, updated_at: new Date().toISOString() };
    if (read.body.shiftDays !== undefined) {
      const shiftDays = cleanShiftDays(read.body.shiftDays);
      if (!shiftDays) return NextResponse.json({ error: "Choose the days you work.", code: "INVALID_INPUT" }, { status: 400 });
      row.shift_days = shiftDays;
    }
    if (read.body.reminderTime !== undefined) {
      const reminderTime = cleanReminderTime(read.body.reminderTime);
      if (reminderTime === undefined) return NextResponse.json({ error: "Choose a reminder time.", code: "INVALID_INPUT" }, { status: 400 });
      row.reminder_time = reminderTime;
    }
    if (row.shift_days === undefined && row.reminder_time === undefined) {
      return NextResponse.json({ error: "Nothing to save.", code: "INVALID_INPUT" }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const { error } = await admin.from("shift_schedules").upsert(row, { onConflict: "user_id" });
    if (error) throw error;
    return NextResponse.json(await loadShiftStreak(admin, user.id));
  } catch (error) {
    console.error("shift-streak PUT error:", error);
    return NextResponse.json({ error: "Could not save your shift days.", code: "STREAK_FAILED" }, { status: 500 });
  }
}
