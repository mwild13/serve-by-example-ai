/**
 * openai.ts – Shared OpenAI client factory.
 *
 * Single source of truth for constructing the OpenAI client, replacing the
 * identical `getOpenAIClient()` helper that was duplicated across 7 API
 * routes (arena/evaluate, evaluate, coach, management/coach, translate,
 * demo/evaluate, demo/generate-drills). Model choice and prompts stay
 * per-route — this only centralises client construction.
 */

import OpenAI from "openai";

let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}
