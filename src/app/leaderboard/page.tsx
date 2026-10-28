import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";

import { AdSlot } from "@/components/ads/ad-slot";
import { PageHero } from "@/components/layout/page-hero";
import { LeaderLink } from "@/components/leaderboard/leader-link";
import { CARD_PHOTOS } from "@/lib/card-photos";
import { CATEGORY_LABELS, DEBATES, type Debate, type DebateOption } from "@/lib/debates";
import { formatPercent } from "@/lib/format";
import { optionPercentages } from "@/lib/results";
import { getPageResults } from "@/lib/server/results";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "Who is leading every debate on WHOISTHEGOATS.COM, and by how much, sport by sport.",
  alternates: { canonical: "/leaderboard" },
};

type Standing = {
  debate: Debate;
  /** Both shares, in option order; null before the first vote. */
  percents: number[] | null;
  leader: DebateOption | null;
  trailer: DebateOption | null;
  /** The leader's margin, in percentage points. */
  gap: number;
};

async function standing(debate: Debate): Promise<Standing> {
  const results = await getPageResults(debate.slug);
  const percents = results && results.total > 0 ? optionPercentages(results.options, debate.options.map((o) => o.slug)) : null;
  const lead = percents && percents[0] !== percents[1] ? (percents[0] > percents[1] ? 0 : 1) : null;
  return {
    debate,
    percents,
    leader: lead === null ? null : debate.options[lead],
    trailer: lead === null ? null : debate.options[1 - lead],
    gap: percents ? Math.abs(percents[0] - percents[1]) : 0,
  };
}

/** Categories in the order their first debate appears on the site. */
function bySport(standings: Standing[]) {
  const sections = new Map<Debate["category"], Standing[]>();
  for (const s of standings) sections.set(s.debate.category, [...(sections.get(s.debate.category) ?? []), s]);
  return [...sections];
}

// A sport's block spans as many columns as it has debates (up to the row), so
// sports with a single debate sit side by side instead of leaving gaps.
const SECTION_SPAN = ["", "col-span-1", "col-span-2", "col-span-2 sm:col-span-3"];
const SECTION_GRID = ["", "grid-cols-1", "grid-cols-2", "grid-cols-2 sm:grid-cols-3"];

