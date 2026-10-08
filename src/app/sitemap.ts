import type { MetadataRoute } from "next";

import { DEBATES } from "@/lib/debates";
import { absoluteUrl } from "@/lib/site";
import { hasCabinet } from "@/lib/trophies";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), changeFrequency: "always", priority: 1 },
    ...DEBATES.flatMap((debate) => [
      { url: absoluteUrl(`/${debate.slug}`), changeFrequency: "always" as const, priority: 0.9 },
      { url: absoluteUrl(`/${debate.slug}/results`), changeFrequency: "always" as const, priority: 0.8 },
      ...(hasCabinet(debate.slug)
        ? [{ url: absoluteUrl(`/${debate.slug}/trophies`), changeFrequency: "monthly" as const, priority: 0.7 }]
        : []),
    ]),
    { url: absoluteUrl("/debates"), changeFrequency: "weekly", priority: 0.6 },
    { url: absoluteUrl("/results"), changeFrequency: "hourly", priority: 0.6 },
    { url: absoluteUrl("/privacy"), changeFrequency: "yearly", priority: 0.2 },
  ];
}
