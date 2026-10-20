/**
 * openai.ts – Shared OpenAI client factory.
 *
 * Single source of truth for constructing the OpenAI client, replacing the
 * identical `getOpenAIClient()` helper that was duplicated across 7 API
 * routes (arena/evaluate, evaluate, coach, management/coach, translate,
 * demo/evaluate). Prompts stay per-route; the model is shared via
 * CHAT_MODEL_PARAMS so a model change is a one-line edit here.
 */

import OpenAI from "openai";

let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!client) {
    // maxRetries is the SDK default, stated so it isn't removed by accident:
    // a 429 or 5xx is retried twice with backoff, inside each route's timeout.
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, maxRetries: 2 });
  }
  return client;
}

/**
 * Spread into every chat.completions.create() call. gpt-6-luna is a
 * reasoning model: reasoning must be "none" for `temperature` to be accepted
 * and to keep replies inside the routes' short timeouts and output caps.
 */
export const CHAT_MODEL_PARAMS = {
  model: "gpt-6-luna",
  reasoning_effort: "none",
} as const;

/**
 * Live Guest voice (Rich update, Phase 14). Push to talk: the staff member's
 * recording is written out by `transcribe`, goes through the same text turn
 * as a typed reply, and the guest's line is read aloud by `speech`. Set here
 * once, like CHAT_MODEL_PARAMS. About US$0.003 a minute to transcribe and
 * US$0.015 a minute of speech (checked October 2026).
 */
export const VOICE_MODELS = {
  transcribe: "gpt-4o-mini-transcribe",
  speech: "gpt-4o-mini-tts",
} as const;
