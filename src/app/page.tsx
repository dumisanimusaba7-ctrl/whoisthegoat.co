import type { Metadata } from "next";
import { ViewTransition } from "react";

import { AdSlot } from "@/components/ads/ad-slot";
import { AboutDebate } from "@/components/debate/about-debate";
import { DebateExperience } from "@/components/debate/debate-experience";
import { HowItWorks } from "@/components/debate/how-it-works";
import { JsonLd } from "@/components/json-ld";
import { getFeaturedDebate } from "@/lib/debates";
import { debateJsonLd, debateMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";

const debate = getFeaturedDebate();

export const metadata: Metadata = debateMetadata(debate, "/", {
  title: { absolute: `Who Is the GOAT? ${debate.title}: The World Decides | ${SITE_NAME}` },
});

export default function HomePage() {
  return (
    <ViewTransition enter="page" exit="page" default="none">
      <div>
        <DebateExperience debate={debate} />
        <AboutDebate debate={debate} />
        <AdSlot placement="editorial" className="border-t border-rule" />
        <HowItWorks />
        <JsonLd data={debateJsonLd(debate, "/")} />
      </div>
    </ViewTransition>
  );
}
