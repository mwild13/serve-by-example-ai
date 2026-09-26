import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getOpenAIClient } from "@/lib/openai";
import { linkAbortSignal, parseModelJson, readJsonBody } from "@/lib/ai-guard";

export const dynamic = "force-dynamic";

// Public and unauthenticated, so every input is capped. The only client
// (components/LanguageRuntimeTranslator.tsx) sends batches of up to 60
// strings of up to 240 characters and a BCP 47 code like "es" or "zh-CN".
const MAX_TEXTS = 80;
const MAX_TEXT_CHARS = 300;
const MAX_BODY_BYTES = 64 * 1024;
const LANGUAGE_CODE = /^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8}){0,2}$/;
// A full batch in a non-Latin script can run to ~9k output tokens; this is a
// ceiling against runaway output, not a tight fit.
const MAX_OUTPUT_TOKENS = 12000;

function isValidTexts(input: unknown): input is string[] {
  return (
    Array.isArray(input) &&
    input.every((value) => typeof value === "string" && value.length <= MAX_TEXT_CHARS)
  );
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    if (!rateLimit(`translate:${ip}`, 15)) {
      return Response.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
    }

    const read = await readJsonBody(req, MAX_BODY_BYTES);
    if (!read.ok) return read.response;
    const { targetLanguage, texts } = read.body;

    // targetLanguage goes straight into the prompt, so only a language code is accepted.
    if (typeof targetLanguage !== "string" || !LANGUAGE_CODE.test(targetLanguage) || !isValidTexts(texts) || texts.length === 0) {
      return Response.json({ error: "Invalid translation request payload." }, { status: 400 });
    }

    if (texts.length > MAX_TEXTS) {
      return Response.json({ error: "Too many text segments in one request." }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ error: "Translation service is not configured." }, { status: 500 });
    }

    const source = texts.map((text, index) => ({ id: index, text }));

    const prompt = `Translate each item into ${targetLanguage}.\n\nReturn strict JSON only in this shape:\n{\n  "translations": [\n    { "id": 0, "text": "..." }\n  ]\n}\n\nRules:\n- Keep ids unchanged\n- Keep item count unchanged\n- Preserve brand names exactly (Serve By Example, OpenAI, Supabase, Cloudflare)\n- Do not add explanations\n- Do not drop placeholders, numbers, symbols, or punctuation`;

    const openai = getOpenAIClient();
    const controller = new AbortController();
    const unlink = linkAbortSignal(controller, req.signal);
    let completion;
    try {
      completion = await openai.chat.completions.create(
        {
          model: "gpt-4o-mini",
          temperature: 0.1,
          max_tokens: MAX_OUTPUT_TOKENS,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: "You are a translation engine. You return valid JSON only.",
            },
            {
              role: "user",
              content: `${prompt}\n\nItems:\n${JSON.stringify(source)}`,
            },
          ],
        },
        { signal: controller.signal },
      );
    } finally {
      unlink();
    }

    // Never return the raw model text: parseModelJson logs it server-side only.
    const parsed = parseModelJson(completion.choices[0]?.message?.content, "translate") as
      | { translations?: Array<{ id: number; text: string }> }
      | null;
    if (!parsed?.translations || !Array.isArray(parsed.translations)) {
      return Response.json({ error: "Invalid translation response shape." }, { status: 500 });
    }

    const translated = source.map((item) => {
      const match = parsed.translations?.find((entry) => entry.id === item.id);
      if (!match || typeof match.text !== "string" || !match.text.trim()) {
        return item.text;
      }

      return match.text;
    });

    return Response.json({ translations: translated });
  } catch (error) {
    console.error("Translation API error:", error);
    return Response.json({ error: "Translation failed." }, { status: 500 });
  }
}
