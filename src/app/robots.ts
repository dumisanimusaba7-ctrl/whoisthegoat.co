import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Share-card and preview images stay crawlable so link previews work.
      disallow: ["/api/vote", "/api/results/"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
