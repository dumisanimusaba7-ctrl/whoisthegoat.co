import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdSlot } from "@/components/ads/ad-slot";
import { DebateProvider } from "@/components/debate/debate-provider";
import { HowItWorks } from "@/components/debate/how-it-works";
import { ResultsView } from "@/components/debate/results-view";
import { JsonLd } from "@/components/json-ld";
import { DEBATES, getDebate } from "@/lib/debates";
import { breadcrumbJsonLd, debateOgImage } from "@/lib/seo";
import { getPageResults } from "@/lib/server/results";
import { getSiteUrl, SITE_NAME } from "@/lib/site";

// Every real URL here is fully prerendered (ensureStatic in the root layout),
// so navigations load static output. Params are read up front rather than
// behind Suspense so unknown URLs get a true 404; this opts the route out of
// the instant-shell validation that pattern would otherwise trip.
export const instant = false;

export function generateStaticParams() {
  return DEBATES.map((debate) => ({ debate: debate.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[debate]/results">): Promise<Metadata> {
  const debate = getDebate((await params).debate);
  if (!debate) return { title: "Page not found" };
  const title = `${debate.title} Results: Live Global Vote`;
  const description = `Live results of the world’s ${debate.title} vote: the global split, total votes and the breakdown country by country, updated in real time.`;
  const image = debateOgImage(debate);
  return {
    title: { absolute: `${title} | ${SITE_NAME}` },
    description,
    alternates: { canonical: `/${debate.slug}/results` },
    openGraph: { type: "website", url: `/${debate.slug}/results`, title, description, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function DebateResultsPage({ params }: PageProps<"/[debate]/results">) {
  const debate = getDebate((await params).debate);
  if (!debate) notFound();
  const results = await getPageResults(debate.slug);

  return (
    <>
      <DebateProvider debate={debate} siteUrl={getSiteUrl().origin} initialResults={results}>
        <ResultsView />
      </DebateProvider>
      <AdSlot placement="results" className="border-t border-rule" />
      <HowItWorks />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Results", path: "/results" },
          { name: debate.title, path: `/${debate.slug}/results` },
        ])}
      />
    </>
  );
}
