import OpenAI from "openai";
import { getUserFromRequest } from "@/lib/supabase-server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

type CoachRequest = {
  question?: string;
  language?: string;
};

function mapLanguageLabel(code: string | undefined) {
  const normalized = (code || "en-US").toLowerCase();

  if (normalized.startsWith("en-au")) return "English (Australia)";
  if (normalized.startsWith("en-us")) return "English (United States)";
  if (normalized.startsWith("es")) return "Spanish";
  if (normalized.startsWith("zh")) return "Mandarin Chinese";
  if (normalized.startsWith("fr")) return "French";
  if (normalized.startsWith("de")) return "German";
  if (normalized.startsWith("ar")) return "Arabic";
  if (normalized.startsWith("ru")) return "Russian";
  if (normalized.startsWith("pt")) return "Portuguese";
  if (normalized.startsWith("ja")) return "Japanese";
  if (normalized.startsWith("ko")) return "Korean";
  if (normalized.startsWith("hi")) return "Hindi";
  if (normalized.startsWith("pa")) return "Punjabi";
  if (normalized.startsWith("it")) return "Italian";
  if (normalized.startsWith("id")) return "Indonesian";
  if (normalized.startsWith("tl")) return "Tagalog";
  if (normalized.startsWith("th")) return "Thai";
  if (normalized.startsWith("tr")) return "Turkish";
  if (normalized.startsWith("vi")) return "Vietnamese";

  return "English (United States)";
}

export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) {
      return Response.json({ error: "Sign in to use the AI coach." }, { status: 401 });
    }

    const ip = getClientIp(req);
    if (!rateLimit(`coach:${user.id ?? ip}`, 30)) {
      return Response.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
    }

    const body = (await req.json()) as CoachRequest;
    const question = body.question?.trim();
    const languageLabel = mapLanguageLabel(body.language);

    if (!question || question.length > 2000) {
      return Response.json({ error: "Question is required (max 2000 characters)." }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ error: "AI coach is not configured." }, { status: 500 });
    }

    const systemPrompt = `You are Serve By Example's AI Training Coach for hospitality teams.

You provide practical, shift-ready answers about:
- Cocktail recipes and build specs
- Service standards and guest recovery
- Upselling and menu guidance
- Team communication and management coaching
- Venue policy interpretation when context is provided

Rules:
- Answer in ${languageLabel}
- Be concise and operationally useful
- If a recipe is requested, include: ingredients, method, glassware, garnish, and one service tip
- If uncertain, say what to verify with venue SOP
- Never invent legal/safety policy facts`;

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.25,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
    });

    const answer = completion.choices[0]?.message?.content?.trim();

    if (!answer) {
      return Response.json({ error: "No answer returned." }, { status: 500 });
    }

    return Response.json({ answer });
  } catch (error) {
    console.error("Coach API error:", error);
    return Response.json({ error: "Unable to answer right now." }, { status: 500 });
  }
}
