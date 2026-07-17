import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function GET(req: Request) {
  const { user } = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const venueId = url.searchParams.get("venueId");
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "40"), 100);

  const admin = createSupabaseAdminClient();

  // Fetch last N messages, newest first, then reverse for chronological display
  const query = admin
    .from("manager_coach_sessions")
    .select("id, role, content, created_at")
    .eq("manager_user_id", user.id)
    .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order("created_at", { ascending: false })
    .limit(limit);

  if (venueId) query.eq("venue_id", venueId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Reverse to chronological order for display
  const messages = (data ?? []).reverse().map((row) => ({
    role: row.role as "user" | "coach",
    content: row.content as string,
  }));

  return NextResponse.json({ messages });
}

export async function POST(req: Request) {
  const { user } = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as Record<string, unknown>;
  const venueId = typeof body.venueId === "string" ? body.venueId : null;
  const messages = Array.isArray(body.messages) ? body.messages : [];

  if (messages.length === 0) return NextResponse.json({ ok: true });

  const admin = createSupabaseAdminClient();

  const rows = messages
    .filter((m): m is { role: string; content: string } =>
      typeof m === "object" && m !== null &&
      typeof m.role === "string" && typeof m.content === "string"
    )
    .map((m) => ({
      manager_user_id: user.id,
      venue_id: venueId,
      role: m.role,
      content: m.content,
    }));

  if (rows.length === 0) return NextResponse.json({ ok: true });

  const { error } = await admin.from("manager_coach_sessions").insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
