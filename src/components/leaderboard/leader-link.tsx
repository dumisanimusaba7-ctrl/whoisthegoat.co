"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

import { readStoredVote } from "@/lib/vote-storage";

type Choice = { slug: string; shortName: string; color: string };

/**
 * A leaderboard tile. Visitors who've voted on the debate go to its results
 * and see their pick; anyone who hasn't is sent to vote.
 */
export function LeaderLink({ debate, options, children }: { debate: string; options: Choice[]; children: ReactNode }) {
  // undefined until browser storage has been read (after hydration).
  const [pick, setPick] = useState<Choice | null | undefined>(undefined);

  useEffect(() => {
    const stored = readStoredVote(
      debate,
      options.map((o) => o.slug),
    );
    // Browser storage is only readable after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPick(stored ? (options.find((o) => o.slug === stored.choice) ?? null) : null);
  }, [debate, options]);

  return (
    <Link href={pick ? `/${debate}/results` : `/${debate}`} className="group flex h-full flex-col overflow-hidden bg-ink text-white">
      {children}
      <div className="mt-auto flex min-h-11 items-center border-t border-white/10 px-3 text-[13px] font-semibold sm:px-4">
        {pick === undefined ? (
          <span className="text-white/40">&nbsp;</span>
        ) : pick ? (
          <span className="flex items-center gap-2 text-white/80">
            <span aria-hidden="true" className="size-2 shrink-0 rounded-full" style={{ background: pick.color }} />
            Your pick: <span className="text-white">{pick.shortName}</span>
          </span>
        ) : (
          <span className="flex w-full items-center justify-between text-white">
            Cast your vote
            <span aria-hidden="true" className="transition-transform duration-[var(--duration-micro)] group-hover:translate-x-0.5">
              →
            </span>
          </span>
        )}
      </div>
    </Link>
  );
}
