"use client";

import Link from "next/link";

import { AnimatedNumber } from "@/components/ui/animated-number";
import type { Debate } from "@/lib/debates";
import { countryFlag, countryName, formatCount, formatPercent, pluralize } from "@/lib/format";
import { optionPercentages, votesFor, type DebateResults } from "@/lib/results";

import { SplitBar } from "./split-bar";

/** The live numbers: headline stats and the country-by-country breakdown. */
export function ResultsBoard({
  debate,
  results,
  unavailable,
  highlightCountry,
  countryLimit,
  showFullResultsLink = false,
}: {
  debate: Debate;
  results: DebateResults | null;
  unavailable: boolean;
  highlightCountry?: string | null;
  countryLimit?: number;
  showFullResultsLink?: boolean;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <section aria-labelledby="stats-title">
        <p className="type-label text-mute">Live statistics</p>
        <h2 id="stats-title" className="type-headline mt-3 text-4xl sm:text-5xl">
          The numbers
        </h2>
        <StatsGrid debate={debate} results={results} unavailable={unavailable} />
      </section>

      <section aria-labelledby="countries-title" className="mt-16 sm:mt-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="type-label text-mute">Global breakdown</p>
            <h2 id="countries-title" className="type-headline mt-3 text-4xl sm:text-5xl">
              Country by country
            </h2>
          </div>
          {showFullResultsLink ? (
            <Link
              href={`/${debate.slug}/results`}
              className="type-label inline-flex h-11 items-center gap-2 border border-ink px-4 text-ink transition-colors hover:bg-paper-2"
            >
              Full results
              <span aria-hidden="true">→</span>
            </Link>
          ) : null}
        </div>
        <CountryTable debate={debate} results={results} highlightCountry={highlightCountry} limit={countryLimit} />
      </section>
    </div>
  );
}

