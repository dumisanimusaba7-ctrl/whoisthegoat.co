import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { AnimatedNumber } from "@/components/ui/animated-number";
import type { Debate, DebateOption } from "@/lib/debates";
import {
  categoryCounts,
  competitionCounts,
  findCategory,
  teamTotals,
  type Cabinet,
  type CabinetCategory,
  type Honour,
  type TrophyKind,
} from "@/lib/trophies";

import { Reveal } from "./reveal";
import { TrophyIcon, TrophySprite } from "./trophy-art";

type Side = 0 | 1;

/** The full cabinet: totals, the headline honours, every trophy by category, records. */
export function TrophyCabinet({ debate, cabinet }: { debate: Debate; cabinet: Cabinet }) {
  const individual = cabinet.individual;
  return (
    <>
      <TrophySprite />
      <Hero debate={debate} cabinet={cabinet} />

      <section aria-labelledby="team-title" className="bg-ink text-white">
        <div className="mx-auto max-w-6xl px-4 pb-6 pt-14 sm:px-6 sm:pt-20">
          <SectionHeading id="team-title" title="Team trophies">
            Senior honours with club and country. These make up the totals.
          </SectionHeading>
          {cabinet.team.map((category) => (
            <CategoryBlock key={category.id} debate={debate} category={category} />
          ))}
          <CategoryBlock debate={debate} category={cabinet.youth} muted />
        </div>
      </section>

      <section aria-labelledby="awards-title" className="border-t border-white/10 bg-ink-2 text-white">
        <div className="mx-auto max-w-6xl px-4 pb-6 pt-14 sm:px-6 sm:pt-20">
          <SectionHeading id="awards-title" title="Individual awards">
            The game’s biggest awards for a single player.
          </SectionHeading>
          {individual.map((category) => (
            <CategoryBlock key={category.id} debate={debate} category={category} />
          ))}
        </div>
      </section>

      <Records debate={debate} cabinet={cabinet} />

      <section className="bg-ink text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-14 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <h2 className="type-title max-w-md">You’ve seen the cabinets. Now cast your vote.</h2>
          <Link href={`/${debate.slug}`} className="btn btn-light w-full sm:w-auto">
            Vote {debate.title}
          </Link>
        </div>
      </section>
    </>
  );
}

function SectionHeading({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <div className="pb-4">
      <h2 id={id} className="type-title">
        {title}
      </h2>
      <p className="mt-2 max-w-xl text-mute-dark">{children}</p>
    </div>
  );
}

