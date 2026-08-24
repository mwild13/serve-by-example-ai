import { NextResponse } from "next/server";
import { fal, ApiError, ValidationError } from "@fal-ai/client";
import { getUserFromRequest } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { DAILY_GENERATION_LIMIT, generationsUsedToday } from "@/lib/profile-photo-cap";

// Phase C file 08, Half B — AI Profile Photo. Net-new feature, no V3
// extraction (see v4-migration-plan/08-onboarding-diagnostic-and-profile.md).
//
// The 10 hospitality styles are keyed by a stable `id` the client selects
// from a matching id/label/thumbnail list in AiProfilePhotoScreen.tsx — the
// client never sends free-text prompt content or an arbitrary image URL,
// only `styleId` + `genderId`. This isn't just tidiness: without it, this
// route would be an authenticated-but-arbitrary-input image generator with
// real per-call cost, the exact abuse shape the rate limit below guards
// against.
//
// This route only generates and returns a preview URL — it does NOT persist
// to `profiles.profile_photo_url`. Persistence happens in
// `app/api/profile-photo/save/route.ts`, called only when the user taps
// "Save Portrait." Auto-saving on every generate would silently overwrite a
// user's existing portrait before they've confirmed it.
//
// Phase D (2026-08-25) — consistent-environment architecture + gender
// selector, replacing every model used through "Phase 7 history" below.
// Root problem being solved: a generative model (flux-pulid, flux/schnell)
// resamples the whole scene from a text prompt on every call, so it can
// only hold a background *stylistically* similar between calls, never
// pixel-identical, no matter how the prompt/seed/id_weight is tuned. The
// product ask — "only the face/hair/skin change, the bar/restaurant/
// lighting for a given style stays identical for every user" — needs a
// fixed base image, not a fresh generation each time.
//
// New architecture:
// - Each of the 10 styles has a fixed, pre-shot base portrait per gender:
//   public/mobile/men/ai-style-<id>.png and
//   public/mobile/women/ai-style-<id>.png (20 static assets, produced
//   externally and cropped to a consistent head-and-shoulders framing so
//   there's no arm/hand geometry for the face-swap model to reconcile).
// - No selfie: the matching plate is returned directly as the result — no
//   face to swap in, so there's nothing left for Fal to do. Zero-cost,
//   zero-latency, and it structurally closes the "photo or style was
//   rejected" bug this route used to throw here (that message came from a
//   flux/schnell ValidationError; there's no Fal call on this path anymore
//   for it to come from).
// - With selfie: `easel-ai/advanced-face-swap` (base_image_url = the
//   style's locked plate, swap_image_url = the uploaded selfie) swaps only
//   the face/skin-tone/hair onto that fixed plate, leaving its body,
//   outfit, and background pixel-identical — replacing flux-pulid, which
//   could only approximate "same style," never guarantee it.
// - The old STYLE_PROMPTS text (bartender/sommelier/etc. descriptions) is
//   gone — there's no text-to-image call left on either path to prompt.
//   Each style's environment now lives in its plate images, not as a
//   string in this file.
//
// Durable 2/day cap (also Phase D): lib/rate-limit.ts is an in-memory,
// per-Cloudflare-edge-node limiter — fine as the burst-abuse throttle right
// below, but not durable enough for a hard "2 per calendar day" product
// guarantee (a deploy, or landing on a different edge node, resets it).
// Counted instead in `profiles.profile_photo_generations_today` /
// `_generations_reset_at` (supabase/migrations/20260825_profile_photo_daily_cap.sql):
// checked before any work happens, incremented only after a successful
// result. Every generation counts toward the cap, selfie or not, per
// product decision — otherwise the free no-selfie lookup would be an
// unlimited bypass.
//
// --- Phase 7 (2026-08-21) history, kept for context on the decisions above ---
// The selfie path was originally flux/dev/image-to-image, then switched to
// fal-ai/flux-pulid (2026-08-20) because image-to-image's `strength` only
// partially blends pixels and doesn't lock facial identity — PuLID
// preserves identity via ID embedding instead. PuLID was itself superseded
// by easel-ai/advanced-face-swap above once "pixel-identical background"
// became a hard requirement rather than "stylistically similar."

export const dynamic = "force-dynamic";

const STYLE_IDS = [
  "classic-bar", "fine-dining", "cocktail-lounge", "hotel-lobby", "rooftop-bar",
  "wine-cellar", "coffee-house", "beach-club", "speakeasy", "corporate",
] as const;
type StyleId = (typeof STYLE_IDS)[number];

const GENDER_IDS = ["male", "female"] as const;
type GenderId = (typeof GENDER_IDS)[number];

fal.config({ credentials: process.env.FAL_KEY });

const SELFIE_DATA_URL_RE = /^data:image\/(png|jpe?g|webp);base64,([A-Za-z0-9+/=]+)$/;
// ~6MB decoded, generous headroom over the client's 768px/0.85-quality
// downscale — this is a backstop against a modified client, not the normal
// path (a downscaled photo is typically well under 500KB).
const MAX_SELFIE_BASE64_CHARS = 8_000_000;