function StatsGrid({ debate, results, unavailable }: { debate: Debate; results: DebateResults | null; unavailable: boolean }) {
  const [a, b] = debate.options;
  const percents = results ? optionPercentages(results.options, [a.slug, b.slug]) : [0, 0];

  const tiles = [
    { label: "Total votes", value: results ? <AnimatedNumber value={results.total} format="count" /> : null },
    {
      label: "Countries voting",
      value: results ? <AnimatedNumber value={results.countries.count} format="count" /> : null,
    },
    ...debate.options.map((option, i) => ({
      label: option.shortName,
      accent: option.color,
      value: results ? <AnimatedNumber value={percents[i]} format="percent" /> : null,
      detail: results
        ? `${formatCount(votesFor(results.options, option.slug))} ${pluralize(votesFor(results.options, option.slug), "vote")}`
        : null,
    })),
  ];

  return (
    <dl className="mt-8 grid grid-cols-2 border-l border-t border-rule lg:grid-cols-4">
      {tiles.map((tile) => (
        <div key={tile.label} className="flex min-h-32 flex-col justify-between border-b border-r border-rule p-4 sm:min-h-40 sm:p-6">
          <dt className="type-label flex items-center gap-2 text-mute">
            {"accent" in tile ? <span aria-hidden="true" className="size-2.5" style={{ background: tile.accent }} /> : null}
            {tile.label}
          </dt>
          <dd className="mt-4">
            {tile.value ? (
              <span className="type-display block text-[2.6rem] sm:text-6xl">{tile.value}</span>
            ) : unavailable ? (
              <span className="text-sm text-mute">Unavailable right now</span>
            ) : (
              <span className="skeleton block h-10 w-28" aria-label="Loading" />
            )}
            {"detail" in tile && tile.detail ? <span className="tabular mt-1 block text-sm text-mute">{tile.detail}</span> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Swatch({ color }: { color: string }) {
  return <span aria-hidden="true" className="inline-block size-2 shrink-0" style={{ background: color }} />;
}

function CountryTable({
  debate,
  results,
  highlightCountry,
  limit,
}: {
  debate: Debate;
  results: DebateResults | null;
  highlightCountry?: string | null;
  limit?: number;
}) {
  const [a, b] = debate.options;

  if (!results) {
    return (
      <div className="mt-8 space-y-3" aria-label="Loading country results">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="skeleton h-14 w-full" />
        ))}
      </div>
    );
  }

  const rows = limit ? results.countries.rows.slice(0, limit) : results.countries.rows;
  if (rows.length === 0) {
    return (
      <p className="mt-8 max-w-xl border-t border-rule pt-6 text-lg leading-relaxed text-ink/75">
        {results.countries.count > 0
          ? `Votes have arrived from ${formatCount(results.countries.count)} ${pluralize(results.countries.count, "country", "countries")}. `
          : ""}
        Each country’s split appears here once it has enough votes to be meaningful.
      </p>
    );
  }

  return (
    <div className="mt-8">
      <div className="type-label hidden grid-cols-[2.5rem_minmax(0,1.4fr)_minmax(0,2fr)_6rem_6rem_7rem] gap-4 border-b border-ink pb-3 text-mute md:grid">
        <span>#</span>
        <span>Country</span>
        <span>Split</span>
        <span className="flex items-center justify-end gap-2">
          <Swatch color={a.color} />
          {a.shortName}
        </span>
        <span className="flex items-center justify-end gap-2">
          <Swatch color={b.color} />
          {b.shortName}
        </span>
        <span className="text-right">Votes</span>
      </div>
      <ol>
        {rows.map((row, i) => {
          const [pa, pb] = optionPercentages(
            Object.entries(row.votes).map(([option, votes]) => ({ option, votes })),
            [a.slug, b.slug],
          );
          const mine = highlightCountry === row.code;
          const name = countryName(row.code);
          return (
            <li
              key={row.code}
              className={`grid grid-cols-[1.75rem_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 border-b border-rule py-4 md:grid-cols-[2.5rem_minmax(0,1.4fr)_minmax(0,2fr)_6rem_6rem_7rem] md:gap-4 ${mine ? "bg-paper-2 -mx-2 px-2 md:-mx-3 md:px-3" : ""}`}
            >
              <span className="tabular text-sm font-bold text-mute">{i + 1}</span>
              <span className="flex min-w-0 items-center gap-2 font-bold">
                <span aria-hidden="true" className="text-lg leading-none">
                  {countryFlag(row.code)}
                </span>
                <span className="truncate">{name}</span>
                {mine ? <span className="type-label shrink-0 bg-ink px-1.5 py-0.5 text-[0.6rem] text-white">You</span> : null}
              </span>
              <span className="tabular flex items-center gap-2 text-right text-sm md:hidden">
                <Swatch color={a.color} />
                <span className="font-bold">{formatPercent(pa)}</span>
                <Swatch color={b.color} />
                <span className="font-bold">{formatPercent(pb)}</span>
              </span>
              <div className="col-span-3 col-start-2 md:col-span-1 md:col-start-auto">
                <SplitBar options={debate.options} percents={[pa, pb]} size="h-2" track="bg-ink/10" className="text-paper" />
                <span className="tabular mt-1.5 block text-xs text-mute md:hidden">
                  {formatCount(row.total)} {pluralize(row.total, "vote")}
                </span>
              </div>
              <span className="tabular hidden text-right font-bold md:block">{formatPercent(pa)}</span>
              <span className="tabular hidden text-right font-bold md:block">{formatPercent(pb)}</span>
              <span className="tabular hidden text-right text-mute md:block">{formatCount(row.total)}</span>
            </li>
          );
        })}
      </ol>
      {limit && results.countries.rows.length > limit ? (
        <p className="mt-4 text-sm text-mute">
          Showing the top {limit} of {formatCount(results.countries.rows.length)} countries with published results.
        </p>
      ) : null}
    </div>
  );
}
