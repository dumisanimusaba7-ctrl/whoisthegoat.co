import type { Metadata } from "next";

import type { Debate } from "./debates";
import { absoluteUrl, SITE_NAME } from "./site";

export function debateOgImage(debate: Debate) {
  return {
    url: `/api/og/${debate.slug}`,
    width: 1200,
    height: 630,
    type: "image/jpeg",
    alt: `${debate.question} ${debate.title}: the world decides. Vote at ${SITE_NAME}.`,
  };
}

/** Metadata shared by every page that hosts a debate's vote. */
export function debateMetadata(debate: Debate, canonicalPath: string, overrides: Partial<Metadata> = {}): Metadata {
  const image = debateOgImage(debate);
  return {
    title: { absolute: `${debate.seo.title} | ${SITE_NAME}` },
    description: debate.seo.description,
    keywords: debate.seo.keywords,
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
      images: [image],
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
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: absoluteUrl("/") },
    about: debate.options.map((option) => ({
      "@type": "Person",
      name: option.name,
      nationality: option.country.name,
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
