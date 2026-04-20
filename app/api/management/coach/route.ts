import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getUserFromRequest } from "@/lib/supabase-server";
import { getManagementSnapshot } from "@/lib/management/service";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { user, supabase } = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const question = typeof body.question === "string" ? body.question.trim() : "";
    const venueId = typeof body.venueId === "string" ? body.venueId.trim() : undefined;

    if (!question) {
      return NextResponse.json({ error: "Provide a question for the AI coach." }, { status: 400 });
    }

    const snapshot = await getManagementSnapshot(supabase, user.id);
    const venue = venueId
      ? snapshot.venues.find((v) => v.id === venueId) ?? snapshot.venues[0]
      : snapshot.venues[0];
    const venueStaff = snapshot.staff.filter((m) => m.venueId === (venue?.id ?? ""));
    const venuePrograms = snapshot.trainingPrograms.filter((p) => p.venueId === (venue?.id ?? ""));
    const venueInventory = snapshot.inventory.filter((i) => i.venueId === (venue?.id ?? ""));

    const staffSummary = venueStaff.length
      ? venueStaff
          .map(
            (m) =>
              `- ${m.name} (${m.role}): ${m.progress}% complete | Service ${m.serviceScore}% | Sales ${m.salesScore}% | Product ${m.productScore}% | Last active: ${m.lastActive} | Status: ${m.status}`,
          )
          .join("\n")
      : "No staff recorded.";

    const programSummary = venuePrograms.length
      ? venuePrograms.map((p) => `- ${p.name} (${p.roleTarget}): ${p.completion}% completion`).join("\n")
      : "No training programs.";

    const inventorySummary = venueInventory.length
      ? venueInventory.map((i) => `- ${i.name}: ${i.products.join(", ")}`).join("\n")
      : "No inventory recorded.";

    const systemPrompt = `You are an expert AI operations coach for a hospitality training platform called Serve By Example.
You have live access to the manager's venue data for the venue "${venue?.name ?? "Unknown Venue"}".

VENUE DATA:
Health Score: ${Math.round(((venue?.completionRate ?? 0) + (venue?.avgScenarioScore ?? 0) + (venue?.upsellRate ?? 0)) / 3)}/100
Completion Rate: ${venue?.completionRate ?? 0}%
Avg Scenario Score: ${venue?.avgScenarioScore ?? 0}%
Upsell Rate: ${venue?.upsellRate ?? 0}%

STAFF ROSTER (${venueStaff.length} people):
${staffSummary}

TRAINING PROGRAMS (${venuePrograms.length}):
${programSummary}

INVENTORY CATEGORIES (${venueInventory.length}):
${inventorySummary}

Your role:
- Answer questions about this specific venue's data directly and concisely.
- When staff need attention, name them specifically.
- Give actionable recommendations, not just observations.
- Keep answers under 150 words unless a detailed breakdowns is requested.
- Format lists with bullet points for readability.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      max_tokens: 300,
      temperature: 0.5,
    });

    const answer = completion.choices[0]?.message?.content ?? "Unable to generate a response.";
    return NextResponse.json({ answer });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI coach unavailable.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
