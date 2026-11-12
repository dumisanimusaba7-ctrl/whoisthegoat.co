import type { Metadata } from "next";
import { ViewTransition } from "react";

import { AdSlot } from "@/components/ads/ad-slot";
import { KnowYourGoats } from "@/components/play/know-your-goats";

export const metadata: Metadata = {
  title: "Know your GOATs: the quiz",
  description: "Pick Ronaldo, Messi, Jordan, LeBron, McGregor or Khabib and answer 10 questions against the clock. Harder questions and faster answers score more.",
  alternates: { canonical: "/play/know-your-goats" },
};

export default function KnowYourGoatsPage() {
  return (
    <ViewTransition enter="page" exit="page" default="none">
      <div>
        <section className="bg-ink text-white" aria-label="The quiz">
          <KnowYourGoats />
        </section>
        <AdSlot placement="editorial" kind="bar" className="border-t border-rule" />
      </div>
    </ViewTransition>
  );
}