export default async function LeaderboardPage() {
  const standings = await Promise.all(DEBATES.map(standing));
  const voted = standings.filter((s) => s.percents);
  const biggest = voted.filter((s) => s.leader).sort((a, b) => b.gap - a.gap)[0];
  const closest = [...voted].sort((a, b) => a.gap - b.gap)[0];

  return (
    <ViewTransition enter="page" exit="page" default="none">
      <div>
        <PageHero title="Leaderboard">Who the world has put in front, sport by sport, and by how much.</PageHero>
        <div className="bg-paper">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
            {voted.length >= 2 && biggest && closest && biggest !== closest ? (
              <div className="mb-12 grid gap-3 sm:mb-16 sm:grid-cols-2 sm:gap-5">
                <Highlight label="Biggest lead" standing={biggest} />
                <Highlight label="Closest race" standing={closest} />
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-x-3 gap-y-12 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-16 lg:grid-cols-4">
              {bySport(standings).map(([category, items]) => {
                const n = Math.min(items.length, 3);
                return (
                  <section key={category} aria-labelledby={`lb-${category}`} className={`flex flex-col ${SECTION_SPAN[n]}`}>
                    <h2 id={`lb-${category}`} className="type-display border-t-2 border-ink pt-4 text-[1.9rem] sm:text-5xl">
                      {CATEGORY_LABELS[category]}
                    </h2>
                    <ul className={`mt-5 grid grow gap-3 sm:gap-5 ${SECTION_GRID[n]}`}>
                      {items.map((s) => (
                        <LeaderTile key={s.debate.slug} standing={s} />
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          </div>
        </div>
        <AdSlot placement="editorial" className="border-t border-rule" />
      </div>
    </ViewTransition>
  );
}

const SIZES = "(min-width: 1024px) 270px, (min-width: 640px) 31vw, 47vw";

function Photo({
  option,
  sizes = SIZES,
  narrow = false,
  className,
}: {
  option: DebateOption;
  sizes?: string;
  /** In a half-width slot, where cropping would cut a brand's logo in two. */
  narrow?: boolean;
  className?: string;
}) {
  const photo = option.cardPhoto ? CARD_PHOTOS[option.cardPhoto] : undefined;
  if (!photo) return <div className={`absolute inset-0 ${className ?? ""}`} style={{ background: option.color }} />;
  // The card photos keep the face (or logo) a third of the way down. Logo cards
  // sit on near-black, so shown whole they blend into the tile.
  const fit = narrow && option.kind === "organization" ? "object-contain" : "object-cover";
  return <Image src={photo} alt="" fill sizes={sizes} placeholder="blur" className={`${fit} object-[50%_30%] ${className ?? ""}`} />;
}

/** The share bar along the top edge: each side's colour runs as far as its share. */
function ShareStrip({ standing }: { standing: Standing }) {
  return (
    <div className="absolute inset-x-0 top-0 z-10 flex h-1.5" aria-hidden="true">
      {standing.debate.options.map((option, i) => (
        <div key={option.slug} style={{ background: option.color, flexGrow: standing.percents ? Math.max(standing.percents[i], 1) : 1 }} />
      ))}
    </div>
  );
}

function LeaderTile({ standing }: { standing: Standing }) {
  const { debate, percents, leader, trailer, gap } = standing;
  return (
    <li className="h-full">
      <LeaderLink debate={debate.slug} options={debate.options.map(({ slug, shortName, color }) => ({ slug, shortName, color }))}>
        {/* The photo stays clear of the text, so the face shows whole. */}
        <div className="relative aspect-[4/5] overflow-hidden">
          {leader ? (
            <Photo option={leader} className="transition-transform duration-[var(--duration-large)] ease-out group-hover:scale-[1.03]" />
          ) : (
            // No leader yet: both sides, half each.
            <div className="absolute inset-0 grid grid-cols-2">
              {debate.options.map((option) => (
                <div key={option.slug} className="relative">
                  <Photo option={option} narrow />
                </div>
              ))}
            </div>
          )}
          <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-ink/75 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-1/6 bg-gradient-to-t from-ink to-transparent" />
          <ShareStrip standing={standing} />
          <p className="type-overline absolute inset-x-3 top-4 text-white/90 sm:inset-x-4">{debate.title}</p>
        </div>

        <div className="flex flex-col px-3 pb-3 pt-2.5 sm:px-4">
          {leader && trailer && percents ? (
            <>
              <p className="type-overline text-mute-dark">Leading</p>
              <p className="type-display mt-1 text-[1.6rem] sm:text-[2rem]">{leader.shortName}</p>
              <p className="type-display mt-0.5 text-[2.2rem] tabular sm:text-[2.6rem]" style={{ color: leader.color }}>
                {formatPercent(Math.max(...percents))}
              </p>
              <p className="mt-1.5 text-[13px] leading-snug text-white/80 sm:text-sm">
                Ahead of {trailer.shortName} by <span className="font-semibold text-white">{formatPoints(gap)}</span>
              </p>
            </>
          ) : (
            <>
              <p className="type-overline text-mute-dark">{percents ? "Dead level" : "No votes yet"}</p>
              <p className="type-display mt-1 text-[1.6rem] sm:text-[2rem]">{percents ? `${formatPercent(50)} each` : "Be the first"}</p>
            </>
          )}
        </div>
      </LeaderLink>
    </li>
  );
}

/** A wide card at the top: the debate with the biggest lead, or the closest race. */
function Highlight({ label, standing }: { label: string; standing: Standing }) {
  const { debate, percents, leader, trailer, gap } = standing;
  if (!percents) return null;
  return (
    <Link href={`/${debate.slug}/results`} className="group relative flex overflow-hidden bg-ink text-white">
      <ShareStrip standing={standing} />
      <div className="relative grid w-[44%] shrink-0 grid-cols-2 sm:w-[46%]">
        {debate.options.map((option) => (
          <div key={option.slug} className="relative aspect-[2/5] overflow-hidden">
            <Photo option={option} sizes="(min-width: 640px) 13vw, 22vw" narrow />
          </div>
        ))}
      </div>
      <div className="flex min-w-0 flex-col justify-center gap-1 p-4 sm:p-5">
        <p className="type-overline text-mute-dark">{label}</p>
        <p className="type-display text-[1.7rem] leading-none sm:text-4xl">{debate.title}</p>
        <p className="type-display mt-1 flex items-baseline gap-2.5 text-[1.7rem] tabular min-[400px]:text-[2rem] sm:text-5xl">
          {debate.options.map((option, i) => (
            <span key={option.slug} style={{ color: option.color }}>
              {formatPercent(percents[i])}
            </span>
          ))}
        </p>
        <p className="text-[13px] leading-snug text-white/80 sm:text-sm">
          {leader && trailer ? (
            <>
              {leader.shortName} ahead by <span className="font-semibold text-white">{formatPoints(gap)}</span>
            </>
          ) : (
            "Dead level"
          )}
        </p>
      </div>
    </Link>
  );
}

/** The gap between the two shares, in percentage points. */
function formatPoints(points: number) {
  const value = Math.round(points * 10) / 10;
  return `${value.toFixed(1)} ${value === 1 ? "point" : "points"}`;
}
