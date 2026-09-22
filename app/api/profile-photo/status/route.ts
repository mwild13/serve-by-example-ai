import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { DAILY_GENERATION_LIMIT, generationsUsedToday } from "@/lib/profile-photo-cap";
import { getFalClient, FACE_SWAP_MODEL, classifyFalError } from "@/lib/fal";

// Companion to generate/route.ts's queue submit for the selfie/face-swap
// path — see the comment there for why this route exists (Cloudflare
// Workers' 50-subrequest-per-invocation cap vs. fal.subscribe()'s internal
// poll-until-done loop). The client polls this route every couple of
// seconds after a submit; each call here does at most two Fal subrequests
// (status, then result once COMPLETED), so it stays well under that limit
// no matter how many times the client polls or how long the face-swap
// takes.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Higher ceiling than generate/route.ts's burst limit (5/min) on
    // purpose — the client polls this route every couple of seconds for up
    // to ~2 minutes per generation, which is legitimate traffic here, not
    // abuse.
    const ip = getClientIp(req);
    if (!rateLimit(`profile-photo-status:user:${user.id}`, 60) || !rateLimit(`profile-photo-status:ip:${ip}`, 60)) {
      return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
    }

    const requestId = new URL(req.url).searchParams.get("requestId");
    if (!requestId) {
      return NextResponse.json({ error: "Missing requestId." }, { status: 400 });
    }

    const fal = getFalClient();
    const status = await fal.queue.status(FACE_SWAP_MODEL, { requestId, logs: false });

    if (status.status !== "COMPLETED") {
      return NextResponse.json({ status: "pending" });
    }

    const result = await fal.queue.result(FACE_SWAP_MODEL, { requestId });
    // Defensive: face-swap endpoints commonly return a single `image`
    // rather than an `images` array like the flux family did — accept
    // either shape rather than assuming one.
    const imageUrl = result.data.images?.[0]?.url ?? result.data.image?.url;
    if (!imageUrl) {
      return NextResponse.json({ error: "Failed to generate image" }, { status: 500 });
    }

    // Only incremented here, on a confirmed completed result — not at
    // submit time in generate/route.ts — so a failed or abandoned
    // generation never counts against the daily cap, same guarantee the
    // original single-request implementation had.
    const admin = createSupabaseAdminClient();
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("profile_photo_generations_today, profile_photo_generations_reset_at")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("[profile-photo/status] Failed to read generation count:", profileError);
      return NextResponse.json({ error: "Couldn't check your daily limit. Please try again." }, { status: 500 });
    }

    const now = new Date();
    const generationsToday = generationsUsedToday(
      profile?.profile_photo_generations_today ?? null,
      profile?.profile_photo_generations_reset_at ?? null,
    );
    const newCount = generationsToday + 1;

    const { error: incrementError } = await admin
      .from("profiles")
      .update({
        profile_photo_generations_today: newCount,
        profile_photo_generations_reset_at: now.toISOString(),
      })
      .eq("id", user.id);

    if (incrementError) {
      // Don't fail the request over a bookkeeping write — the user already
      // has a valid result. Worst case, the count under-tracks by one.
      console.error("[profile-photo/status] Failed to record generation count:", incrementError);
    }

    return NextResponse.json({
      status: "completed",
      url: imageUrl,
      remaining: Math.max(0, DAILY_GENERATION_LIMIT - newCount),
    });
  } catch (error) {
    console.error("[profile-photo/status] Error:", error);
    // Always include `detail` — see generate/route.ts's catch block for why
    // the earlier branch/NODE_ENV gate on this was removed.
    const { message, detail } = classifyFalError(error);

    return NextResponse.json({ error: message, detail }, { status: 500 });
  }
}
