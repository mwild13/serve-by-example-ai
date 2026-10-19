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

const DEFAULT_MAX_BODY_BYTES = 16 * 1024;

export type JsonBodyResult =
  | { ok: true; body: Record<string, unknown> }
  | { ok: false; response: Response };

/**
 * Reads a JSON object body with a hard byte cap, before any field validation.
 * `req.json()` buffers and parses the whole body first, so a multi-megabyte
 * POST would be held in isolate memory even though the field caps reject it
 * afterwards. Requiring application/json also forces a CORS preflight, so
 * another site can't make its visitors' browsers spend our rate limits with a
 * text/plain "simple" request.
 */
export type ReadJsonBodyOptions = {
  /**
   * Default true. Set false only on signed-in routes whose callers don't all
   * send a JSON Content-Type: their Authorization header already forces a
   * CORS preflight, so the size cap is the part that matters there.
   */
  requireJsonContentType?: boolean;
};

export async function readJsonBody(
  req: Request,
  maxBytes = DEFAULT_MAX_BODY_BYTES,
  options: ReadJsonBodyOptions = {},
): Promise<JsonBodyResult> {
  const fail = (error: string, status: number): JsonBodyResult => ({
    ok: false,
    response: Response.json({ error }, { status }),
  });

  if (options.requireJsonContentType !== false && !(req.headers.get("content-type") ?? "").toLowerCase().includes("application/json")) {
    return fail("Content-Type must be application/json.", 415);
  }
  const declared = Number(req.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) {
    return fail("Request body too large.", 413);
  }
  if (!req.body) return fail("Invalid JSON body.", 400);

  // Content-Length can be absent (chunked) or wrong, so count while reading.
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      return fail("Request body too large.", 413);
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return { ok: true, body: parsed as Record<string, unknown> };
    }
  } catch {
    // fall through
  }
  return fail("Invalid JSON body.", 400);
}

// Control characters (except tab/newline/CR), zero-width and bidi-override
// characters, and Unicode "tag" characters (U+E0000-E007F, written here as
// their surrogate pairs). None of them render, so they can hide instructions
// from a human reviewer while the model still reads them, and each costs
// tokens. ZWJ/ZWNJ (U+200C/D) are kept because some scripts need them.
const INVISIBLE_CHARS =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F​‎‏‪-‮⁠-⁤⁦-⁩﻿]|\uDB40[\uDC00-\uDC7F]/g;

/** Normalises free text from a user before it goes into a prompt. Validate length on the raw input first. */
export function cleanUserText(text: string): string {
  return text
    .normalize("NFC")
    .replace(INVISIBLE_CHARS, "")
    .replace(/[ \t]{4,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Links a route's own timeout controller to the incoming request's signal, so
 * the OpenAI call is cancelled if the client disconnects (navigates away).
 * Returns a cleanup function to call in `finally`. Best effort: whether the
 * request signal fires on disconnect depends on the runtime.
 */
export function linkAbortSignal(controller: AbortController, signal: AbortSignal | undefined): () => void {
  if (!signal) return () => {};
  if (signal.aborted) {
    controller.abort();
    return () => {};
  }
  const onAbort = () => controller.abort();
  signal.addEventListener("abort", onAbort, { once: true });
  return () => signal.removeEventListener("abort", onAbort);
}

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

/**
 * House style for every AI reply people read, added to each system prompt:
 * Australian English, and no em or en dashes (the owner's rule, 2026-10-19).
 * plainDashes() backs up the punctuation rule on the way out.
 */
export const AU_WRITING_RULES = `WRITING STYLE
- Write in Australian English, never American English.
- Australian spelling: colour, flavour, favour, behaviour, organise, recognise, apologise, realise, prioritise, centre, metre, litre, licence (the noun), cheque, travelling, enrolment.
- Australian words: the bill (not the check), takeaway (not to go), entree means a starter and the main is the main course, soft drink (not soda, though soda water is fine), lift (not elevator), queue (not line), mobile (not cell phone), car park (not parking lot), mum (not mom), toilets or bathroom (not restroom).
- Dates as 19 October 2026, times as 7:30pm, money in Australian dollars.
- Punctuation: commas, full stops, colons and brackets. Never use an em dash or an en dash, not even between numbers: write "5 to 60°C" and "Monday to Friday".`;

const DASH_RANGE = /(\d)\s*[–—]\s*(\d)/g;
const DASH = /\s*[–—]+\s*/g;

/** Takes em and en dashes out of model text: "5–60" becomes "5 to 60", any other dash a comma. */
export function plainDashes(text: string): string {
  return text
    .replace(DASH_RANGE, "$1 to $2")
    .replace(DASH, ", ")
    .replace(/,\s*([,.!?;:)])/g, "$1")
    .replace(/^,\s*/gm, "")
    .replace(/,\s*$/gm, "");
}

/** Coerces a model output field to a trimmed string no longer than max characters, without dashes. */
export function capText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  const trimmed = plainDashes(value.trim()).trim();
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
