import OpenAI from "openai";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// Prevent static generation for this route (requires API credentials at runtime)
export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    if (!rateLimit(`evaluate:${ip}`, 20)) {
      return Response.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
    }

    const body = await req.json();
    const { scenario, userResponse } = body;

    if (!scenario || !userResponse) {
      return Response.json(
        { error: "Missing scenario or userResponse" },
        { status: 400 }
      );
    }

    if (typeof userResponse === "string" && userResponse.length > 3000) {
      return Response.json({ error: "Response too long (max 3000 characters)." }, { status: 400 });
    }

    const prompt = `
You are an AI hospitality training evaluator for a platform called Serve By Example.

Your job is to assess a staff member's response to a hospitality scenario.

You must evaluate the response using these 5 criteria:
1. Communication
2. Hospitality Behaviour
3. Problem Solving
4. Professionalism
5. Guest Experience

Score each category from 1 to 5.

Scenario:
${scenario}

Staff response:
${userResponse}

Return ONLY valid JSON in this exact format:
{
  "communication": number,
  "hospitalityBehaviour": number,
  "problemSolving": number,
  "professionalism": number,
  "guestExperience": number,
  "overallScore": number,
  "strengths": "string",
  "improvement": "string",
  "improvedResponse": "string"
}

Rules:
- overallScore must equal the sum of the 5 category scores
- strengths must be short and clear
- improvement must be practical and specific
- improvedResponse must sound natural, professional, and suitable for hospitality
- do not include markdown
- do not include explanation outside the JSON
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "You are a structured hospitality training evaluator. You always return valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const raw = response.choices[0]?.message?.content;

    if (!raw) {
      return Response.json(
        { error: "No response from OpenAI" },
        { status: 500 }
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return Response.json(
        {
          error: "Failed to parse AI response",
          raw,
        },
        { status: 500 }
      );
    }

    return Response.json(parsed);
  } catch (error) {
    console.error("API error:", error);
    return Response.json(
      { error: "Something went wrong while evaluating the response." },
      { status: 500 }
    );
  }
}
