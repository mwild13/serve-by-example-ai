import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getUserFromRequest } from "@/lib/supabase-server";
import { rateLimit } from "@/lib/rate-limit";
import { readJsonBody } from "@/lib/ai-guard";
import { isPushEndpoint, isPushKey, vapidConfig } from "@/lib/web-push";

const MAX_BODY_BYTES = 2048;

/** The public key the browser subscribes with, or null while reminders aren't set up. */
export async function GET(req: Request) {
  const { user } = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  return NextResponse.json({ publicKey: vapidConfig()?.publicKey ?? null });
}

/**
 * Saves this browser's push subscription: { endpoint, keys: { p256dh, auth } }.
 * Only addresses at the known push services are accepted (lib/web-push.ts).
 */
export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    if (!rateLimit(`push-subscribe:user:${user.id}`, 10)) {
      return NextResponse.json({ error: "Too many requests. Try again in a minute.", code: "RATE_LIMITED" }, { status: 429 });
    }
    const read = await readJsonBody(req, MAX_BODY_BYTES);
    if (!read.ok) return read.response;
    const { endpoint, keys } = read.body as { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };
    if (!isPushEndpoint(endpoint) || !isPushKey(keys?.p256dh, 200) || !isPushKey(keys?.auth, 100)) {
      return NextResponse.json({ error: "This browser's notifications can't be used.", code: "INVALID_SUBSCRIPTION" }, { status: 400 });
    }
    const admin = createSupabaseAdminClient();
    const { error } = await admin
      .from("push_subscriptions")
      .upsert({ user_id: user.id, endpoint, p256dh: keys.p256dh, auth: keys.auth }, { onConflict: "endpoint" });
    if (error) throw error;
    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error("push/subscription POST error:", error);
    return NextResponse.json({ error: "Could not turn on notifications.", code: "PUSH_FAILED" }, { status: 500 });
  }
}

/** Forgets this browser's subscription: { endpoint }. */
export async function DELETE(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    const read = await readJsonBody(req, MAX_BODY_BYTES);
    if (!read.ok) return read.response;
    const endpoint = read.body.endpoint;
    if (typeof endpoint !== "string") return NextResponse.json({ error: "Missing endpoint.", code: "INVALID_INPUT" }, { status: 400 });
    const { error } = await createSupabaseAdminClient().from("push_subscriptions").delete().eq("user_id", user.id).eq("endpoint", endpoint);
    if (error) throw error;
    return NextResponse.json({ removed: true });
  } catch (error) {
    console.error("push/subscription DELETE error:", error);
    return NextResponse.json({ error: "Could not turn off notifications.", code: "PUSH_FAILED" }, { status: 500 });
  }
}
