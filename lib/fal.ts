// Shared Fal client factory + error classification for the AI Portrait
// feature (app/api/profile-photo/generate, app/api/profile-photo/status) —
// the only two routes in this codebase that call Fal.
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

// Not easel-ai/advanced-face-swap — that model is marked "no longer
// supported" by Fal (confirmed via fal.ai/models/easel-ai/advanced-face-swap/api
// and its own OpenAPI schema) and its real input fields
// (face_image_0/gender_0/workflow_type) don't match what this app sends.
// fal-ai/face-swap's schema is exactly base_image_url/swap_image_url in,
// { image } out.
export const FACE_SWAP_MODEL = "fal-ai/face-swap";

export function getFalClient() {
  return createFalClient({ credentials: process.env.FAL_KEY });
}

/**
 * Maps a caught error from a Fal call to a user-facing message plus a debug
 * detail string. Centralised so generate/route.ts (submit) and
 * status/route.ts (poll + result) can't drift out of sync on this
 * classification — this exact logic already had one bug this session from
 * being reasoned about in only one place.
 */
export function classifyFalError(error: unknown): { message: string; detail: string } {
  let message = "Generation failed. Please try again.";
  if (error instanceof ValidationError) {
    message = "Your photo couldn't be processed by the image model. Try a different photo.";
  } else if (error instanceof ApiError) {
    message = error.status === 401 || error.status === 403
      ? "Image generation isn't configured correctly in this environment."
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
