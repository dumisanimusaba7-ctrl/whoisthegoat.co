import type { Metadata } from "next";
import Link from "next/link";
import { ViewTransition } from "react";

import { ResultBars } from "@/components/debate/result-bars";
import { PageHero } from "@/components/layout/page-hero";
import { DEBATES, SPORT_LABELS, type Debate } from "@/lib/debates";
import { formatCount, formatPercent, pluralize } from "@/lib/format";
import { optionPercentages } from "@/lib/results";
import { getPageResults } from "@/lib/server/results";

export const metadata: Metadata = {
  title: "Results",
  description: "Results for every debate on WHOISTHEGOAT.CO: the global split and how each country voted.",
  alternates: { canonical: "/results" },
};

export default function ResultsIndexPage() {
  return (
    <ViewTransition enter="page" exit="page" default="none">
      <div>
        <PageHero title="Results">Where every debate stands. Open one for the country-by-country split.</PageHero>
        <div className="bg-paper">
          <ul className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
            {DEBATES.map((debate) => (
              <ResultRow key={debate.slug} debate={debate} />
            ))}
          </ul>
        </div>
      </div>
    </ViewTransition>
  );
}

async function ResultRow({ debate }: { debate: Debate }) {
  const results = await getPageResults(debate.slug);
  const percents = results ? optionPercentages(results.options, debate.options.map((o) => o.slug)) : null;

  return (
    <li className="border-t-2 border-ink py-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 className="type-display text-5xl sm:text-6xl">
          <Link href={`/${debate.slug}/results`} className="transition-opacity duration-[var(--duration-micro)] hover:opacity-70">
            {debate.title}
          </Link>
        </h2>
        <p className="text-mute">
          {SPORT_LABELS[debate.sport]}
          {results && results.total > 0
            ? ` · ${formatCount(results.total)} ${pluralize(results.total, "vote")} from ${formatCount(results.countries.count)} ${pluralize(results.countries.count, "country", "countries")}`
            : null}
        </p>
      </div>

      {results && results.total > 0 && percents ? (
        <>
          <div className="mt-6 flex justify-between gap-4">
            {debate.options.map((option, i) => (
              <p key={option.slug} className="type-display text-4xl sm:text-5xl">
                {formatPercent(percents[i])}
                <span className="sr-only"> {option.name}</span>
              </p>
            ))}
          </div>
          <ResultBars debate={debate} results={results} tone="light" className="mt-4" />
        </>
      ) : (
        <p className="mt-4 text-ink/75">{results ? "Voting is open. No votes yet." : "Results are loading on the debate page."}</p>
      )}

      <Link href={`/${debate.slug}/results`} className="link mt-6 inline-flex min-h-11 items-center text-sm font-semibold">
        Full results and countries
      </Link>
    </li>
  );
}