function parseSelfieDataUrl(value: unknown): { mime: string; buffer: Buffer } | null {
  if (typeof value !== "string" || value.length > MAX_SELFIE_BASE64_CHARS) return null;
  const match = SELFIE_DATA_URL_RE.exec(value);
  if (!match) return null;
  const mime = `image/${match[1]}`;
  return { mime, buffer: Buffer.from(match[2], "base64") };
}

// Absolute URL for a style's locked base plate — Fal's face-swap call needs
// a URL it can fetch over the public internet, a relative path won't do.
// public/mobile/* is served as a plain static file (middleware.ts excludes
// any dotted path from the geo-block/auth matcher), so this is always
// reachable regardless of the requesting user's own auth/geo state.
function basePlateUrl(origin: string, genderId: GenderId, styleId: StyleId): string {
  const dir = genderId === "male" ? "men" : "women";
  return `${origin}/mobile/${dir}/ai-style-${styleId}.png`;
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
    if (!rateLimit(`profile-photo:user:${user.id}`, 5) || !rateLimit(`profile-photo:ip:${ip}`, 5)) {
      return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
    }

    // A malformed/empty body previously threw out of req.json() into the
    // catch-all below and came back as a 500 — a client error reported as a
    // server fault. Bad input is a 400.
    const body = await req.json().catch(() => null);
    if (body === null || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const styleId = typeof body?.styleId === "string" ? body.styleId : "";
    if (!STYLE_IDS.includes(styleId as StyleId)) {
      return NextResponse.json({ error: "Invalid style." }, { status: 400 });
    }

    const genderId = typeof body?.genderId === "string" ? body.genderId : "";
    if (!GENDER_IDS.includes(genderId as GenderId)) {
      return NextResponse.json({ error: "Invalid gender selection." }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();

    // Durable daily cap — checked before any generation work so a capped-out
    // user can't burn a Fal call on a request we're going to reject anyway.
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("profile_photo_generations_today, profile_photo_generations_reset_at")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("[profile-photo/generate] Failed to read generation count:", profileError);
      return NextResponse.json({ error: "Couldn't check your daily limit. Please try again." }, { status: 500 });
    }

    const now = new Date();
    const generationsToday = generationsUsedToday(
      profile?.profile_photo_generations_today ?? null,
      profile?.profile_photo_generations_reset_at ?? null,
    );

    if (generationsToday >= DAILY_GENERATION_LIMIT) {
      return NextResponse.json(
        { error: "You've used both AI portraits for today. Come back tomorrow.", remaining: 0 },
        { status: 429 },
      );
    }

    const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || new URL(req.url).origin;
    const plateUrl = basePlateUrl(origin, genderId as GenderId, styleId as StyleId);

    let imageUrl: string | undefined;

    if (body?.selfieImage !== undefined) {
      const selfie = parseSelfieDataUrl(body.selfieImage);
      if (!selfie) {
        return NextResponse.json({ error: "Invalid photo." }, { status: 400 });
      }

      if (!process.env.FAL_KEY) {
        // Fails fast with a specific message instead of letting fal.subscribe()
        // hit Fal's API with an empty credential and surface an opaque auth
        // error further down.
        console.error("[profile-photo/generate] FAL_KEY is not set in this environment.");
        return NextResponse.json({ error: "Image generation isn't configured in this environment." }, { status: 500 });
      }

      const referenceImageUrl = await fal.storage.upload(
        new Blob([Uint8Array.from(selfie.buffer)], { type: selfie.mime }),
      );

      const result = await fal.subscribe("easel-ai/advanced-face-swap", {
        input: {
          base_image_url: plateUrl,
          swap_image_url: referenceImageUrl,
        },
      });
      // Defensive: face-swap endpoints commonly return a single `image`
      // rather than an `images` array like the flux family did — accept
      // either shape rather than assuming one.
      imageUrl = result.data.images?.[0]?.url ?? result.data.image?.url;
    } else {
      // No selfie: there's no face to swap in, so the locked plate itself
      // is the whole result.
      imageUrl = plateUrl;
    }

    if (!imageUrl) {
      return NextResponse.json({ error: "Failed to generate image" }, { status: 500 });
    }

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
      console.error("[profile-photo/generate] Failed to record generation count:", incrementError);
    }

    return NextResponse.json({ url: imageUrl, remaining: Math.max(0, DAILY_GENERATION_LIMIT - newCount) });
  } catch (error) {
    console.error("[profile-photo/generate] Error:", error);

    // Fal is only ever called on the selfie/face-swap path now (see header
    // comment) — a Fal-originated error here is genuinely about the
    // uploaded photo, not the style, unlike before Phase D.
    let message = "Generation failed. Please try again.";
    if (error instanceof ValidationError) {
      message = "Your photo couldn't be processed by the image model. Try a different photo.";
    } else if (error instanceof ApiError) {
      message = error.status === 401 || error.status === 403
        ? "Image generation isn't configured correctly in this environment."
        : "The image service couldn't process this request. Please try again.";
    }

    const debug = process.env.NODE_ENV !== "production"
      ? { detail: error instanceof Error ? error.message : String(error) }
      : {};

    return NextResponse.json({ error: message, ...debug }, { status: 500 });
  }
}
