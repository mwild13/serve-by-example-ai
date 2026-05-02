import OpenAI from "openai";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getUserFromRequest } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

function getOpenAIClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = getClientIp(req);
    if (!rateLimit(`arena:user:${user.id}`, 30) || !rateLimit(`arena:ip:${ip}`, 30)) {
      return Response.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
    }

    const body = await req.json() as {
      action?: string;
      moduleId?: number;
      moduleTitle?: string;
      messages?: ChatMessage[];
      transcript?: string;
    };
    const { action, moduleId, moduleTitle, messages, transcript } = body;

    if (!action || !moduleId) {
      return Response.json({ error: "Missing action or moduleId" }, { status: 400 });
    }

    const title = moduleTitle ?? `Module ${moduleId}`;
    const openai = getOpenAIClient();

    // ── Start: AI opens as Difficult Guest ──────────────────────────────────
    if (action === "start") {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.85,
        messages: [
          {
            role: "system",
            content: `You are playing a "Difficult Guest" in a hospitality training simulation for Serve By Example.
The staff member is being trained on: ${title}.
Open with a realistic scenario that directly tests their skills in this area.
Be a challenging but plausible guest — frustrated, demanding, or confused — not abusive.
Keep your opening to 2–3 sentences. Be specific and create real tension.
Do NOT break character. Do NOT explain this is training.`,
          },
          { role: "user", content: "Begin the scenario." },
        ],
      });
      return Response.json({ opening: completion.choices[0]?.message?.content ?? "" });
    }

    // ── Reply: AI continues as Difficult Guest ───────────────────────────────
    if (action === "reply") {
      if (!Array.isArray(messages) || messages.length === 0) {
        return Response.json({ error: "messages array required for reply" }, { status: 400 });
      }
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.75,
        messages: [
          {
            role: "system",
            content: `You are a "Difficult Guest" in a hospitality training simulation.
The staff member is being trained on: ${title}.
Stay in character. React naturally to what they say — if they handle you well, become gradually more cooperative.
If they handle you poorly, escalate slightly. Keep replies to 2–3 sentences. Never break character.`,
          },
          ...messages,
        ],
      });
      return Response.json({ reply: completion.choices[0]?.message?.content ?? "" });
    }

    // ── Score: Evaluate transcript and update service_score ──────────────────
    if (action === "score") {
      if (!transcript || typeof transcript !== "string") {
        return Response.json({ error: "transcript required for score" }, { status: 400 });
      }
      if (transcript.length > 8000) {
        return Response.json({ error: "Transcript too long (max 8000 characters)." }, { status: 400 });
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000);
      let completion;
      try {
        completion = await openai.chat.completions.create(
          {
            model: "gpt-4o-mini",
            temperature: 0.3,
            messages: [
              {
                role: "system",
                content: "You are a structured hospitality training evaluator. Return valid JSON only.",
              },
              {
                role: "user",
                content: `Evaluate this hospitality roleplay transcript.
The staff member was being tested on: ${title}.
The other party was a "Difficult Guest" AI simulator.

Transcript:
${transcript}

Return ONLY valid JSON in this exact format:
{
  "serviceScore": number,
  "strengths": "string",
  "improvement": "string",
  "summary": "string"
}

Rules:
- serviceScore: 1–100 (100 = exceptional hospitality, 1 = failed completely)
- strengths: what the staff member did well (1–2 sentences, specific)
- improvement: one practical coaching note (1–2 sentences)
- summary: one-sentence verdict
- no markdown, no text outside the JSON`,
              },
            ],
          },
          { signal: controller.signal },
        );
      } finally {
        clearTimeout(timeout);
      }

      const raw = completion.choices[0]?.message?.content ?? "";
      let parsed: { serviceScore: number; strengths: string; improvement: string; summary: string };
      try {
        parsed = JSON.parse(raw) as typeof parsed;
      } catch {
        return Response.json({ error: "Failed to parse AI evaluation.", raw }, { status: 500 });
      }

      const serviceScore = Math.max(1, Math.min(100, Math.round(parsed.serviceScore ?? 0)));

      // Update service_score on the linked venue_staff row
      const admin = createSupabaseAdminClient();
      await admin
        .from("venue_staff")
        .update({
          service_score: serviceScore,
          updated_at: new Date().toISOString(),
        })
        .eq("staff_user_id", user.id);

      return Response.json({
        success: true,
        arena: {
          serviceScore,
          strengths: parsed.strengths ?? "",
          improvement: parsed.improvement ?? "",
          summary: parsed.summary ?? "",
        },
      });
    }

    return Response.json({ error: `Unknown action: ${String(action)}` }, { status: 400 });
  } catch (error) {
    console.error("Arena API error:", error);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
