"use client";

import { AdSlot } from "@/components/ads/ad-slot";

import { useDebate } from "./debate-provider";
import { ResultsBoard } from "./results-board";
import { SharePanel } from "./share-panel";

/** Everything revealed once you've voted: your card, the live stats, the countries. */
export function PostVote() {
  const { debate, results, resultsUnavailable, vote } = useDebate();
  if (vote.phase !== "voted") return null;

  return (
    <div className="animate-rise-in">
      <SharePanel />
      <div className="border-t border-rule bg-paper">
        <ResultsBoard
          debate={debate}
          results={results}
          unavailable={resultsUnavailable}
          highlightCountry={vote.country}
          countryLimit={10}
          showFullResultsLink
        />
      </div>
      <AdSlot placement="results" className="border-t border-rule" />
    </div>
  );
}
