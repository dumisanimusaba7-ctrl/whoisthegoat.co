import type { Metadata } from "next";
import Link from "next/link";

import { SplitBar } from "@/components/debate/split-bar";
import { PageHero } from "@/components/layout/page-hero";
import { DEBATES, SPORT_LABELS, type Debate } from "@/lib/debates";
import { formatCount, formatPercent, pluralize } from "@/lib/format";
import { optionPercentages } from "@/lib/results";
import { getPageResults } from "@/lib/server/results";

export const metadata: Metadata = {
  title: "Results",
  description: "The world’s verdicts: live global results for every debate on WHOISTHEGOAT.CO, with the split country by country.",
  alternates: { canonical: "/results" },
};

export default function ResultsIndexPage() {
  return (
    <>
      <PageHero kicker="Results" title="The world’s verdicts">
        Every debate, every vote, counted live. Open a debate for the full country-by-country breakdown.
      </PageHero>
      <section className="bg-paper">
        <ul className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          {DEBATES.map((debate) => (
            <ResultRow key={debate.slug} debate={debate} />
          ))}
        </ul>
      </section>
    </>
  );
}

async function ResultRow({ debate }: { debate: Debate }) {
  const results = await getPageResults(debate.slug);
  const [a, b] = debate.options;
  const percents = (results ? optionPercentages(results.options, [a.slug, b.slug]) : [0, 0]) as [number, number];

  return (
    <li className="border-t-2 border-ink py-8">
      <p className="type-label text-mute">{SPORT_LABELS[debate.sport]}</p>
      <h2 className="type-display mt-2 text-5xl sm:text-6xl">
        <Link href={`/${debate.slug}/results`} className="hover:underline hover:decoration-4 hover:underline-offset-8">
          {debate.title}
        </Link>
      </h2>
      {results && results.total > 0 ? (
        <>
          <div className="mt-6 flex items-end justify-between gap-4">
            {debate.options.map((option, i) => (
              <p key={option.slug} className={i === 1 ? "text-right" : ""}>
                <span className="type-label block text-mute">{option.shortName}</span>
                <span className="type-display text-4xl sm:text-5xl">{formatPercent(percents[i])}</span>
              </p>
            ))}
          </div>
          <SplitBar options={debate.options} percents={percents} size="h-3" track="bg-ink/10" className="mt-4 text-paper" />
          <p className="type-label mt-4 text-mute">
            {formatCount(results.total)} {pluralize(results.total, "vote")} ·{" "}
            {formatCount(results.countries.count)} {pluralize(results.countries.count, "country", "countries")}
          </p>
        </>
      ) : (
        <p className="mt-4 text-lg text-ink/75">
          {results ? "Voting is open and the first votes are on their way." : "Live results are loading on the debate page."}
        </p>
      )}
      <Link
        href={`/${debate.slug}/results`}
        className="type-label mt-6 inline-flex h-12 items-center gap-2 border border-ink px-5 transition-colors hover:bg-paper-2"
      >
        Full results <span aria-hidden="true">→</span>
      </Link>
    </li>
  );
}
