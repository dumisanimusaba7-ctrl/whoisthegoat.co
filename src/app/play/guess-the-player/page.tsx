import type { Metadata } from "next";
import { ViewTransition } from "react";

import { AdSlot } from "@/components/ads/ad-slot";
import { GuessThePlayer } from "@/components/play/guess-the-player";

export const metadata: Metadata = {
  title: "Who is that? Guess the footballer from the celebration",
  description: "15 famous goal celebrations as black silhouettes. Name the player from the pose alone: the Siu, the shirt show, the temple point and more.",
  alternates: { canonical: "/play/guess-the-player" },
};

export default function GuessThePlayerPage() {
  return (
    <ViewTransition enter="page" exit="page" default="none">
      <div>
        <section className="bg-ink text-white" aria-label="The game">
          <GuessThePlayer />
        </section>
        <AdSlot placement="editorial" kind="bar" className="border-t border-rule" />
      </div>
    </ViewTransition>
  );
}
