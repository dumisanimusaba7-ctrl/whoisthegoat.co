import type { Metadata } from "next";
import { ViewTransition } from "react";

import { AdSlot } from "@/components/ads/ad-slot";
import { WhoIsBetter } from "@/components/play/who-is-better";

export const metadata: Metadata = {
  title: "Who is better? The elimination game",
  description: "15 of the most debated footballers. Two at a time, one tap. The one you don't pick disappears and a new challenger steps in, until your ultimate player is left.",
  alternates: { canonical: "/play/who-is-better" },
};

export default function WhoIsBetterPage() {
  return (
    <ViewTransition enter="page" exit="page" default="none">
      <div>
        <section className="bg-ink text-white" aria-label="The game">
          <WhoIsBetter />
        </section>
        <AdSlot placement="editorial" kind="bar" className="border-t border-rule" />
      </div>
    </ViewTransition>
  );
}
