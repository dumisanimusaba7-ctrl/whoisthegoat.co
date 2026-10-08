import type { Metadata } from "next";

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
    <>
      <DebateExperience debate={debate} />
      <AboutDebate debate={debate} />
      <AdSlot placement="editorial" className="border-t border-rule" />
      <HowItWorks />
      <JsonLd data={debateJsonLd(debate, "/")} />
    </>
  );
}
