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
// generation switches from a text-to-image model to an image-guided one,
// passing the selfie as an identity reference and the style prompt as the
// setting — the result still looks like the chosen hospitality setting, but
// is guided by the user's own face. No selfie is stored anywhere in
// Supabase: it's uploaded to Fal's own storage only as part of making this
// one call, and only the model's *output* URL (already `.fal.media`, per
// `save/route.ts`'s existing allow-list) is ever eligible to become
// `profiles.profile_photo_url`. Without a selfie, the route is text-to-image
// only (see the Phase 7 comment below for the exact model on each path —
// the image-guided model was changed post-launch and is no longer
// `flux/dev/image-to-image`).
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
//
// Phase 7 (2026-08-21, v4-migration-plan/00-bug-batch-plan.md) — cost
// minimization + identity-preserving selfie generation:
//
// 1. Resolution cap (B3/B4): `image_size: "square_hd"` (1024×1024, Fal's
//    most expensive text-to-image tier) is gone. Both branches now pass an
//    explicit `{width, height}` — DEFAULT_IMAGE_SIZE (512×512) unless the
//    client opts into `highQuality: true`, which steps up to HQ_IMAGE_SIZE
//    (768×768) *and* switches the no-selfie branch from `flux/schnell` to
//    `flux/dev`. There is no `highQuality` control in the UI yet
//    (AiProfilePhotoScreen.tsx) — this is the server-side half of that
//    contract, ready for whenever a "higher quality" toggle is added.
//
// 2. Selfie path switched from `flux/dev/image-to-image` to `fal-ai/flux-pulid`
//    (user decision, 2026-08-20). Root cause of the prior bug: image-to-image's
//    `strength: 0.75` controls how far the model may deviate from the input
//    image — Fal's own default for that model is 0.95 (even less
//    preservation) — and the prompt only described the *setting*, never
//    instructed the model to keep the subject's actual features. With
//    enough freedom and no identity anchor, the model reinvented faces
//    (wrong hair colour, wrong skin tone/ethnicity vs. the uploaded photo).
//    That's expected behaviour for denoising-strength image-to-image, not a
//    misconfiguration — it was never designed to lock facial identity, only
//    to partially blend pixels. PuLID preserves identity via ID embedding
//    instead, which is architecturally the right tool for "same person,
//    restyled into a new setting."
//
//    Field names below (`reference_image_url`, `id_weight`, `true_cfg`,
//    `image_size`) were confirmed against the installed @fal-ai/client
//    1.10.1's real type defs (types/endpoints.d.ts, `FluxPulidInput` /
//    `"fal-ai/flux-pulid"` endpoint entry) before writing this, per the
//    same discipline already documented above for flux/dev/flux/schnell —
//    this is a distinct, real type (not FluxDevInput's shape reused).
//    `reference_image_url` is typed `string | Blob | File`, so passing a
//    Blob directly and letting the client's own transformInput upload it
//    would have worked — but per the migration decision we upload via
//    `fal.storage.upload()` explicitly and pass the resulting URL, so the
//    upload is visible as its own awaited step rather than implicit
//    library behavior.
//
//    Unlike the old image-to-image branch, PuLID does NOT inherit the
//    reference image's dimensions (it's ID-conditioned generation, not
//    pixel-blend img2img) — image_size is pinned explicitly here for
//    exactly that reason; leaving it unset would silently regress the
//    512/768 cost cap the same way the old `square_hd` default did.
//
//    `id_weight: 1.2` / `true_cfg: 1.5` sit slightly above PuLID's own
//    documented defaults (1 / 1) — a modest bias toward facial likeness
//    over prompt adherence, on top of the model swap itself. The prompt
//    also gets an explicit "preserve identity" instruction appended as a
//    cheap belt-and-suspenders measure alongside the model change.

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

// Cost-minimization (Phase 7, B4): default to the cheapest square tier;
// only step up when explicitly requested. Fal's "square_hd" (1024×1024) was
// previously used unconditionally for text-to-image — meaningfully pricier
// per call than either of these for a feature whose output is a small
// circular avatar.
const DEFAULT_IMAGE_SIZE = { width: 512, height: 512 } as const;
const HQ_IMAGE_SIZE = { width: 768, height: 768 } as const;

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

    // A malformed/empty body previously threw out of req.json() into the
    // catch-all below and came back as a 500 "Generation failed" — a client
    // error reported as a server fault, and one more way "not working" gave
    // no usable signal. Bad input is a 400.
    const body = await req.json().catch(() => null);
    if (body === null || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const styleId = typeof body?.styleId === "string" ? body.styleId : "";
    const style = STYLE_PROMPTS.find((s) => s.id === styleId);
    if (!style) {
      return NextResponse.json({ error: "Invalid style." }, { status: 400 });
    }

    // Explicit opt-in only (B3) — absent/false always stays on the cheap
    // defaults (schnell or PuLID at 512×512). Mirrors the existing
    // selfieImage-gates-image-to-image pattern: a flag the client must
    // deliberately set, never an implicit upgrade.
    const highQuality = body?.highQuality === true;
    const imageSize = highQuality ? HQ_IMAGE_SIZE : DEFAULT_IMAGE_SIZE;

    let imageUrl: string | undefined;

    if (body?.selfieImage !== undefined) {
      const selfie = parseSelfieDataUrl(body.selfieImage);
      if (!selfie) {
        return NextResponse.json({ error: "Invalid photo." }, { status: 400 });
      }

      // PuLID, not flux/dev/image-to-image — see the header comment above
      // for the identity-preservation root cause and the field-by-field
      // type check against @fal-ai/client's real FluxPulidInput. Upload the
      // selfie to Fal's storage ourselves first: reference_image_url wants
      // a URL, and the migration decision was explicit upload over relying
      // on the client's implicit Blob-transform behavior.
      const referenceImageUrl = await fal.storage.upload(
        new Blob([Uint8Array.from(selfie.buffer)], { type: selfie.mime }),
      );

      const result = await fal.subscribe("fal-ai/flux-pulid", {
        input: {
          reference_image_url: referenceImageUrl,
          prompt: `${style.prompt}, preserve the exact facial identity, skin tone, and hair color of the reference photo`,
          id_weight: 1.2, // slightly above the 1.0 default — bias toward likeness over prompt
          true_cfg: 1.5, // modest prompt adherence without overpowering identity
          // Unlike flux/dev/image-to-image, PuLID does not inherit the
          // reference image's dimensions — pinning this explicitly is what
          // keeps the 512/768 cost cap intact for this branch too.
          image_size: imageSize,
        },
      });
      imageUrl = result.data.images?.[0]?.url;
    } else {
      // No selfie: text-to-image. Model only steps up from schnell to dev
      // when highQuality is explicitly true — same cost-tiering B3/B4 need.
      const result = highQuality
        ? await fal.subscribe("fal-ai/flux/dev", {
            input: {
              prompt: style.prompt,
              image_size: imageSize,
              num_inference_steps: 28,
            },
          })
        : await fal.subscribe("fal-ai/flux/schnell", {
            input: {
              prompt: style.prompt,
              image_size: imageSize,
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
