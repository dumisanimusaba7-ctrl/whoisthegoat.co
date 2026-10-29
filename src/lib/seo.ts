import type { Metadata } from "next";

import type { Debate } from "./debates";
import { debateKeywords, optionNames } from "./seo-keywords";
import { absoluteUrl, SITE_NAME } from "./site";

/** Square link preview, shown big like an Instagram post. */
export function debateOgImage(debate: Debate) {
  return {
    url: `/api/og/${debate.slug}/square`,
    width: 1080,
    height: 1080,
    type: "image/jpeg",
    alt: `${debate.question} ${debate.title}: the world decides. Vote at ${SITE_NAME}.`,
  };
}

/** X crops anything taller than 2:1, so it gets the wide version. */
export function debateTwitterImage(debate: Debate) {
  return { ...debateOgImage(debate), url: `/api/og/${debate.slug}`, width: 1200, height: 630 };
}

/** Metadata shared by every page that hosts a debate's vote. */
export function debateMetadata(debate: Debate, canonicalPath: string, overrides: Partial<Metadata> = {}): Metadata {
  const image = debateOgImage(debate);
  return {
    title: { absolute: `${debate.seo.title} | ${SITE_NAME}` },
    description: debate.seo.description,
    keywords: debateKeywords(debate),
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: "website",
      url: canonicalPath,
      title: `${debate.title}: ${debate.question}`,
      description: debate.seo.description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: `${debate.title}: ${debate.question}`,
      description: debate.seo.description,
      images: [debateTwitterImage(debate)],
    },
    ...overrides,
  };
}

export function debateJsonLd(debate: Debate, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${debate.title}: ${debate.question}`,
    description: debate.seo.description,
    url: absoluteUrl(path),
    isPartOf: { "@type": "WebSite", "@id": absoluteUrl("/#website"), name: SITE_NAME, url: absoluteUrl("/") },
    inLanguage: "en",
    keywords: debateKeywords(debate).join(", "),
    primaryImageOfPage: { "@type": "ImageObject", url: absoluteUrl(debateOgImage(debate).url), width: 1080, height: 1080 },
    about: debate.options.map((option) => ({
      "@type": option.kind === "person" ? "Person" : "Organization",
      name: option.name,
      alternateName: optionNames(option).slice(1),
      ...(option.kind === "person" ? { nationality: option.nationality } : {}),
      sameAs: option.wikipedia,
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
