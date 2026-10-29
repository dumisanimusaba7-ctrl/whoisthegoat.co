import type { Metadata } from "next";
import Link from "next/link";
import { ViewTransition, type CSSProperties } from "react";

import { PageHero } from "@/components/layout/page-hero";
import { TrophyIcon, TrophySprite } from "@/components/trophies/trophy-art";
import { CATEGORY_LABELS, DEBATES } from "@/lib/debates";
import { getCabinet, headlineCounts, teamTotals } from "@/lib/trophies";

export const metadata: Metadata = {
  title: "Trophy Cabinets: Every Title Compared",
  description:
    "Messi vs Ronaldo, LeBron vs Jordan, Tyson vs Ali and more: every championship, title and major award, counted side by side.",
  alternates: { canonical: "/trophies" },
};

export default function TrophiesIndexPage() {
  const cabinets = DEBATES.flatMap((debate) => {
    const cabinet = getCabinet(debate.slug);
    return cabinet ? [{ debate, cabinet }] : [];
  });

  return (
    <ViewTransition enter="page" exit="page" default="none">
      <div>
        <TrophySprite />
        <PageHero title="Trophies">Every title and major award, counted side by side. Open one to see the full cabinet.</PageHero>
        <div className="bg-ink text-white">
          <ul className="mx-auto grid max-w-6xl gap-px px-4 py-12 sm:grid-cols-2 sm:px-6 sm:py-16">
            {cabinets.map(({ debate, cabinet }, i) => {
              const [a, b] = debate.options;
              const totals = teamTotals(cabinet);
              const lead = cabinet.headline[0];
              return (
                <li key={debate.slug} className="border-t border-white/10">
                  <Link href={`/${debate.slug}/trophies`} className="group block py-7 transition-opacity duration-[var(--duration-micro)] hover:opacity-80 sm:pr-8">
                    <p className="type-label text-mute-dark">{CATEGORY_LABELS[debate.category]}</p>
                    <h2 className="type-display mt-2 text-4xl sm:text-5xl">{debate.title}</h2>
                    <div className="mt-5 flex items-end justify-between gap-4">
                      {[a, b].map((option, side) => (
                        <p key={option.slug} className={side === 1 ? "text-right" : ""}>
                          <span className="type-display block text-5xl tabular" style={{ color: option.color }}>
                            {totals[side]}
                          </span>
                          <span className="text-sm text-mute-dark">{option.shortName}</span>
                        </p>
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-mute-dark">{cabinet.totalLabel}</p>
                    <p className="mt-4 flex items-center gap-3 text-sm font-semibold">
                      <TrophyIcon kind={lead.kind} className="trophy-intro h-10 w-[30px]" style={{ "--i": i } as CSSProperties} />
                      {lead.label}: {a.shortName} {headlineCounts(cabinet, lead)[0]}, {b.shortName} {headlineCounts(cabinet, lead)[1]}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </ViewTransition>
  );
}
