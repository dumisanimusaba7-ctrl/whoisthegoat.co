import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Fragment, ViewTransition } from "react";

import { AdSlot } from "@/components/ads/ad-slot";
import { PageHero } from "@/components/layout/page-hero";
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

/** Categories in the order their first debate appears on the site. */
function sections() {
  const byCategory = new Map<Debate["category"], Debate[]>();
  for (const debate of DEBATES) byCategory.set(debate.category, [...(byCategory.get(debate.category) ?? []), debate]);
  return [...byCategory];
}

export default function LeaderboardPage() {
  return (
    <ViewTransition enter="page" exit="page" default="none">
      <div>
        <PageHero title="Leaderboard">Who the world has put in front, sport by sport, and by how much.</PageHero>
        <div className="bg-paper">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
            {sections().map(([category, debates], index) => (
              <Fragment key={category}>
                {/* A break in the sports list, half way down. */}
                {index === 4 ? <AdSlot placement="editorial" kind="native" className="-mt-4 mb-12 !px-0 sm:mb-16" /> : null}
              <section aria-labelledby={`lb-${category}`} className="mb-12 last:mb-0 sm:mb-16">
                <h2 id={`lb-${category}`} className="type-display border-t-2 border-ink pt-4 text-4xl sm:text-5xl">
                  {CATEGORY_LABELS[category]}
                </h2>
                <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
                  {debates.map((debate) => (
                    <LeaderTile key={debate.slug} debate={debate} />
                  ))}
                </ul>
              </section>
              </Fragment>
            ))}
          </div>
        </div>
        <AdSlot placement="editorial" className="border-t border-rule" />
      </div>
    </ViewTransition>
  );
}

const SIZES = "(min-width: 1024px) 270px, (min-width: 640px) 31vw, 47vw";

function Photo({ option, className }: { option: DebateOption; className?: string }) {
  const photo = option.cardPhoto ? CARD_PHOTOS[option.cardPhoto] : undefined;
  if (!photo) return <div className={`size-full ${className ?? ""}`} style={{ background: option.color }} />;
  // The card photos keep the face a third of the way down, clear of the text below it.
  return <Image src={photo} alt="" fill sizes={SIZES} placeholder="blur" className={`object-cover object-[50%_30%] ${className ?? ""}`} />;
}

async function LeaderTile({ debate }: { debate: Debate }) {
  const results = await getPageResults(debate.slug);
  const percents = results && results.total > 0 ? optionPercentages(results.options, debate.options.map((o) => o.slug)) : null;
  const lead = percents && percents[0] !== percents[1] ? (percents[0] > percents[1] ? 0 : 1) : null;
  const leader = lead === null ? null : debate.options[lead];
  const trailer = lead === null ? null : debate.options[1 - lead];

  return (
    <li>
      <Link href={percents ? `/${debate.slug}/results` : `/${debate.slug}`} className="group flex h-full flex-col overflow-hidden bg-ink text-white">
        {/* The photo stays clear of the text, so the face shows whole. */}
        <div className="relative aspect-[4/5] overflow-hidden">
          {leader ? (
            <Photo option={leader} className="transition-transform duration-[var(--duration-large)] ease-out group-hover:scale-[1.03]" />
          ) : (
            // No leader yet: both sides, half each.
            <div className="absolute inset-0 grid grid-cols-2">
              {debate.options.map((option) => (
                <div key={option.slug} className="relative">
                  <Photo option={option} />
                </div>
              ))}
            </div>
          )}
          <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-ink/75 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-1/6 bg-gradient-to-t from-ink to-transparent" />
          <div className="absolute inset-x-0 top-0 flex h-1.5" aria-hidden="true">
            {debate.options.map((option, i) => (
              <div key={option.slug} style={{ background: option.color, flexGrow: percents ? Math.max(percents[i], 1) : 1 }} />
            ))}
          </div>
          <p className="type-overline absolute inset-x-3 top-4 text-white/90 sm:inset-x-4">{debate.title}</p>
        </div>

        <div className="flex grow flex-col px-3 pb-3.5 pt-2.5 sm:px-4 sm:pb-4">
          {leader && trailer && percents && lead !== null ? (
            <>
              <p className="type-overline text-mute-dark">Leading</p>
              <p className="type-display mt-1 text-[1.6rem] sm:text-[2rem]">{leader.shortName}</p>
              <p className="type-display mt-0.5 text-[2.2rem] tabular sm:text-[2.6rem]" style={{ color: leader.color }}>
                {formatPercent(percents[lead])}
              </p>
              <p className="mt-1.5 text-[13px] leading-snug text-white/80 sm:text-sm">
                Ahead of {trailer.shortName} by <span className="font-semibold text-white">{formatPoints(percents[lead] - percents[1 - lead])}</span>
              </p>
            </>
          ) : (
            <>
              <p className="type-overline text-mute-dark">{percents ? "Dead level" : "No votes yet"}</p>
              <p className="type-display mt-1 text-[1.6rem] sm:text-[2rem]">{percents ? `${formatPercent(50)} each` : "Be the first"}</p>
            </>
          )}
        </div>
      </Link>
    </li>
  );
}

/** The gap between the two shares, in percentage points. */
function formatPoints(points: number) {
  const value = Math.round(points * 10) / 10;
  return `${value.toFixed(1)} ${value === 1 ? "point" : "points"}`;
}
