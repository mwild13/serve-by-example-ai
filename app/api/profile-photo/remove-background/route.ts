import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { DAILY_GENERATION_LIMIT, generationsUsedToday } from "@/lib/profile-photo-cap";
import { getFalClient, BG_REMOVE_MODEL, classifyFalError } from "@/lib/fal";

// Replaces app/api/profile-photo/generate/route.ts (face-swap, deleted).
// The client sends its own auto-cropped 1:1 selfie; this route strips its
// background via Fal and returns a transparent-PNG cutout. Compositing onto
// a chosen hospitality background happens entirely client-side (see
// lib/photo-composite.ts) — no style/gender selection here at all, and no
// /status route, since Bria is a ~1s model that comfortably fits inside a
// single fal.subscribe() call (unlike the old face-swap model, which needed
// queue+poll to survive Cloudflare's per-invocation subrequest ceiling).

export const dynamic = "force-dynamic";

const SELFIE_DATA_URL_RE = /^data:image\/(png|jpe?g|webp);base64,([A-Za-z0-9+/=]+)$/;
// ~6MB decoded, generous headroom over the client's crop/downscale step —
// this is a backstop against a modified client, not the normal path.
const MAX_SELFIE_BASE64_CHARS = 8_000_000;

function parseSelfieDataUrl(value: unknown): { mime: string; buffer: Buffer } | null {
  if (typeof value !== "string" || value.length > MAX_SELFIE_BASE64_CHARS) return null;
  const match = SELFIE_DATA_URL_RE.exec(value);
  if (!match) return null;
  const mime = `image/${match[1]}`;
  return { mime, buffer: Buffer.from(match[2], "base64") };
}

export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = getClientIp(req);
    // Burst-abuse throttle, layered underneath the durable daily cap below —
    // not a replacement for it (see header comment).
    if (!rateLimit(`remove-bg:user:${user.id}`, 5) || !rateLimit(`remove-bg:ip:${ip}`, 5)) {
      return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
    }

    const body = await req.json().catch(() => null);
    if (body === null || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const selfie = parseSelfieDataUrl(body.image);
    if (!selfie) {
      return NextResponse.json({ error: "Invalid photo." }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();

    // Durable daily cap — checked before any Fal work so a capped-out user
    // can't burn a call on a request we're going to reject anyway. Same
    // mechanism/columns the old face-swap route used, unchanged.
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("profile_photo_generations_today, profile_photo_generations_reset_at")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("[profile-photo/remove-background] Failed to read generation count:", profileError);
      return NextResponse.json({ error: "Couldn't check your daily limit. Please try again." }, { status: 500 });
    }

    const now = new Date();
    const generationsToday = generationsUsedToday(
      profile?.profile_photo_generations_today ?? null,
      profile?.profile_photo_generations_reset_at ?? null,
    );

    if (generationsToday >= DAILY_GENERATION_LIMIT) {
      return NextResponse.json(
        { error: "You've used both photo edits for today. Come back tomorrow.", remaining: 0 },
        { status: 429 },
      );
    }

    if (!process.env.FAL_KEY) {
      // Fails fast with a specific message instead of letting the Fal call
      // hit Fal's API with an empty credential and surface an opaque auth
      // error further down.
      console.error("[profile-photo/remove-background] FAL_KEY is not set in this environment.");
      return NextResponse.json({ error: "Image processing isn't configured in this environment." }, { status: 500 });
    }

    const fal = getFalClient();
    const imageUrl = await fal.storage.upload(new Blob([Uint8Array.from(selfie.buffer)], { type: selfie.mime }));

    // sync_mode: true returns the cutout as an inline data: URI instead of a
    // fal.media CDN URL — confirmed via @fal-ai/client's BGRemoveInput type.
    // This is load-bearing: the browser never loads the cutout as a
    // cross-origin image, which structurally avoids canvas.toBlob() throwing
    // a tainted-canvas SecurityError during compositing.
    const { data } = await fal.subscribe(BG_REMOVE_MODEL, {
      input: { image_url: imageUrl, sync_mode: true },
    });

    const cutout = data.image.url;
    if (!cutout.startsWith("data:")) {
      // Fal didn't honor sync_mode for some reason — fail loudly rather than
      // handing the client a cross-origin URL it can't safely draw to canvas.
      console.error("[profile-photo/remove-background] Expected a data: URI, got:", cutout.slice(0, 64));
      return NextResponse.json({ error: "Couldn't process your photo. Please try again." }, { status: 500 });
    }

    // Increment only after a confirmed Fal result — a failed/abandoned call
    // never counts against the cap, same ordering as the old route.
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
      console.error("[profile-photo/remove-background] Failed to record generation count:", incrementError);
    }

    return NextResponse.json({ cutout, remaining: Math.max(0, DAILY_GENERATION_LIMIT - newCount) });
  } catch (error) {
    console.error("[profile-photo/remove-background] Error:", error);
    const { message, detail } = classifyFalError(error);
    return NextResponse.json({ error: message, detail }, { status: 500 });
  }
}
