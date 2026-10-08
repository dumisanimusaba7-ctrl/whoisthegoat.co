import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";

import { AdSlot } from "@/components/ads/ad-slot";
import { AboutDebate } from "@/components/debate/about-debate";
import { DebateExperience } from "@/components/debate/debate-experience";
import { HowItWorks } from "@/components/debate/how-it-works";
import { JsonLd } from "@/components/json-ld";
import { DEBATES, getDebate } from "@/lib/debates";
import { breadcrumbJsonLd, debateJsonLd, debateMetadata } from "@/lib/seo";

// Every real URL here is fully prerendered (ensureStatic in the root layout),
// so navigations load static output. Params are read up front rather than
// behind Suspense so unknown URLs get a true 404; this opts the route out of
// the instant-shell validation that pattern would otherwise trip.
export const instant = false;

export function generateStaticParams() {
  return DEBATES.map((debate) => ({ debate: debate.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[debate]">): Promise<Metadata> {
  const debate = getDebate((await params).debate);
  return debate ? debateMetadata(debate, `/${debate.slug}`) : { title: "Page not found" };
}

export default async function DebatePage({ params }: PageProps<"/[debate]">) {
  const debate = getDebate((await params).debate);
  if (!debate) notFound();

  return (
    <ViewTransition enter="page" exit="page" default="none">
      <div>
        <DebateExperience debate={debate} />
        <AboutDebate debate={debate} />
        <AdSlot placement="editorial" className="border-t border-rule" />
        <HowItWorks />
        <JsonLd data={debateJsonLd(debate, `/${debate.slug}`)} />
        <JsonLd
          data={breadcrumbJsonLd([
            { name: "Debates", path: "/debates" },
            { name: debate.title, path: `/${debate.slug}` },
          ])}
        />
      </div>
    </ViewTransition>
  );
}
