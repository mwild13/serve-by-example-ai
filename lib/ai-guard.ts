/**
 * ai-guard.ts – Shared prompt-injection hardening for OpenAI-backed routes.
 *
 * Untrusted text (staff responses, client-supplied scenarios, pasted menus)
 * is wrapped in XML-style tags so the model can tell data from instructions,
 * and any copy of those tags inside the text is stripped so a response can't
 * close its own block and append a fake "assessor note". Model output is
 * parsed here too, so a non-JSON reply (e.g. a leaked system prompt) is
 * logged server-side and never echoed back to the client.
 *
 * See docs/handoff/security/2026-09-26-ai-prompt-injection-audit.md.
 */

/** Removes any opening/closing tag with one of the given names from untrusted text. */
function stripTags(text: string, tags: readonly string[]): string {
  const pattern = new RegExp(`<\\s*/?\\s*(?:${tags.join("|")})\\s*>`, "gi");
  return text.replace(pattern, "");
}

/**
 * Builds a user message from named blocks of untrusted text, e.g.
 * fenceUntrusted({ scenario, staff_response }) →
 * "<scenario>\n...\n</scenario>\n<staff_response>\n...\n</staff_response>"
 */
export function fenceUntrusted(blocks: Record<string, string>): string {
  const tags = Object.keys(blocks);
  return tags
    .map((tag) => `<${tag}>\n${stripTags(blocks[tag], tags)}\n</${tag}>`)
    .join("\n");
}

/** Coerces a model output field to a trimmed string no longer than max characters. */
export function capText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max - 1).trimEnd()}…` : trimmed;
}

/**
 * Parses a model reply as a JSON object. Returns null (after logging the raw
 * text server-side) when it isn't one — callers return a generic 500 and
 * must never send the raw text to the client.
 */
export function parseModelJson(raw: string | null | undefined, route: string): Record<string, unknown> | null {
  if (!raw) {
    console.error(`[${route}] empty model response`);
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // fall through
  }
  console.error(`[${route}] model returned non-JSON output (${raw.length} chars):`, raw.slice(0, 500));
  return null;
}
