import type { Metadata } from "next";
import Link from "next/link";
import { ViewTransition } from "react";

import { PageHero } from "@/components/layout/page-hero";
import { DEBATES, SPORT_LABELS, UPCOMING_DEBATES, type Debate } from "@/lib/debates";
import { formatCount, pluralize } from "@/lib/format";
import { getPageResults } from "@/lib/server/results";

export const metadata: Metadata = {
  title: "Debates",
  description: "Sport’s biggest arguments, settled by a public vote. Messi vs Ronaldo is open now, with more debates to follow.",
  alternates: { canonical: "/debates" },
};

export default function DebatesPage() {
  return (
    <ViewTransition enter="page" exit="page" default="none">
      <div>
        <PageHero title="Debates">Sport’s longest-running arguments, each put to one public vote.</PageHero>

        <div className="bg-paper">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
            <ul className="border-t-2 border-ink">
              {DEBATES.map((debate) => (
                <DebateRow key={debate.slug} debate={debate} />
              ))}
            </ul>

            <section aria-labelledby="upcoming-title" className="mt-16 sm:mt-20">
              <h2 id="upcoming-title" className="type-title">
                Coming up
              </h2>
              <ul className="mt-6 grid gap-x-10 sm:grid-cols-2">
                {UPCOMING_DEBATES.map((item) => (
                  <li key={item.title} className="flex items-baseline justify-between gap-4 border-b border-rule py-3.5">
                    <span className="font-semibold">{item.title}</span>
                    <span className="text-sm text-mute">{item.sport}</span>
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

async function DebateRow({ debate }: { debate: Debate }) {
  const results = await getPageResults(debate.slug);
  return (
    <li className="grid gap-6 border-b border-rule py-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
      <div>
        <h2 className="type-display text-5xl sm:text-7xl">
          <Link href={`/${debate.slug}`} className="transition-opacity duration-[var(--duration-micro)] hover:opacity-70">
            {debate.title}
          </Link>
        </h2>
        <p className="mt-3 text-mute">
          {SPORT_LABELS[debate.sport]} · Open
          {results && results.total > 0 ? ` · ${formatCount(results.total)} ${pluralize(results.total, "vote")}` : null}
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
