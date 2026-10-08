import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";

import { AboutDebate } from "@/components/debate/about-debate";
import { DebateExperience } from "@/components/debate/debate-experience";
import { HowItWorks } from "@/components/debate/how-it-works";
import { DEBATES, getDebate, getOption } from "@/lib/debates";
import { debateMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";

// Every real URL here is fully prerendered (ensureStatic in the root layout),
// so navigations load static output. Params are read up front rather than
// behind Suspense so unknown URLs get a true 404; this opts the route out of
// the instant-shell validation that pattern would otherwise trip.
export const instant = false;

/**
 * Landing page for shared votes. The link preview shows the sharer's card;
 * the page itself is the debate, so whoever taps it can vote straight away.
 */
export function generateStaticParams() {
  return DEBATES.flatMap((debate) => debate.options.map((option) => ({ debate: debate.slug, choice: option.slug })));
}

async function resolve(params: PageProps<"/[debate]/share/[choice]">["params"]) {
  const { debate: slug, choice } = await params;
  const debate = getDebate(slug);
  const option = debate ? getOption(debate, choice) : undefined;
  return debate && option ? { debate, option } : null;
}

export async function generateMetadata({ params }: PageProps<"/[debate]/share/[choice]">): Promise<Metadata> {
  const found = await resolve(params);
  if (!found) return { title: "Page not found" };
  const { debate, option } = found;
  const title = `I voted ${option.shortName}. ${debate.question}`;
  const description = `${option.name} got a vote in the world’s live ${debate.title} poll. Who’s yours? Vote in one tap at ${SITE_NAME}.`;
  const image = {
    url: `/api/card/${debate.slug}/${option.slug}/og`,
    width: 1200,
    height: 630,
    type: "image/jpeg",
    alt: `I voted ${option.name}. ${debate.question}`,
  };
  return debateMetadata(debate, `/${debate.slug}`, {
    title: { absolute: `${title} | ${SITE_NAME}` },
    description,
    robots: { index: false, follow: true },
    openGraph: { type: "website", url: `/${debate.slug}/share/${option.slug}`, title, description, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  });
}

export default async function SharedVotePage({ params }: PageProps<"/[debate]/share/[choice]">) {
  const found = await resolve(params);
  if (!found) notFound();
  const { debate, option } = found;

  const banner = (
    <p className="mb-6 flex items-center gap-2 text-sm text-white/80">
      <span aria-hidden="true" className="size-2" style={{ background: option.color }} />
      Someone voted {option.shortName}. Who gets yours?
    </p>
  );

  return (
    <ViewTransition enter="page" exit="page" default="none">
      <div>
        <DebateExperience debate={debate} banner={banner} />
        <AboutDebate debate={debate} />
        <HowItWorks />
      </div>
    </ViewTransition>
  );
}
