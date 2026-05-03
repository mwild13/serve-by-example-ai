import OpenAI from "openai";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getUserFromRequest } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { moduleIdToString, syncMasteryToVenueStaff } from "@/lib/mastery";

export const dynamic = "force-dynamic";

function getOpenAIClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const PASS_THRESHOLD = 75;
const ARENA_SCENARIO_INDEX = 40;

const ASSESSOR_SYSTEM_PROMPT = `You are an expert Australian Hospitality Assessor.
You will be provided with a Scenario and a Staff Member's Response.

Your task:
- Grade the response on a scale of 0–100 based on Australian RSA, WHS, and high-end service standards.
- A score of 75 or above means the staff member has passed.
- Provide two concise bullet points: one for what they did well, one for room for improvement.

Return ONLY valid JSON in this exact format:
{
  "score": number,
  "what_you_did_well": "string",
  "room_for_improvement": "string",
  "passed": boolean
}

Rules:
- score: 0–100 (75+ = passed)
- what_you_did_well: 1–2 sentences, specific and encouraging
- room_for_improvement: 1–2 sentences, practical coaching note
- passed: true if score >= 75, false otherwise
- no markdown, no text outside the JSON`;

export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = getClientIp(req);
    if (!rateLimit(`arena:user:${user.id}`, 20) || !rateLimit(`arena:ip:${ip}`, 20)) {
      return Response.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
    }

    const body = await req.json() as {
      action?: string;
      moduleId?: number;
      moduleTitle?: string;
      scenario?: string;
      response?: string;
    };
    const { action, moduleId, moduleTitle, scenario, response } = body;

    if (!action || !moduleId) {
      return Response.json({ error: "Missing action or moduleId" }, { status: 400 });
    }

    if (action !== "evaluate") {
      return Response.json({ error: `Unknown action: ${String(action)}` }, { status: 400 });
    }

    if (!scenario || typeof scenario !== "string") {
      return Response.json({ error: "scenario is required" }, { status: 400 });
    }
    if (!response || typeof response !== "string") {
      return Response.json({ error: "response is required" }, { status: 400 });
    }
    if (response.length > 4000) {
      return Response.json({ error: "Response too long (max 4000 characters)." }, { status: 400 });
    }

    const title = moduleTitle ?? `Module ${moduleId}`;
    const openai = getOpenAIClient();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    let completion;
    try {
      completion = await openai.chat.completions.create(
        {
          model: "gpt-4o-mini",
          temperature: 0.3,
          messages: [
            { role: "system", content: ASSESSOR_SYSTEM_PROMPT },
            {
              role: "user",
              content: `Module: ${title}\n\nScenario:\n${scenario}\n\nStaff Member's Response:\n${response}`,
            },
          ],
        },
        { signal: controller.signal },
      );
    } finally {
      clearTimeout(timeout);
    }

    const raw = completion.choices[0]?.message?.content ?? "";
    let parsed: { score: number; what_you_did_well: string; room_for_improvement: string; passed: boolean };
    try {
      parsed = JSON.parse(raw) as typeof parsed;
    } catch {
      return Response.json({ error: "Failed to parse AI evaluation.", raw }, { status: 500 });
    }

    const score = Math.max(0, Math.min(100, Math.round(parsed.score ?? 0)));
    const passed = score >= PASS_THRESHOLD;
    const now = new Date().toISOString();
    const moduleName = moduleIdToString(moduleId);

    const admin = createSupabaseAdminClient();

    const { data: existingRow } = await admin
      .from("scenario_mastery")
      .select("best_score, total_attempts")
      .eq("user_id", user.id)
      .eq("module", moduleName)
      .eq("scenario_index", ARENA_SCENARIO_INDEX)
      .maybeSingle();

    const bestScore = Math.max(score, (existingRow?.best_score as number | null) ?? 0);
    const totalAttempts = ((existingRow?.total_attempts as number | null) ?? 0) + 1;

    await admin.from("scenario_mastery").upsert(
      {
        user_id: user.id,
        module: moduleName,
        module_id: moduleId,
        scenario_index: ARENA_SCENARIO_INDEX,
        is_mastered: passed,
        mastery_level: passed ? 3 : 1,
        last_score: score,
        best_score: bestScore,
        total_attempts: totalAttempts,
        total_score_points: score,
        consecutive_correct: passed ? 1 : 0,
        consecutive_fails: passed ? 0 : 1,
        last_attempt_at: now,
        next_review_at: now,
        updated_at: now,
      },
      { onConflict: "user_id,module,scenario_index" },
    );

    await syncMasteryToVenueStaff(admin, user.id, user.email ?? "");

    return Response.json({
      assessment: {
        score,
        what_you_did_well: parsed.what_you_did_well ?? "",
        room_for_improvement: parsed.room_for_improvement ?? "",
        passed,
      },
    });
  } catch (error) {
    console.error("Arena evaluate error:", error);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
