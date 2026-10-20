import { NextResponse } from "next/server";
import { managementErrorResponse, requireManager } from "@/lib/management/auth";
import { readJsonBody } from "@/lib/ai-guard";
import { GUEST_BRIEFS, findGuest } from "@/lib/live-guest/guests";
import { moduleCategory } from "@/lib/diagnostic-engine";
import { sydneyToday } from "@/lib/venue-content";
import {
  briefing,
  guestOfWeek,
  isGoalKind,
  loadWeekRow,
  suggestedTargets,
  teamGoal,
  teamUserIds,
  weekStartOf,
} from "@/lib/team-week";
import type { GuestOption, ManagerWeek } from "@/lib/team-week-shared";

/** Every guest staff can be sent, for the picker. */
const GUEST_OPTIONS: GuestOption[] = GUEST_BRIEFS.filter((g) => g.reviewed).map((g) => ({
  id: g.id,
  title: g.title,
  level: g.level,
  area: (moduleCategory(g.moduleId) ?? "service") as GuestOption["area"],
}));

export const dynamic = "force-dynamic";

const ROUTE = "/api/management/team-week";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_BODY_BYTES = 1024;
const MAX_TARGET = 100000;

function bad(error: string): Response {
  return NextResponse.json({ error, code: "INVALID_INPUT" }, { status: 400 });
}

type Gate = Extract<Awaited<ReturnType<typeof requireManager>>, { ok: true }>["ctx"];

async function weekResponse(ctx: Gate, venueId: string): Promise<Response> {
  const today = sydneyToday();
  const weekStart = weekStartOf(today);
  const [venue, team, row] = await Promise.all([
    ctx.admin.from("venues").select("name").eq("id", venueId).maybeSingle(),
    teamUserIds(ctx.admin, venueId),
    loadWeekRow(ctx.admin, venueId, weekStart),
  ]);
  const [goal, guest, brief] = await Promise.all([
    teamGoal(ctx.admin, row, team, weekStart),
    guestOfWeek(ctx.admin, row?.guest_id ?? null, team, weekStart),
    briefing(ctx.admin, venueId, team, today),
  ]);
  const week: ManagerWeek = {
    venueName: (venue.data?.name as string | undefined) ?? "Your venue",
    weekStart,
    teamSize: team.length,
    goal,
    guest,
    briefing: brief,
    suggested: suggestedTargets(team.length),
  };
  return NextResponse.json({ week, guests: GUEST_OPTIONS });
}

/** This week at a venue: the goal, the guest of the week and the briefing card (Rich update, Phase 16). */
export async function GET(req: Request) {
  const gate = await requireManager(req, { rateKey: "mgmt-team-week", limit: 60 });
  if (!gate.ok) return gate.response;
  try {
    const venueId = new URL(req.url).searchParams.get("venueId");
    if (!venueId || !UUID_PATTERN.test(venueId)) return bad("Choose a venue.");
    await gate.ctx.assertOwnsVenue(venueId);
    return await weekResponse(gate.ctx, venueId);
  } catch (error) {
    return managementErrorResponse(error, "Could not load this week.", ROUTE, 500);
  }
}

/**
 * Sets this week's goal and guest of the week:
 * { venueId, goal: { kind, target } | null, guestId: string | null }.
 * Either can be left out to keep it; null clears it.
 */
export async function PUT(req: Request) {
  const gate = await requireManager(req, { rateKey: "mgmt-team-week-set", limit: 20 });
  if (!gate.ok) return gate.response;
  const ctx = gate.ctx;
  try {
    const read = await readJsonBody(req, MAX_BODY_BYTES);
    if (!read.ok) return read.response;
    const { venueId, goal, guestId } = read.body;
    if (typeof venueId !== "string" || !UUID_PATTERN.test(venueId)) return bad("Choose a venue.");
    await ctx.assertOwnsVenue(venueId);

    const weekStart = weekStartOf(sydneyToday());
    const existing = await loadWeekRow(ctx.admin, venueId, weekStart);
    const row: Record<string, unknown> = {
      venue_id: venueId,
      week_start: weekStart,
      goal_kind: existing?.goal_kind ?? null,
      goal_target: existing?.goal_target ?? null,
      guest_id: existing?.guest_id ?? null,
      updated_by: ctx.user.id,
      updated_at: new Date().toISOString(),
    };
    if (goal === null) {
      row.goal_kind = null;
      row.goal_target = null;
    } else if (goal !== undefined) {
      const { kind, target } = (goal ?? {}) as Record<string, unknown>;
      if (!isGoalKind(kind)) return bad("Choose what to count.");
      if (!Number.isInteger(target) || (target as number) < 1 || (target as number) > MAX_TARGET) return bad("Set a target of 1 or more.");
      row.goal_kind = kind;
      row.goal_target = target;
    }
    if (guestId === null) row.guest_id = null;
    else if (guestId !== undefined) {
      if (typeof guestId !== "string" || !findGuest(guestId)) return bad("That guest isn't available.");
      row.guest_id = guestId;
    }

    const { error } = await ctx.admin.from("venue_weeks").upsert(row, { onConflict: "venue_id,week_start" });
    if (error) throw error;
    return await weekResponse(ctx, venueId);
  } catch (error) {
    return managementErrorResponse(error, "Could not save this week.", ROUTE, 500);
  }
}
