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
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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
