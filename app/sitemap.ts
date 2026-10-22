import type { MetadataRoute } from "next";

const BASE = "https://servebyexample.co";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    { url: "/", priority: 1.0 },
    { url: "/how-it-works", priority: 0.9 },
    { url: "/platform", priority: 0.9 },
    { url: "/for-venues", priority: 0.9 },
    { url: "/platform/challenges", priority: 0.8 },
    { url: "/solutions", priority: 0.8 },
    { url: "/membership", priority: 0.9 },
    { url: "/demo", priority: 0.8 },
    { url: "/demo/complaint-master", priority: 0.7 },
    { url: "/solutions/fine-dining", priority: 0.7 },
    { url: "/solutions/franchise-systems", priority: 0.7 },
    { url: "/solutions/hotel-fb", priority: 0.7 },
    { url: "/solutions/pub-groups", priority: 0.7 },
    { url: "/vs-generic-lms", priority: 0.7 },
    { url: "/roi", priority: 0.7 },
    { url: "/resources", priority: 0.7 },
    { url: "/resources/sop-toolkit", priority: 0.7 },
    { url: "/about", priority: 0.7 },
    { url: "/contact", priority: 0.7 },
    { url: "/roadmap", priority: 0.6 },
    { url: "/security", priority: 0.5 },
    { url: "/privacy", priority: 0.3 },
    { url: "/terms", priority: 0.3 },
    { url: "/refunds", priority: 0.3 },
    { url: "/cookies", priority: 0.3 },
  ];

  // No lastModified: stamping every page with today's date on each request
  // tells Google nothing, and it learns to ignore the field.
  // /pricing is left out: it redirects to /membership (next.config.ts).
  return pages.map((page) => ({
    url: `${BASE}${page.url}`,
    changeFrequency: page.priority >= 0.8 ? "weekly" : "monthly",
    priority: page.priority,
  }));
}
