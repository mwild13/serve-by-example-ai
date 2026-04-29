import OpenAI from "openai";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getUserFromRequest } from "@/lib/supabase-server";

// Prevent static generation for this route (requires API credentials at runtime)
export const dynamic = "force-dynamic";

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) {
      return Response.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const ip = getClientIp(req);
    if (!rateLimit(`evaluate:user:${user.id}`, 20) || !rateLimit(`evaluate:ip:${ip}`, 20)) {
      return Response.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
    }

    const body = await req.json();
    const { scenario, userResponse } = body;

    if (!scenario || !userResponse) {
      return Response.json(
        { error: "Missing scenario or userResponse", code: "BAD_REQUEST" },
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

    const openai = getOpenAIClient();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    let response;
    try {
      response = await openai.chat.completions.create(
        {
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
        },
        { signal: controller.signal }
      );
    } finally {
      clearTimeout(timeout);
    }

    const raw = response.choices[0]?.message?.content;

    if (!raw) {
      return Response.json(
        { error: "No response from OpenAI", code: "UPSTREAM_EMPTY" },
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
          code: "UPSTREAM_PARSE_ERROR",
          raw,
        },
        { status: 500 }
      );
    }

    return Response.json(parsed);
  } catch (error) {
    console.error("API error:", error);
    return Response.json(
      { error: "Something went wrong while evaluating the response.", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
