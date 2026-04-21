import OpenAI from "openai";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type TranslateRequestBody = {
  targetLanguage?: string;
  texts?: string[];
};

function isValidTexts(input: unknown): input is string[] {
  return Array.isArray(input) && input.every((value) => typeof value === "string");
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    if (!rateLimit(`translate:${ip}`, 15)) {
      return Response.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
    }

    const body = (await req.json()) as TranslateRequestBody;
    const targetLanguage = body.targetLanguage?.trim();
    const texts = body.texts;

    if (!targetLanguage || !isValidTexts(texts) || texts.length === 0) {
      return Response.json({ error: "Invalid translation request payload." }, { status: 400 });
    }

    if (texts.length > 80) {
      return Response.json({ error: "Too many text segments in one request." }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ error: "Translation service is not configured." }, { status: 500 });
    }

    const source = texts.map((text, index) => ({ id: index, text }));

    const prompt = `Translate each item into ${targetLanguage}.\n\nReturn strict JSON only in this shape:\n{\n  "translations": [\n    { "id": 0, "text": "..." }\n  ]\n}\n\nRules:\n- Keep ids unchanged\n- Keep item count unchanged\n- Preserve brand names exactly (Serve By Example, OpenAI, Supabase, Cloudflare)\n- Do not add explanations\n- Do not drop placeholders, numbers, symbols, or punctuation`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
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
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return Response.json({ error: "No translation response received." }, { status: 500 });
    }

    let parsed: { translations?: Array<{ id: number; text: string }> };
    try {
      parsed = JSON.parse(raw);
    } catch {
      return Response.json({ error: "Failed to parse translation response.", raw }, { status: 500 });
    }

    if (!parsed.translations || !Array.isArray(parsed.translations)) {
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
