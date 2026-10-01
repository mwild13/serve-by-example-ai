import { NextResponse } from "next/server";
import { managementErrorResponse, requireManager } from "@/lib/management/auth";

const MAX_MESSAGES_PER_SAVE = 10;
const MAX_CONTENT_CHARS = 8000;
const VALID_ROLES = new Set(["user", "coach"]);

export async function GET(req: Request) {
  const gate = await requireManager(req, { rateKey: "mgmt-coach-history" });
  if (!gate.ok) return gate.response;
  const { user, admin } = gate.ctx;

  const url = new URL(req.url);
  const venueId = url.searchParams.get("venueId");
  const parsedLimit = parseInt(url.searchParams.get("limit") ?? "40", 10);
  const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 100) : 40;

  // Already scoped to manager_user_id = caller, so a foreign venueId just
  // returns nothing.
  const query = admin
    .from("manager_coach_sessions")
    .select("id, role, content, created_at")
    .eq("manager_user_id", user.id)
    .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order("created_at", { ascending: false })
    .limit(limit);

  if (venueId) query.eq("venue_id", venueId);

  const { data, error } = await query;
  if (error) return managementErrorResponse(error, "Could not load coach history.", "coach/history GET", 500);

  const messages = (data ?? []).reverse().map((row) => ({
    role: row.role as "user" | "coach",
    content: row.content as string,
  }));

  return NextResponse.json({ messages });
}

export async function POST(req: Request) {
  const gate = await requireManager(req, { rateKey: "mgmt-coach-history" });
  if (!gate.ok) return gate.response;
  const { user, admin, assertOwnsVenue } = gate.ctx;

  try {
    const body = await req.json() as Record<string, unknown>;
    const venueId = typeof body.venueId === "string" && body.venueId.trim() ? body.venueId.trim() : null;
    const messages = Array.isArray(body.messages) ? body.messages : [];

    if (messages.length === 0) return NextResponse.json({ ok: true });
    if (messages.length > MAX_MESSAGES_PER_SAVE) {
      return NextResponse.json({ error: "Too many messages in one save." }, { status: 400 });
    }

    if (venueId) await assertOwnsVenue(venueId);

    const rows = messages
      .filter((m): m is { role: string; content: string } =>
        typeof m === "object" && m !== null &&
        typeof m.role === "string" && VALID_ROLES.has(m.role) &&
        typeof m.content === "string" && m.content.length > 0
      )
      .map((m) => ({
        manager_user_id: user.id,
        venue_id: venueId,
        role: m.role,
        content: m.content.slice(0, MAX_CONTENT_CHARS),
      }));

    if (rows.length === 0) return NextResponse.json({ ok: true });

    const { error } = await admin.from("manager_coach_sessions").insert(rows);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return managementErrorResponse(error, "Could not save coach history.", "coach/history POST", 500);
  }
}
