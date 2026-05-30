import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Debug endpoint — returns the country code Cloudflare detects for this request.
// Useful for diagnosing geo-block issues.
// GET /api/geo → { country: "AU", source: "cf.country" | "header" | "unknown" }
export async function GET(request: NextRequest) {
  let country: string | undefined;
  let source: string;

  try {
    const cfCtx = getCloudflareContext() as { cf?: { country?: string } };
    if (cfCtx?.cf?.country) {
      country = cfCtx.cf.country;
      source = "cf.country";
    } else {
      country = request.headers.get("cf-ipcountry") ?? undefined;
      source = country ? "header" : "unknown";
    }
  } catch {
    country = request.headers.get("cf-ipcountry") ?? undefined;
    source = country ? "header" : "local-dev";
  }

  return NextResponse.json(
    { country: country ?? null, source, allowed: country === "AU" || !country },
    { headers: { "Cache-Control": "no-store" } }
  );
}
