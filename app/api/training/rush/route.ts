import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getUserFromRequest } from "@/lib/supabase-server";
import { rateLimit } from "@/lib/rate-limit";
import { readJsonBody } from "@/lib/ai-guard";
import { reportError } from "@/lib/report-error";
import { RUSH_LENGTH, playRush, rushResult, type RushMove } from "@/lib/rush/engine";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 2048;

type Stats = { best: number | null; shifts: number };

async function loadStats(userId: string): Promise<Stats> {
  const admin = createSupabaseAdminClient();
  const [best, count] = await Promise.all([
    admin.from("rush_runs").select("score").eq("user_id", userId).order("score", { ascending: false }).limit(1).maybeSingle(),
    admin.from("rush_runs").select("id", { count: "exact", head: true }).eq("user_id", userId),
  ]);
  if (best.error) throw best.error;
  if (count.error) throw count.error;
  return { best: (best.data?.score as number | undefined) ?? null, shifts: count.count ?? 0 };
}

/** Moves as the engine takes them, or null if they aren't a whole shift. */
function readMoves(value: unknown): RushMove[] | null {
  if (!Array.isArray(value) || value.length !== RUSH_LENGTH) return null;
  const moves: RushMove[] = [];
  for (const m of value) {
    if (!m || typeof m !== "object") return null;
    const { pick, barback } = m as Record<string, unknown>;
    if (pick !== null && !(Number.isInteger(pick) && (pick as number) >= 0 && (pick as number) < 10)) return null;
    if (barback !== undefined && typeof barback !== "boolean") return null;
    moves.push({ pick: pick as number | null, barback: barback === true });
  }
  return moves;
}

/** The person's best Saturday Rush score and how many shifts they've finished (Rich update, Phase 15). */
export async function GET(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    if (!rateLimit(`rush-stats:user:${user.id}`, 30)) {
      return NextResponse.json({ error: "Too many requests. Try again in a minute.", code: "RATE_LIMITED" }, { status: 429 });
    }
    return NextResponse.json(await loadStats(user.id));
  } catch (error) {
    console.error("rush GET error:", error);
    // The game still plays; it just doesn't show a best yet.
    return NextResponse.json({ best: null, shifts: 0 } satisfies Stats);
  }
}

/**
 * Saves a finished shift: { seed, moves }. The score is worked out here by
 * replaying the seed and the moves with lib/rush/engine.ts, so it's the
 * server's number, not the browser's. A resent save is stored once.
 */
export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    if (!rateLimit(`rush-save:user:${user.id}`, 10)) {
      return NextResponse.json({ error: "Too many requests. Try again in a minute.", code: "RATE_LIMITED" }, { status: 429 });
    }
    const read = await readJsonBody(req, MAX_BODY_BYTES);
    if (!read.ok) return read.response;
    const { seed } = read.body;
    const moves = readMoves(read.body.moves);
    if (!Number.isInteger(seed) || (seed as number) < 0 || (seed as number) >= 2 ** 32 || !moves) {
      return NextResponse.json({ error: "Invalid shift.", code: "INVALID_REQUEST" }, { status: 400 });
    }

    const run = playRush(seed as number, moves);
    if (run.current !== null) return NextResponse.json({ error: "That shift isn't finished.", code: "INVALID_REQUEST" }, { status: 400 });
    const result = rushResult(run);

    const admin = createSupabaseAdminClient();
    const { error } = await admin
      .from("rush_runs")
      .upsert(
        { user_id: user.id, seed, moves, score: result.score, result },
        { onConflict: "user_id,seed", ignoreDuplicates: true },
      );
    if (error) throw error;
    return NextResponse.json({ result, ...(await loadStats(user.id)) });
  } catch (error) {
    console.error("rush POST error:", error);
    await reportError(error, { route: "/api/training/rush", url: req.url });
    return NextResponse.json({ error: "Your shift couldn't be saved this time.", code: "SAVE_FAILED" }, { status: 500 });
  }
}
