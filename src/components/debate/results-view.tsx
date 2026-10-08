"use client";

import Link from "next/link";

import { AnimatedNumber } from "@/components/ui/animated-number";
import { getOption } from "@/lib/debates";
import { formatCount, pluralize } from "@/lib/format";
import { optionPercentages } from "@/lib/results";

import { useDebate } from "./debate-provider";
import { CountryBreakdown } from "./results-board";
import { ResultBars } from "./result-bars";

/** Public results for a debate, open to everyone whether or not they've voted. */
export function ResultsView() {
  const { debate, results, resultsUnavailable, vote } = useDebate();
  const percents = results ? optionPercentages(results.options, debate.options.map((o) => o.slug)) : null;
  const chosen = vote.choice ? getOption(debate, vote.choice) : undefined;

  return (
    <>
      <section aria-labelledby="results-title" className="bg-ink text-white">
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-12">
          <p className="type-label text-mute-dark">Results</p>
          <h1 id="results-title" className="type-headline mt-3 text-[2.6rem] sm:text-6xl">
            {debate.title}
          </h1>
          <p className="mt-3 text-base text-mute-dark sm:text-lg">
            {results ? (
              <>
                <span className="tabular font-semibold text-white">
                  <AnimatedNumber value={results.total} format="count" />
                </span>{" "}
                {pluralize(results.total, "vote")}
                {results.countries.count > 0
                  ? ` from ${formatCount(results.countries.count)} ${pluralize(results.countries.count, "country", "countries")}`
                  : null}
                . Updates as votes come in.
              </>
            ) : resultsUnavailable ? (
              "Results are unavailable right now."
            ) : (
              "Loading results…"
            )}
          </p>

          <div className="mt-10 grid grid-cols-2 gap-6">
            {debate.options.map((option, i) => (
              <p key={option.slug} className={`type-display text-[3.25rem] sm:text-8xl ${i === 1 ? "text-right" : ""}`} style={{ color: option.color }}>
                {percents ? <AnimatedNumber value={percents[i]} format="percent" /> : <span className="text-white/20">—</span>}
                <span className="sr-only"> {option.name}</span>
              </p>
            ))}
          </div>

          <ResultBars debate={debate} results={results} className="mt-8" />

          <div className="mt-10">
            {vote.phase === "voted" && chosen ? (
              <Link href={`/${debate.slug}#share`} className="btn btn-light">
                Share your {chosen.shortName} card
              </Link>
            ) : (
              <Link href={`/${debate.slug}`} className="btn btn-light">
                Cast your vote
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="bg-paper">
        <CountryBreakdown debate={debate} results={results} unavailable={resultsUnavailable} highlightCountry={vote.country} />
      </div>
    </>
  );
}
