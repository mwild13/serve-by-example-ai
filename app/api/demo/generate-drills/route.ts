import OpenAI from "openai";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

function getOpenAIClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

type Drill = {
  scenario: string;
  focus: string;
};

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    if (!rateLimit(`demo-generate-drills:ip:${ip}`, 3)) {
      return Response.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
    }

    const body = await req.json();
    const { menuText, venueName } = body as { menuText?: string; venueName?: string };

    if (!menuText || menuText.trim().length < 20) {
      return Response.json({ error: "Please provide at least a short menu or drink list." }, { status: 400 });
    }

    if (menuText.length > 4000) {
      return Response.json({ error: "Menu text too long (max 4000 characters)." }, { status: 400 });
    }

    const venueLabel = venueName?.trim() ? `for ${venueName.trim()}` : "for a hospitality venue";

    const prompt = `
You are a hospitality training content creator for Serve By Example, an AI training platform for bars and restaurants in Australia.

A venue manager has pasted their cocktail or drinks menu. Your job is to generate 3 short, practical AI training drill scenarios ${venueLabel} based specifically on what is in their menu.

Venue menu / drink list:
${menuText}

Generate exactly 3 scenario-based drill questions. Each should:
- Reference a specific drink, ingredient, or item from the menu by name
- Be phrased as a realistic guest question or service moment a staff member would face
- Be short and direct (1–2 sentences)
- Include a "focus" label (one of: Product Knowledge, Upsell, Guest Recovery, Service Standard)

Return ONLY valid JSON in this exact format:
[
  { "scenario": "string", "focus": "string" },
  { "scenario": "string", "focus": "string" },
  { "scenario": "string", "focus": "string" }
]

Rules:
- Use Australian English (e.g. "apologise", "flavour", "recognise")
- No markdown, no explanation outside the JSON array
- Each scenario must be unique and based on real items from the menu provided
`;

    const openai = getOpenAIClient();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    let response;
    try {
      response = await openai.chat.completions.create(
        {
          model: "gpt-4o-mini",
          temperature: 0.4,
          messages: [
            { role: "system", content: "You are a hospitality training content creator. You return valid JSON only." },
            { role: "user", content: prompt },
          ],
        },
        { signal: controller.signal }
      );
    } finally {
      clearTimeout(timeout);
    }

    const raw = response.choices[0]?.message?.content;
    if (!raw) {
      return Response.json({ error: "No response from AI." }, { status: 500 });
    }

    let drills: Drill[];
    try {
      drills = JSON.parse(raw);
      if (!Array.isArray(drills) || drills.length === 0) throw new Error("Invalid shape");
    } catch {
      return Response.json({ error: "Failed to parse AI response." }, { status: 500 });
    }

    return Response.json({ drills });
  } catch (error) {
    console.error("Generate drills error:", error);
    return Response.json({ error: "Something went wrong generating your drills." }, { status: 500 });
  }
}
