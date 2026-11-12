import type { Metadata } from "next";
import Link from "next/link";
import { ViewTransition } from "react";

import { AdSlot } from "@/components/ads/ad-slot";
import { PageHero } from "@/components/layout/page-hero";

export const metadata: Metadata = {
  title: "Play",
  description: "Football games on WHOISTHEGOATS.COM. Knock players out until your ultimate player is left, or guess the footballer from a celebration silhouette.",
  alternates: { canonical: "/play" },
};

const GAMES = [
  {
    href: "/play/who-is-better",
    title: "Who is better?",
    blurb: "15 of the most debated footballers, two at a time. The one you don't pick disappears. Keep going until your ultimate player is left.",
  },
  {
    href: "/play/guess-the-player",
    title: "Who is that?",
    blurb: "15 famous goal celebrations as black silhouettes. Name the player from the pose alone.",
  },
];

export default function PlayPage() {
  return (
    <ViewTransition enter="page" exit="page" default="none">
      <div>
        <PageHero title="Play">Quick games for people with opinions.</PageHero>
        <div className="bg-paper">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {GAMES.map((game) => (
                <li key={game.href}>
                  <Link href={game.href} className="group flex h-full flex-col justify-between bg-ink p-6 text-white transition-colors duration-[var(--duration-micro)] hover:bg-ink-2">
                    <span>
                      <span className="type-headline block text-3xl">{game.title}</span>
                      <span className="mt-3 block leading-relaxed text-mute-dark">{game.blurb}</span>
                    </span>
                    <span className="mt-6 text-sm font-semibold underline underline-offset-4">Play</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <AdSlot placement="editorial" className="border-t border-rule" />
      </div>
    </ViewTransition>
  );
}
