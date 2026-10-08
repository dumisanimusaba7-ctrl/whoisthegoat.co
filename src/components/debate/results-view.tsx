"use client";

import Link from "next/link";

import { AnimatedNumber } from "@/components/ui/animated-number";
import { LiveDot } from "@/components/ui/live-dot";
import { getOption } from "@/lib/debates";
import { formatCount, pluralize } from "@/lib/format";
import { optionPercentages, votesFor } from "@/lib/results";

import { useDebate } from "./debate-provider";
import { ResultsBoard } from "./results-board";
import { SplitBar } from "./split-bar";

/** Public live results for a debate, open to everyone whether or not they've voted. */
export function ResultsView() {
  const { debate, results, resultsUnavailable, vote } = useDebate();
  const [a, b] = debate.options;
  const percents = (results ? optionPercentages(results.options, [a.slug, b.slug]) : [0, 0]) as [number, number];
  const chosen = vote.choice ? getOption(debate, vote.choice) : undefined;

  return (
    <>
      <section aria-labelledby="results-title" className="bg-ink text-white">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-8 sm:px-6 sm:pb-16 sm:pt-14">
          <p className="type-label flex items-center gap-2 text-mute-dark">
            <LiveDot /> Live results · Updated as votes arrive
          </p>
          <h1 id="results-title" className="type-headline mt-4 text-[2.6rem] sm:text-6xl lg:text-7xl">
            {debate.title}
          </h1>
          <p className="mt-3 text-base text-mute-dark sm:text-lg">{debate.question} The world’s answer so far.</p>

          <div className="mt-10 grid grid-cols-2 gap-6">
            {debate.options.map((option, i) => (
              <div key={option.slug} className={i === 1 ? "text-right" : ""}>
                <p className="type-label flex items-center gap-2 text-white/85" style={{ justifyContent: i === 1 ? "flex-end" : undefined }}>
                  <span aria-hidden="true" className="size-2.5" style={{ background: option.color }} />
                  {option.name}
                </p>
                <p className="type-display mt-3 text-[3.25rem] sm:text-8xl lg:text-9xl" style={{ color: option.color }}>
                  {results ? <AnimatedNumber value={percents[i]} format="percent" /> : <span className="text-white/20">—</span>}
                </p>
                <p className="tabular mt-2 text-sm text-mute-dark">
                  {results
                    ? `${formatCount(votesFor(results.options, option.slug))} ${pluralize(votesFor(results.options, option.slug), "vote")}`
                    : " "}
                </p>
              </div>
            ))}
          </div>

          <SplitBar options={debate.options} percents={percents} size="h-3 sm:h-4" className="mt-8" />

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <p className="type-label text-mute-dark">
              {results ? (
                <>
                  <span className="tabular text-white">{formatCount(results.total)}</span> total{" "}
                  {pluralize(results.total, "vote")}
                  {results.countries.count > 0 ? (
                    <>
                      {" "}
                      · <span className="tabular text-white">{formatCount(results.countries.count)}</span>{" "}
                      {pluralize(results.countries.count, "country", "countries")}
                    </>
                  ) : null}
                </>
              ) : resultsUnavailable ? (
                "Live count reconnecting…"
              ) : (
                <span className="skeleton-dark inline-block h-3 w-40" aria-label="Loading" />
              )}
            </p>
            {vote.phase === "voted" && chosen ? (
              <Link
                href={`/${debate.slug}#share`}
                className="type-label inline-flex h-12 items-center gap-2 bg-white px-5 text-ink transition-colors hover:bg-paper-2"
              >
                You voted {chosen.shortName} · Share your card
              </Link>
            ) : (
              <Link
                href={`/${debate.slug}`}
                className="type-label inline-flex h-12 items-center gap-2 bg-white px-5 text-ink transition-colors hover:bg-paper-2"
              >
                Cast your vote <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="bg-paper">
        <ResultsBoard debate={debate} results={results} unavailable={resultsUnavailable} highlightCountry={vote.country} />
      </div>
    </>
  );
}