/** Opening spread: the totals count up and the headline trophies rise into place. */
function Hero({ debate, cabinet }: { debate: Debate; cabinet: Cabinet }) {
  const [a, b] = debate.options;
  const totals = teamTotals(cabinet);
  const youth = categoryCounts(cabinet.youth);
  const rows: { label: string; kind: TrophyKind; counts: [number, number] }[] = [
    { label: "Ballon d’Or", kind: "ballon-dor", counts: countsFor(cabinet, "ballon-dor") },
    { label: "Champions League", kind: "champions-league", counts: countsFor(cabinet, "champions-league") },
    { label: "World Cup", kind: "world-cup", counts: competitionCounts(cabinet, "FIFA World Cup") },
    { label: "League titles", kind: "league", counts: countsFor(cabinet, "league") },
    { label: "International trophies", kind: "continental", counts: countsFor(cabinet, "international") },
  ];

  return (
    <section aria-labelledby="cabinet-title" className="bg-ink text-white">
      <div className="mx-auto max-w-6xl px-4 pb-14 pt-8 sm:px-6 sm:pb-20 sm:pt-12">
        <p className="type-label text-mute-dark">Trophy cabinet</p>
        <h1 id="cabinet-title" className="type-headline animate-enter mt-3 text-[2.6rem] sm:text-6xl lg:text-[4.75rem]">
          {debate.title}
        </h1>
        <p className="mt-3 max-w-xl text-base text-mute-dark sm:text-lg">
          Every team trophy and major individual award, side by side. As of {cabinet.asOf}.
        </p>

        <div className="mt-10 grid grid-cols-2 border-y border-white/10">
          {[a, b].map((option, i) => (
            <div key={option.slug} className={`relative py-6 sm:py-8 ${i === 1 ? "border-l border-white/10 pl-4 text-right sm:pl-8" : "pr-4 sm:pr-8"}`}>
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1" style={{ background: option.color }} />
              <p className="text-sm font-semibold text-white/80">{option.name}</p>
              <p className="type-display tabular mt-2 text-[4.5rem] leading-[0.85] sm:text-[7.5rem]" style={{ color: option.color }}>
                <AnimatedNumber value={totals[i]} from={0} duration={1400} format="count" />
              </p>
              <p className="mt-2 text-sm text-mute-dark">
                team trophies
                {youth[i] > 0 ? <span className="block sm:inline">{` + ${youth[i]} youth titles`}</span> : null}
              </p>
            </div>
          ))}
        </div>

        <table className="mx-auto mt-6 w-full max-w-3xl border-collapse">
          <caption className="sr-only">Headline honours</caption>
          <thead className="sr-only">
            <tr>
              <th scope="col">{a.name}</th>
              <th scope="col">Honour</th>
              <th scope="col">{b.name}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.label} className="border-b border-white/10">
                <td className="type-display w-1/3 py-4 text-left align-middle text-4xl sm:text-5xl" style={{ color: a.color }}>
                  {row.counts[0]}
                </td>
                <th scope="row" className="py-4 align-middle font-normal">
                  <span className="flex flex-col items-center gap-2">
                    <TrophyIcon kind={row.kind} className="trophy-intro h-12 w-9 sm:h-16 sm:w-12" style={{ "--i": i } as CSSProperties} />
                    <span className="text-center text-sm font-semibold text-white/85">{row.label}</span>
                    <CompareBar counts={row.counts} options={[a, b]} className="w-24 sm:w-40" fillClassName="grow-intro" index={i} />
                  </span>
                </th>
                <td className="type-display w-1/3 py-4 text-right align-middle text-4xl sm:text-5xl" style={{ color: b.color }}>
                  {row.counts[1]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function countsFor(cabinet: Cabinet, id: string): [number, number] {
  const category = findCategory(cabinet, id);
  return category ? categoryCounts(category) : [0, 0];
}

/** Two-tone bar split in proportion to the two counts. */
function CompareBar({
  counts,
  options,
  className = "",
  fillClassName = "",
  index = 0,
}: {
  counts: [number, number];
  options: [DebateOption, DebateOption];
  className?: string;
  /** Entrance animation for the two fills. */
  fillClassName?: string;
  index?: number;
}) {
  const total = counts[0] + counts[1];
  const share = total > 0 ? counts[0] / total : 0.5;
  const style = (i: Side): CSSProperties => ({ background: options[i].color, "--i": index }) as CSSProperties;
  return (
    <span aria-hidden="true" className={`relative block h-1.5 bg-white/10 ${className}`}>
      {total > 0 ? (
        <>
          <span className={`absolute inset-y-0 left-0 origin-left ${fillClassName}`} style={{ ...style(0), width: `${share * 100}%` }} />
          <span className={`absolute inset-y-0 right-0 origin-right ${fillClassName}`} style={{ ...style(1), width: `${(1 - share) * 100}%` }} />
        </>
      ) : null}
    </span>
  );
}

/** One category: the score, then each player's shelf of trophies. */
function CategoryBlock({ debate, category, muted = false }: { debate: Debate; category: CabinetCategory; muted?: boolean }) {
  const [a, b] = debate.options;
  const counts = categoryCounts(category);
  return (
    <Reveal className="border-t border-white/10 py-10 sm:py-14">
      <article aria-labelledby={`cat-${category.id}`}>
        <div className="reveal-up flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h3 id={`cat-${category.id}`} className="text-xl font-bold sm:text-2xl">
            {category.title}
          </h3>
          {category.note ? <p className="text-sm text-mute-dark">{category.note}</p> : null}
        </div>
        <div className="reveal-up mt-4 flex items-end justify-between">
          {[a, b].map((option, i) => (
            <p key={option.slug} className={`type-display text-4xl sm:text-5xl ${muted ? "opacity-70" : ""}`} style={{ color: option.color }}>
              {counts[i]}
              <span className="sr-only"> for {option.name}</span>
            </p>
          ))}
        </div>
        <div className="mt-3">
          <CompareBar counts={counts} options={[a, b]} fillClassName="reveal-grow" />
        </div>
        <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-14">
          <Shelf option={a} honours={category.honours[0]} side={0} />
          <Shelf option={b} honours={category.honours[1]} side={1} />
        </div>
      </article>
    </Reveal>
  );
}

/** A player's trophies in one category, grouped by competition: one trophy per title. */
function Shelf({ option, honours, side }: { option: DebateOption; honours: Honour[]; side: Side }) {
  const end = side === 1;
  // Stagger every trophy on the shelf in order, across the groups.
  const offsets = honours.map((_, i) => honours.slice(0, i).reduce((sum, h) => sum + h.seasons.length, 0));
  return (
    <div className={end ? "md:text-right" : ""}>
      <p className="type-label flex items-center gap-2 text-white/80 md:hidden">
        <span aria-hidden="true" className="size-2" style={{ background: option.color }} />
        {option.shortName}
      </p>
      {honours.length === 0 ? (
        <p className="mt-3 text-sm text-mute-dark md:mt-0">None</p>
      ) : (
        <ul className={`mt-4 flex flex-wrap gap-x-7 gap-y-8 md:mt-0 ${end ? "md:justify-end" : ""}`}>
          {honours.map((honour, g) => (
            <li key={`${honour.competition}-${honour.team}`} className="min-w-0">
              <div className={`flex flex-wrap items-end gap-1 border-b-2 border-white/15 pb-1 ${end ? "md:justify-end" : ""}`}>
                {honour.seasons.map((season, i) => (
                  <TrophyIcon
                    key={season}
                    kind={honour.kind}
                    className="h-9 w-[27px] sm:h-11 sm:w-[33px] lg:h-12 lg:w-9"
                    style={{ "--i": Math.min(offsets[g] + i, 14) } as CSSProperties}
                  />
                ))}
              </div>
              <p className="mt-2 text-sm font-semibold">
                {honour.competition} <span className="tabular font-normal text-mute-dark">×{honour.seasons.length}</span>
              </p>
              <p className={`mt-0.5 max-w-xs text-xs leading-relaxed text-mute-dark ${end ? "md:ml-auto" : ""}`}>
                {honour.team ? `${honour.team} · ` : ""}
                {honour.seasons.join(", ")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Records({ debate, cabinet }: { debate: Debate; cabinet: Cabinet }) {
  return (
    <section aria-labelledby="records-title" className="bg-paper">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <h2 id="records-title" className="type-title">
          Records
        </h2>
        <div className="mt-8 grid gap-px bg-rule sm:grid-cols-2">
          {debate.options.map((option, i) => (
            <Reveal key={option.slug} className="bg-paper py-8 sm:px-8 sm:first:pl-0 sm:last:pr-0">
              <article className="reveal-up">
                <span aria-hidden="true" className="block h-1 w-10" style={{ background: option.color }} />
                <h3 className="mt-5 text-lg font-bold">{option.name}</h3>
                <ul className="mt-4 space-y-3 leading-relaxed text-ink/80">
                  {cabinet.records[i].map((record) => (
                    <li key={record} className="flex gap-3">
                      <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 bg-ink" />
                      {record}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-mute">
          As of {cabinet.asOf}. Totals count senior team trophies won with club and country; youth titles are listed
          separately. Seasons follow each competition’s own naming.
        </p>
      </div>
    </section>
  );
}
