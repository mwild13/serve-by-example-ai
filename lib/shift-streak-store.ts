// Reads a person's shift streak from shift_schedules and preshift_days
// (20261025_preshift_streak.sql). The rules are in lib/shift-streak.ts.
import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { computeShiftStreak, type ShiftStreak } from "@/lib/shift-streak";
import { sydneyToday } from "@/lib/venue-content";

/** Pre-shift days read back, newest first. Over a year of shifts. */
const HISTORY_LIMIT = 400;

export async function loadShiftStreak(admin: SupabaseClient, userId: string): Promise<ShiftStreak> {
  const [first, days] = await Promise.all([
    admin.from("shift_schedules").select("shift_days, reminder_time").eq("user_id", userId).maybeSingle(),
    admin.from("preshift_days").select("day").eq("user_id", userId).order("day", { ascending: false }).limit(HISTORY_LIMIT),
  ]);
  // Before 20261026_push_reminders.sql is run there's no reminder_time
  // column (Postgres 42703): read the shift days alone so the streak still shows.
  let schedule: { data: { shift_days?: unknown; reminder_time?: unknown } | null; error: { code?: string } | null } = first;
  if (first.error?.code === "42703") {
    schedule = await admin.from("shift_schedules").select("shift_days").eq("user_id", userId).maybeSingle();
  }
  if (schedule.error) throw schedule.error;
  if (days.error) throw days.error;
  const shiftDays = ((schedule.data?.shift_days as number[] | null) ?? []).filter((d) => Number.isInteger(d));
  const reminder = (schedule.data?.reminder_time as string | null | undefined) ?? null;
  return {
    ...computeShiftStreak(shiftDays, (days.data ?? []).map((r) => r.day as string), sydneyToday()),
    reminderTime: reminder ? reminder.slice(0, 5) : null,
  };
}

/** Records today's pre-shift drill. Once per Sydney day. */
export async function recordPreshiftDay(admin: SupabaseClient, userId: string): Promise<void> {
  const { error } = await admin
    .from("preshift_days")
    .upsert({ user_id: userId, day: sydneyToday() }, { onConflict: "user_id,day", ignoreDuplicates: true });
  if (error) throw error;
}
