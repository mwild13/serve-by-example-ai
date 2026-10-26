import type { MetadataRoute } from "next";

const BASE = "https://servebyexample.co";

// Signed-in surfaces, sign-in itself, and pages no one should land on from
// search. No trailing slashes: "/mobile" covers /mobile and everything under it.
const PRIVATE_PATHS = [
  "/api/",
  "/auth",
  "/dashboard",
  "/management",
  "/mobile",
  "/onboarding",
  "/login",
  "/reset-password",
  "/session-conflict",
  "/notifications/",
  "/restricted",
  "/geo-block",
  "/toolkit/success",
];

// AI search and assistant crawlers are welcome on the public site, so the
// site can be found and quoted in AI answers. Each gets the same rules as
// everyone else: a crawler with its own group ignores the "*" group, so a
// bare "Allow: /" here would let it into the app. AI training crawlers
// (GPTBot, ClaudeBot, CCBot and others) are blocked in Cloudflare's AI Crawl
// Control instead, so they are not listed here.
const AI_CRAWLERS = ["OAI-SearchBot", "ChatGPT-User", "Claude-SearchBot", "PerplexityBot"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE_PATHS },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: PRIVATE_PATHS },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
