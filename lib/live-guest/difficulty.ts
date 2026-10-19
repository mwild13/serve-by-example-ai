/**
 * difficulty.ts – the guest gets harder as the person improves (Rich update,
 * Phase 7). Every guest stays open; what changes is how they play.
 *
 *   1 Patient   a beginner. Starts one mood higher and forgives a slip.
 *   2 Everyday  the brief as written.
 *   3 Tough     starts one mood lower, pushes back once, little patience.
 *
 * One step up for each of: the guest's module is mastered (verify quiz
 * passed), this guest has been passed before, and 10 or more modules are
 * mastered. The level is fixed when a conversation starts.
 */

import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { GuestBrief, Mood } from "@/lib/live-guest/guests";
import type { GuestDifficulty } from "@/lib/live-guest-client";

/** Mastered modules that count as experienced. */
const EXPERIENCED_MODULES = 10;
/** Below this, a person is offered gentle guests first. */
const SETTLED_MODULES = 3;
const MAX_SUGGESTED = 3;

export type GuestProgress = {
  masteredModules: Set<number>;
  passedGuests: Set<string>;
};

export function guestDifficulty(brief: GuestBrief, progress: GuestProgress): GuestDifficulty {
  let steps = 0;
  if (progress.masteredModules.has(brief.moduleId)) steps++;
  if (progress.passedGuests.has(brief.id)) steps++;
  if (progress.masteredModules.size >= EXPERIENCED_MODULES) steps++;
  return Math.min(3, 1 + steps) as GuestDifficulty;
}

/** The guest's mood when the conversation opens, at this difficulty. */
export function startMoodFor(brief: GuestBrief, difficulty: GuestDifficulty): Mood {
  if (difficulty === 1) return Math.max(brief.startMood, Math.min(4, brief.startMood + 1)) as Mood;
  // Never opens fuming: a guest at 1 could walk out on the first reply.
  if (difficulty === 3) return (brief.startMood <= 2 ? brief.startMood : brief.startMood - 1) as Mood;
  return brief.startMood;
}

/**
 * The few guests to offer first: not yet passed, within the person's level
 * (gentle guests for a beginner), the hardest they're ready for first, and
 * within that, modules they've mastered.
 */
export function suggestedGuestIds(briefs: GuestBrief[], progress: GuestProgress, available: (b: GuestBrief) => boolean): Set<string> {
  const mastered = progress.masteredModules.size;
  const reach = mastered >= EXPERIENCED_MODULES ? 3 : mastered >= SETTLED_MODULES ? 2 : 1;
  const picks = briefs
    .filter((b) => available(b) && !progress.passedGuests.has(b.id) && b.level <= reach)
    .sort((a, b) => {
      if (a.level !== b.level) return b.level - a.level;
      return Number(progress.masteredModules.has(b.moduleId)) - Number(progress.masteredModules.has(a.moduleId));
    })
    .slice(0, MAX_SUGGESTED);
  return new Set(picks.map((b) => b.id));
}

/** What the difficulty is worked out from: mastered modules and guests already passed. */
export async function loadGuestProgress(admin: SupabaseClient, userId: string): Promise<GuestProgress> {
  const [mastery, sessions] = await Promise.all([
    admin
      .from("scenario_mastery")
      .select("module_id")
      .eq("user_id", userId)
      .eq("scenario_type", "quiz")
      .eq("is_mastered", true)
      .is("archived_at", null),
    admin
      .from("live_guest_sessions")
      .select("guest_id, passed:result->passed")
      .eq("user_id", userId)
      .neq("status", "active"),
  ]);
  if (mastery.error) throw mastery.error;
  if (sessions.error) throw sessions.error;

  const masteredModules = new Set<number>();
  for (const row of (mastery.data ?? []) as { module_id: number | null }[]) {
    if (row.module_id != null) masteredModules.add(row.module_id);
  }
  const passedGuests = new Set<string>();
  for (const row of (sessions.data ?? []) as unknown as { guest_id: string; passed: unknown }[]) {
    if (row.passed === true) passedGuests.add(row.guest_id);
  }
  return { masteredModules, passedGuests };
}
