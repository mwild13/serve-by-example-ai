import { NextResponse } from "next/server";
import { fal, ApiError, ValidationError } from "@fal-ai/client";
import { getUserFromRequest } from "@/lib/supabase-server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// Phase C file 08, Half B — AI Profile Photo. Net-new feature, no V3
// extraction (see v4-migration-plan/08-onboarding-diagnostic-and-profile.md).
// Model corrected from the plan's original `gpt-image-2` recommendation: the
// user opted for Fal.ai's `fal-ai/flux/schnell` model instead (~$0.003/image,
// materially cheaper than gpt-image-2 tiers) — decision made 2026-08-18,
// superseding the plan doc's "Locked Decision #1" cost callout.
//
// The 10 style prompts live here, server-side only, keyed by a stable `id`
// the client selects from a matching id/label/thumbnail list in
// AiProfilePhotoScreen.tsx — the client never sends free-text prompt content.
// This isn't just tidiness: without it, this route would be an unauthenticated-
// looking (it's auth-gated, but still) arbitrary-prompt image generator with
// real per-call cost, which is the exact abuse shape the plan's rate-limit
// section warned about.
//
// This route only generates and returns a preview URL — it does NOT persist
// to `profiles.profile_photo_url`. Persistence happens in
// `app/api/profile-photo/save/route.ts`, called only when the user taps
// "Save Portrait." Auto-saving on every generate would silently overwrite a
// user's existing portrait with whatever style they last previewed, even if
// they never confirmed it — same "don't fabricate/assume state" discipline
// applied elsewhere in this migration, just applied to writes instead of
// mock data.
//
// Live-QA fix (2026-08-19): reported "No place to take photo on ai photo
// page" — accurate at the time, since generation never referenced the user
// at all (pure text-to-image). This route now accepts an optional
// `selfieImage` (a client-downscaled data: URL, capped below). When present,
// generation switches from `flux/schnell` (text-to-image) to
// `flux/dev/image-to-image`, passing the selfie as the reference image and
// the style prompt as the transformation — the result still looks like the
// chosen hospitality setting, but is guided by the user's own photo. No
// selfie is stored anywhere in Supabase: the fal client uploads it to Fal's
// own storage only as part of making this one call (auto-handled by
// `transformInput`/the Blob input), and only the model's *output* URL
// (already `.fal.media`, per `save/route.ts`'s existing allow-list) is ever
// eligible to become `profiles.profile_photo_url`. Without a selfie, the
// route behaves exactly as before — schnell, text-to-image only.
//
// Diagnostic fix (2026-08-19): reported "AI photo generation not working."
// The flux/dev/image-to-image and flux/schnell payloads were re-checked
// field-by-field against the installed @fal-ai/client 1.10.1 type defs
// (FluxDevImageToImageInput / FluxDevInput) and are correct — image_url/
// prompt/strength and prompt/image_size/num_inference_steps all match. The
// real gap was error visibility: the catch-all below always returned a flat
// "Generation failed" no matter the cause (missing FAL_KEY, a Fal auth/
// validation rejection, a timeout), which made "not working" mean "no
// signal to diagnose from," both server- and client-side. Fixed by: (1)
// failing fast with a distinct message when FAL_KEY isn't configured
// instead of letting Fal's own opaque auth error surface; (2) branching on
// @fal-ai/client's ApiError/ValidationError types for a specific, still
// user-safe message per failure class; (3) always logging the full error
// server-side, and echoing a `detail` field in the JSON response outside
// production only (never reaches the deployed client-facing build).

export const dynamic = "force-dynamic";

type StylePrompt = { id: string; prompt: string };

const STYLE_PROMPTS: StylePrompt[] = [
  { id: "classic-bar", prompt: "Professional bartender headshot in a classic wooden bar setting, soft warm lighting, professional uniform" },
  { id: "fine-dining", prompt: "Professional sommelier headshot in an upscale fine dining restaurant, elegant ambient lighting, formal attire" },
  { id: "cocktail-lounge", prompt: "Modern mixologist headshot in a chic mood-lit cocktail lounge, sleek aesthetic, high-end hospitality portrait" },
  { id: "hotel-lobby", prompt: "Luxury hotel concierge staff headshot in a bright grand lobby, polished executive appearance" },
  { id: "rooftop-bar", prompt: "Trendy bartender headshot on a golden hour rooftop bar, cityscape background, vibrant modern portrait" },
  { id: "wine-cellar", prompt: "Expert wine server headshot inside an authentic rustic wine cellar, moody warm lighting, refined style" },
  { id: "coffee-house", prompt: "Artisan barista headshot in a modern craft coffee shop, warm cozy aesthetic, friendly professional look" },
  { id: "beach-club", prompt: "Resort hospitality staff headshot in a bright beach club setting, clean natural daylight, relaxed luxury style" },
  { id: "speakeasy", prompt: "Vintage craft bartender headshot in a secret speakeasy lounge, dramatic shadows, timeless hospitality style" },
  { id: "corporate", prompt: "Hospitality manager professional headshot, neutral modern backdrop, clean crisp business attire" },
];

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

export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = getClientIp(req);
    // Stricter than the 20/min text-route norm — each call has real,
    // non-trivial per-image cost (Fal Flux Schnell, ~$0.003/image), unlike
    // the cheap gpt-4o-mini text routes elsewhere in this plan.
    if (!rateLimit(`profile-photo:user:${user.id}`, 5) || !rateLimit(`profile-photo:ip:${ip}`, 5)) {
      return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
    }

    if (!process.env.FAL_KEY) {
      // Fails fast with a specific message instead of letting fal.subscribe()
      // hit Fal's API with an empty credential and surface an opaque auth
      // error further down — the single most likely cause of "not working"
      // in a fresh local checkout where FAL_KEY is only set in Cloudflare.
      console.error("[profile-photo/generate] FAL_KEY is not set in this environment.");
      return NextResponse.json({ error: "Image generation isn't configured in this environment." }, { status: 500 });
    }

    const body = await req.json();
    const styleId = typeof body?.styleId === "string" ? body.styleId : "";
    const style = STYLE_PROMPTS.find((s) => s.id === styleId);
    if (!style) {
      return NextResponse.json({ error: "Invalid style." }, { status: 400 });
    }

    let imageUrl: string | undefined;

    if (body?.selfieImage !== undefined) {
      const selfie = parseSelfieDataUrl(body.selfieImage);
      if (!selfie) {
        return NextResponse.json({ error: "Invalid photo." }, { status: 400 });
      }

      const result = await fal.subscribe("fal-ai/flux/dev/image-to-image", {
        input: {
          image_url: new Blob([Uint8Array.from(selfie.buffer)], { type: selfie.mime }),
          prompt: style.prompt,
          strength: 0.75,
        },
      });
      imageUrl = result.data.images?.[0]?.url;
    } else {
      const result = await fal.subscribe("fal-ai/flux/schnell", {
        input: {
          prompt: style.prompt,
          image_size: "square_hd",
          num_inference_steps: 4,
        },
      });
      imageUrl = result.data.images?.[0]?.url;
    }

    if (!imageUrl) {
      return NextResponse.json({ error: "Failed to generate image" }, { status: 500 });
    }

    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    console.error("[profile-photo/generate] Error:", error);

    // Branch on @fal-ai/client's own error types so the message actually
    // says something about *why* generation failed, without ever leaking
    // Fal's raw response body (which can include the request payload) to
    // the client in production.
    let message = "Generation failed. Please try again.";
    if (error instanceof ValidationError) {
      message = "The photo or style was rejected by the image model. Try a different photo.";
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
