import type { Metadata } from "next";
import { ViewTransition } from "react";

import { AdSlot } from "@/components/ads/ad-slot";
import { AboutDebate } from "@/components/debate/about-debate";
import { DebateExperience } from "@/components/debate/debate-experience";
import { HowItWorks } from "@/components/debate/how-it-works";
import { JsonLd } from "@/components/json-ld";
import { FaqSection } from "@/components/seo/faq-section";
import { GoatHub } from "@/components/seo/goat-hub";
import { getFeaturedDebate } from "@/lib/debates";
import { debateFaqs, GOAT_MEANING } from "@/lib/faq";
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
        <GoatHub />
        <AdSlot placement="editorial" className="border-t border-rule" />
        <FaqSection title="Who is the GOAT? Your questions" faqs={[GOAT_MEANING, ...debateFaqs(debate)]} />
        <HowItWorks />
        <JsonLd data={debateJsonLd(debate, "/")} />
      </div>
    </ViewTransition>
  );
}
