import type { Metadata } from "next";
import Link from "next/link";
import { Fragment, ViewTransition } from "react";

import { AdSlot } from "@/components/ads/ad-slot";
import { PageHero } from "@/components/layout/page-hero";
import { DEBATES, CATEGORY_LABELS, UPCOMING_DEBATES, type Debate } from "@/lib/debates";

export const metadata: Metadata = {
  title: "Debates",
  description:
    "The biggest arguments in sport and culture, settled by a public vote: Messi vs Ronaldo, LeBron vs Jordan, Tyson vs Ali, Drake vs Kendrick and more.",
  alternates: { canonical: "/debates" },
};

export default function DebatesPage() {
  return (
    <ViewTransition enter="page" exit="page" default="none">
      <div>
        <PageHero title="Debates">The longest-running arguments in sport and culture, each put to one public vote.</PageHero>

        <div className="bg-paper">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
            <ul className="border-t-2 border-ink">
              {DEBATES.map((debate, index) => (
                <Fragment key={debate.slug}>
                  <DebateRow debate={debate} />
                  {index === 3 || index === 7 ? (
                    <li className="list-none border-b border-rule">
                      <AdSlot placement="editorial" kind="bar" className="!px-0 !py-4" />
                    </li>
                  ) : null}
                </Fragment>
              ))}
            </ul>

            <AdSlot placement="editorial" className="!px-0" />

            <section aria-labelledby="upcoming-title" className="mt-16 sm:mt-20">
              <h2 id="upcoming-title" className="type-title">
                Coming up
              </h2>
              <ul className="mt-6 grid gap-x-10 sm:grid-cols-2">
                {UPCOMING_DEBATES.map((item) => (
                  <li key={item.title} className="flex items-baseline justify-between gap-4 border-b border-rule py-3.5">
                    <span className="font-semibold">{item.title}</span>
                    <span className="text-sm text-mute">{item.category}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </ViewTransition>
  );
}

function DebateRow({ debate }: { debate: Debate }) {
  return (
    <li className="grid gap-6 border-b border-rule py-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
      <div>
        <h2 className="type-display text-5xl sm:text-7xl">
          <Link href={`/${debate.slug}`} className="transition-opacity duration-[var(--duration-micro)] hover:opacity-70">
            {debate.title}
          </Link>
        </h2>
        <p className="mt-3 text-mute">
          {CATEGORY_LABELS[debate.category]} · Open
        </p>
      </div>
      <div className="flex items-center gap-6">
        <Link href={`/${debate.slug}`} className="btn btn-dark">
          Vote
        </Link>
        <Link href={`/${debate.slug}/results`} className="link text-sm font-semibold">
          Results
        </Link>
      </div>
    </li>
  );
}
