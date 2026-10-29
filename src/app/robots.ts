import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

// Search engines and AI assistants are welcome everywhere except the vote and
// raw results endpoints. Named explicitly so no crawler's default blocks it.
const CRAWLERS = [
  "Googlebot",
  "Google-Extended",
  "Bingbot",
  "Applebot",
  "Applebot-Extended",
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "DuckAssistBot",
  "CCBot",
  "Meta-ExternalAgent",
];
const DISALLOW = ["/api/vote", "/api/results/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      ...CRAWLERS.map((userAgent) => ({ userAgent, allow: "/", disallow: DISALLOW })),
      // Share-card and preview images stay crawlable so link previews work.
      { userAgent: "*", allow: "/", disallow: DISALLOW },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
