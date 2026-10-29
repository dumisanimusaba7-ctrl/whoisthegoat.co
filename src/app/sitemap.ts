import type { MetadataRoute } from "next";

import { DEBATES } from "@/lib/debates";
import { absoluteUrl } from "@/lib/site";
import { hasCabinet } from "@/lib/trophies";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  // Each debate's square preview: the face-off image, for image search.
  const image = (slug: string) => [absoluteUrl(`/api/og/${slug}/square`)];
  return [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "always", priority: 1, images: image(DEBATES[0].slug) },
    ...DEBATES.flatMap((debate) => [
      { url: absoluteUrl(`/${debate.slug}`), lastModified: now, changeFrequency: "always" as const, priority: 0.9, images: image(debate.slug) },
      { url: absoluteUrl(`/${debate.slug}/results`), lastModified: now, changeFrequency: "always" as const, priority: 0.8 },
      ...(hasCabinet(debate.slug)
        ? [{ url: absoluteUrl(`/${debate.slug}/trophies`), lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 }]
        : []),
    ]),
    { url: absoluteUrl("/trophies"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/leaderboard"), lastModified: now, changeFrequency: "hourly", priority: 0.8 },
    { url: absoluteUrl("/debates"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/results"), lastModified: now, changeFrequency: "hourly", priority: 0.6 },
    { url: absoluteUrl("/privacy"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
