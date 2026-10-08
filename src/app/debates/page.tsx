import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/layout/page-hero";
import { LiveDot } from "@/components/ui/live-dot";
import { DEBATES, SPORT_LABELS, UPCOMING_DEBATES, type Debate } from "@/lib/debates";
import { formatCount, pluralize } from "@/lib/format";
import { getPageResults } from "@/lib/server/results";

export const metadata: Metadata = {
  title: "Debates",
  description: "Sport’s biggest arguments, settled by a live global vote. Messi vs Ronaldo is open now, with more debates on the way.",
  alternates: { canonical: "/debates" },
};

export default function DebatesPage() {
  return (
    <>
      <PageHero kicker="Debates" title="The big questions">
        Sport’s oldest arguments, settled by the only judge that counts: everyone.
      </PageHero>

      <section aria-labelledby="open-title" className="bg-paper">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <h2 id="open-title" className="type-label text-mute">
            Open now
          </h2>
          <ul className="mt-6 border-t-2 border-ink">
            {DEBATES.map((debate) => (
              <DebateRow key={debate.slug} debate={debate} />
            ))}
          </ul>

          <h2 className="type-label mt-16 text-mute">Coming up</h2>
          <ul className="mt-6 grid border-l border-t border-rule sm:grid-cols-2 lg:grid-cols-3">
            {UPCOMING_DEBATES.map((item) => (
              <li key={item.title} className="flex items-center justify-between gap-4 border-b border-r border-rule p-5">
                <div>
                  <p className="type-label text-mute">{item.sport}</p>
                  <p className="mt-1 text-lg font-bold">{item.title}</p>
                </div>
                <span className="type-label shrink-0 text-mute">Soon</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

async function DebateRow({ debate }: { debate: Debate }) {
  const results = await getPageResults(debate.slug);
  return (
    <li className="grid gap-6 border-b border-rule py-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
      <div>
        <p className="type-label flex items-center gap-2 text-mute">
          <LiveDot /> {SPORT_LABELS[debate.sport]} · Live
        </p>
        <h3 className="type-display mt-3 text-5xl sm:text-7xl">
          <Link href={`/${debate.slug}`} className="hover:underline hover:decoration-4 hover:underline-offset-8">
            {debate.title}
          </Link>
        </h3>
        <p className="mt-3 text-lg text-ink/75">
          {debate.question}
          {results && results.total > 0
            ? ` ${formatCount(results.total)} ${pluralize(results.total, "vote")} so far.`
            : null}
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          href={`/${debate.slug}`}
          className="type-label inline-flex h-12 items-center bg-ink px-5 text-white transition-colors hover:bg-ink-3"
        >
          Vote now
        </Link>
        <Link
          href={`/${debate.slug}/results`}
          className="type-label inline-flex h-12 items-center border border-ink px-5 transition-colors hover:bg-paper-2"
        >
          Results
        </Link>
      </div>
    </li>
  );
}
