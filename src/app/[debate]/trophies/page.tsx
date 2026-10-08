import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";

import { JsonLd } from "@/components/json-ld";
import { TrophyCabinet } from "@/components/trophies/cabinet";
import { DEBATES, getDebate } from "@/lib/debates";
import { breadcrumbJsonLd, debateOgImage } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";
import { getCabinet, hasCabinet, teamTotals } from "@/lib/trophies";

// Every real URL here is fully prerendered (ensureStatic in the root layout).
// Params are read up front so unknown URLs get a true 404.
export const instant = false;

export function generateStaticParams() {
  return DEBATES.filter((debate) => hasCabinet(debate.slug)).map((debate) => ({ debate: debate.slug }));
}

async function resolve(params: PageProps<"/[debate]/trophies">["params"]) {
  const debate = getDebate((await params).debate);
  const cabinet = debate ? getCabinet(debate.slug) : undefined;
  return debate && cabinet ? { debate, cabinet } : null;
}

export async function generateMetadata({ params }: PageProps<"/[debate]/trophies">): Promise<Metadata> {
  const found = await resolve(params);
  if (!found) return { title: "Page not found" };
  const { debate, cabinet } = found;
  const [a, b] = debate.options;
  const [ta, tb] = teamTotals(cabinet);
  const title = `${debate.title} Trophy Cabinet: Every Title Compared`;
  const description = `${a.shortName} ${ta}, ${b.shortName} ${tb}: every team trophy, Ballon d’Or and record, side by side and counted season by season.`;
  const image = debateOgImage(debate);
  return {
    title: { absolute: `${title} | ${SITE_NAME}` },
    description,
    alternates: { canonical: `/${debate.slug}/trophies` },
    openGraph: { type: "website", url: `/${debate.slug}/trophies`, title, description, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function TrophiesPage({ params }: PageProps<"/[debate]/trophies">) {
  const found = await resolve(params);
  if (!found) notFound();
  const { debate, cabinet } = found;

  return (
    <ViewTransition enter="page" exit="page" default="none">
      <div>
        <TrophyCabinet debate={debate} cabinet={cabinet} />
        <JsonLd
          data={breadcrumbJsonLd([
            { name: debate.title, path: `/${debate.slug}` },
            { name: "Trophy cabinet", path: `/${debate.slug}/trophies` },
          ])}
        />
      </div>
    </ViewTransition>
  );
}
