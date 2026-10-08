"use client";

import { AdSlot } from "@/components/ads/ad-slot";

import { useDebate } from "./debate-provider";
import { CountryBreakdown } from "./results-board";
import { SharePanel } from "./share-panel";

/** Revealed once you've voted: your share card, then how each country voted. */
export function PostVote() {
  const { debate, results, resultsUnavailable, vote } = useDebate();
  if (vote.phase !== "voted") return null;

  return (
    <div className={vote.revealedNow ? "animate-enter" : undefined}>
      <SharePanel />
      <div className="border-t border-rule bg-paper">
        <CountryBreakdown
          debate={debate}
          results={results}
          unavailable={resultsUnavailable}
          highlightCountry={vote.country}
          limit={10}
          showFullResultsLink
        />
      </div>
      <AdSlot placement="results" className="border-t border-rule" />
    </div>
  );
}
