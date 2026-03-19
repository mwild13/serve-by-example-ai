import type { MetadataRoute } from "next";

const BASE = "https://www.serve-by-example.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    { url: "/", priority: 1.0 },
    { url: "/how-it-works", priority: 0.9 },
    { url: "/platform", priority: 0.9 },
    { url: "/for-venues", priority: 0.9 },
    { url: "/pricing", priority: 0.8 },
    { url: "/demo", priority: 0.8 },
    { url: "/about", priority: 0.7 },
    { url: "/contact", priority: 0.7 },
    { url: "/privacy", priority: 0.3 },
    { url: "/terms", priority: 0.3 },
    { url: "/cookies", priority: 0.3 },
  ];

  return pages.map((page) => ({
    url: `${BASE}${page.url}`,
    lastModified: new Date(),
    changeFrequency: page.priority >= 0.8 ? "weekly" : "monthly",
    priority: page.priority,
  }));
}
