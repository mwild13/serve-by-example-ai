// Shared Fal client factory + error classification for the AI Profile Photo
// feature (app/api/profile-photo/remove-background) — the only route in
// this codebase that calls Fal.
//
// createFalClient(), not the deprecated `fal` singleton + fal.config()
// (see @fal-ai/client's own index.d.ts: that singleton is documented as "a
// compatibility layer for existing code that uses the client version prior
// to 1.0.0"). A client configured once at import time and reused across
// requests is the exact anti-pattern OpenNext's own Cloudflare Workers
// troubleshooting guide warns against for global clients — built fresh per
// call instead, like getOpenAIClient()/getStripeClient() elsewhere in this
// codebase.
import { createFalClient, ApiError, ValidationError } from "@fal-ai/client";

// Replaces the retired face-swap pipeline (fal-ai/face-swap, itself a
// replacement for the deprecated easel-ai/advanced-face-swap). The new
// product mechanism keeps the user's real photo intact and only strips its
// background — no face manipulation, so the face-swap distortion/bias
// failure mode is gone entirely. Confirmed via @fal-ai/client's own type
// defs (BGRemoveInput/BriaBackgroundRemoveInput) that this model accepts
// `sync_mode: true` to return the cutout as an inline data: URI instead of
// a fal.media CDN URL — see remove-background/route.ts for why that matters.
export const BG_REMOVE_MODEL = "fal-ai/bria/background/remove";

export function getFalClient() {
  return createFalClient({ credentials: process.env.FAL_KEY });
}

/**
 * Maps a caught error from a Fal call to a user-facing message plus a debug
 * detail string. Centralised so any future second call site can't drift out
 * of sync on this classification — this exact logic already had one bug
 * this session from being reasoned about in only one place.
 */
export function classifyFalError(error: unknown): { message: string; detail: string } {
  let message = "Couldn't process your photo. Please try again.";
  if (error instanceof ValidationError) {
    message = "Your photo couldn't be processed by the image model. Try a different photo.";
  } else if (error instanceof ApiError) {
    message = error.status === 401 || error.status === 403
      ? "Image processing isn't configured correctly in this environment."
      : "The image service couldn't process this request. Please try again.";
  }

  // For a ValidationError, `error.message` is usually just the generic HTTP
  // status text — @fal-ai/client's response handler falls back to
  // `statusText` whenever the JSON body has no top-level `message` field,
  // which a FastAPI/Pydantic 422 body never does (it uses `detail` instead).
  // Prefer the parsed field errors when present.
  let detail = error instanceof Error ? error.message : String(error);
  if (error instanceof ValidationError && error.fieldErrors.length > 0) {
    detail = error.fieldErrors.map((fe) => `${fe.loc.join(".")}: ${fe.msg}`).join("; ");
  }

  return { message, detail };
}
