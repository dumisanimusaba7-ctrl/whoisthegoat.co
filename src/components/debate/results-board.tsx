"use client";

import Link from "next/link";

import type { Debate } from "@/lib/debates";
import { countryName, formatCount, formatPercent, pluralize } from "@/lib/format";
import { optionPercentages, type DebateResults } from "@/lib/results";

import { SplitBar } from "./split-bar";

/** How each country split. Published per country once it has enough votes. */
export function CountryBreakdown({
  debate,
  results,
  unavailable,
  highlightCountry,
  limit,
  showFullResultsLink = false,
}: {
  debate: Debate;
  results: DebateResults | null;
  unavailable: boolean;
  highlightCountry?: string | null;
  limit?: number;
  showFullResultsLink?: boolean;
}) {
  return (
    <section aria-labelledby="countries-title" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 id="countries-title" className="type-title">
          By country
        </h2>
        {showFullResultsLink ? (
          <Link href={`/${debate.slug}/results`} className="link text-sm font-semibold">
            All countries
          </Link>
        ) : null}
      </div>
      <Rows debate={debate} results={results} unavailable={unavailable} highlightCountry={highlightCountry} limit={limit} />
    </section>
  );
}

function Swatch({ color }: { color: string }) {
  return <span aria-hidden="true" className="inline-block size-2 shrink-0" style={{ background: color }} />;
}

function Rows({
  debate,
  results,
  unavailable,
  highlightCountry,
  limit,
}: {
  debate: Debate;
  results: DebateResults | null;
  unavailable: boolean;
  highlightCountry?: string | null;
  limit?: number;
}) {
  const [a, b] = debate.options;

  if (!results) {
    return <p className="mt-6 text-mute">{unavailable ? "Country results are unavailable right now." : "Loading country results…"}</p>;
  }

  const rows = limit ? results.countries.rows.slice(0, limit) : results.countries.rows;
  if (rows.length === 0) {
    return (
      <p className="mt-6 max-w-xl leading-relaxed text-ink/75">
        {results.countries.count > 0
          ? `Votes have come in from ${formatCount(results.countries.count)} ${pluralize(results.countries.count, "country", "countries")}. `
          : ""}
        A country’s split is shown once it has enough votes to be meaningful.
      </p>
    );
  }

  const columns = "md:grid-cols-[2rem_minmax(0,1.3fr)_minmax(0,2fr)_5.5rem_5.5rem_6.5rem]";
  return (
    <div className="mt-8">
      <div className={`type-label hidden gap-4 border-b border-ink pb-3 text-mute md:grid ${columns}`}>
        <span className="sr-only">Rank</span>
        <span className="col-start-2">Country</span>
        <span>
          <span className="sr-only">Split</span>
        </span>
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
          return (
            <li
              key={row.code}
              className={`grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 border-b border-rule py-3.5 md:gap-4 ${columns} ${mine ? "-mx-2 bg-paper-2 px-2 md:-mx-3 md:px-3" : ""}`}
            >
              <span className="tabular text-sm text-mute">{i + 1}</span>
              <span className="min-w-0 truncate font-semibold">
                {countryName(row.code)}
                {mine ? <span className="ml-2 text-sm font-normal text-mute">Your country</span> : null}
              </span>
              <span className="tabular flex items-center gap-2 text-sm md:hidden">
                <Swatch color={a.color} />
                {formatPercent(pa)}
                <Swatch color={b.color} />
                {formatPercent(pb)}
              </span>
              <div className="col-span-3 col-start-2 md:col-span-1 md:col-start-auto">
                <SplitBar options={debate.options} percents={[pa, pb]} />
                <span className="tabular mt-1.5 block text-xs text-mute md:hidden">
                  {formatCount(row.total)} {pluralize(row.total, "vote")}
                </span>
              </div>
              <span className="tabular hidden text-right md:block">{formatPercent(pa)}</span>
              <span className="tabular hidden text-right md:block">{formatPercent(pb)}</span>
              <span className="tabular hidden text-right text-mute md:block">{formatCount(row.total)}</span>
            </li>
          );
        })}
      </ol>
      {limit && results.countries.rows.length > limit ? (
        <p className="mt-4 text-sm text-mute">
          Top {limit} of {formatCount(results.countries.rows.length)} countries with published results.
        </p>
      ) : null}
    </div>
  );
}
