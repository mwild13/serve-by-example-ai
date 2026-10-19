import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getUserFromRequest } from "@/lib/supabase-server";
import { resolveAccess } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { GUEST_BRIEFS } from "@/lib/live-guest/guests";
import { publicGuest } from "@/lib/live-guest/engine";

export const dynamic = "force-dynamic";

/** The Live Guest picker: every reviewed guest, without the hidden parts of the brief. */
export async function GET(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!rateLimit(`live-guest-list:user:${user.id}`, 30)) {
      return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
    }
    const access = await resolveAccess(createSupabaseAdminClient(), user.id, user.email ?? "");
    const guests = GUEST_BRIEFS.filter((g) => g.reviewed).map((g) => publicGuest(g, access.allowedModules.includes(g.moduleId)));
    return NextResponse.json({ guests }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("live-guest/guests error:", error);
    return NextResponse.json({ error: "Could not load the guests." }, { status: 500 });
  }
}
