"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { useLiveResults } from "@/hooks/use-live-results";
import type { Debate } from "@/lib/debates";
import type { DebateResults } from "@/lib/results";
import { isVoteAccepted, type VoteResponse } from "@/lib/vote-api";
import { readStoredVote, writeStoredVote } from "@/lib/vote-storage";

export type VotePhase =
  /** Before we've checked browser storage for a previous vote. */
  | "checking"
  | "open"
  | "submitting"
  | "voted";

export type VoteState = {
  phase: VotePhase;
  /** The option this browser is counted for. */
  choice: string | null;
  /** The option being submitted right now. */
  pending: string | null;
  country: string | null;
  /** The server already had a vote from this browser. */
  alreadyVoted: boolean;
  /** The result was revealed during this visit (drives the count-up). */
  revealedNow: boolean;
  error: string | null;
};

type DebateContextValue = {
  debate: Debate;
  /** Canonical origin for share links, e.g. https://whoisthegoat.co */
  siteUrl: string;
  results: DebateResults | null;
  resultsUnavailable: boolean;
  vote: VoteState;
  castVote: (choice: string) => Promise<void>;
};

const DebateContext = createContext<DebateContextValue | null>(null);

export function useDebate(): DebateContextValue {
  const value = useContext(DebateContext);
  if (!value) throw new Error("useDebate must be used inside <DebateProvider>");
  return value;
}

const NETWORK_ERROR = "We couldn’t reach the vote server. Check your connection and try again.";
const TIMEOUT_ERROR = "Your vote is taking too long to send. Check your connection and try again.";
/** Long enough for a slow mobile connection; short enough that nobody is left waiting. */
const VOTE_TIMEOUT_MS = 15_000;

class VoteTimeoutError extends Error {}

/**
 * Rejects if the request hasn't settled in time. A race rather than an abort
 * signal, because a fetch wrapper (e.g. bot protection) may still be waiting
 * before the request is even sent.
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new VoteTimeoutError()), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

const INITIAL_VOTE: VoteState = {
  phase: "checking",
  choice: null,
  pending: null,
  country: null,
  alreadyVoted: false,
  revealedNow: false,
  error: null,
};

export function DebateProvider({
  debate,
  siteUrl,
  initialResults,
  children,
}: {
  debate: Debate;
  siteUrl: string;
  initialResults: DebateResults | null;
  children: ReactNode;
}) {
  const { results, unavailable, applyTotals } = useLiveResults(debate.slug, initialResults);
  const [vote, setVote] = useState<VoteState>(INITIAL_VOTE);

  useEffect(() => {
    const stored = readStoredVote(
      debate.slug,
      debate.options.map((o) => o.slug),
    );
    // Browser storage is only readable after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVote((v) =>
      stored ? { ...v, phase: "voted", choice: stored.choice, country: stored.country } : { ...v, phase: "open" },
    );
  }, [debate]);

  const castVote = useCallback(
    async (choice: string) => {
      setVote((v) => ({ ...v, phase: "submitting", pending: choice, error: null }));

      let data: VoteResponse;
      try {
        data = await withTimeout(
          fetch("/api/vote", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ debate: debate.slug, choice }),
          }).then((response) => response.json() as Promise<VoteResponse>),
          VOTE_TIMEOUT_MS,
        );
      } catch (error) {
        const message = error instanceof VoteTimeoutError ? TIMEOUT_ERROR : NETWORK_ERROR;
        setVote((v) => ({ ...v, phase: "open", pending: null, error: message }));
        return;
      }

      if (!isVoteAccepted(data)) {
        const message = typeof data?.message === "string" ? data.message : NETWORK_ERROR;
        setVote((v) => ({ ...v, phase: "open", pending: null, error: message }));
        return;
      }

      applyTotals(data.total, data.options);
      writeStoredVote(debate.slug, { choice: data.choice, country: data.country, at: new Date().toISOString() });
      setVote({
        phase: "voted",
        choice: data.choice,
        pending: null,
        country: data.country,
        alreadyVoted: data.status === "already_voted",
        revealedNow: true,
        error: null,
      });
    },
    [debate.slug, applyTotals],
  );

  const value = useMemo<DebateContextValue>(
    () => ({ debate, siteUrl, results, resultsUnavailable: unavailable, vote, castVote }),
    [debate, siteUrl, results, unavailable, vote, castVote],
  );

  return <DebateContext.Provider value={value}>{children}</DebateContext.Provider>;
}
