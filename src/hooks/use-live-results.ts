"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { newerResults, parseResults, withTotals, type DebateResults, type OptionTally } from "@/lib/results";

// Every poll is a request against the host's monthly allowance, so: only while
// the numbers are on screen, every 15 seconds, and only for the first five
// minutes of a visit (it picks up again whenever the tab comes back).
const POLL_MS = 15_000;
const MAX_BACKOFF_MS = 60_000;
const POLL_FOR_MS = 5 * 60_000;

type LiveResults = {
  results: DebateResults | null;
  /** True once a fetch has failed and we have nothing to show. */
  unavailable: boolean;
  /** Merge the global totals returned with a vote, which are fresher than any poll. */
  applyTotals: (total: number, options: OptionTally[]) => void;
};

/**
 * Keeps results live by polling the edge-cached results API while `active`
 * (the numbers are showing) and the page is visible. Counts never move
 * backwards: a stale cache hit is ignored.
 */
export function useLiveResults(debateSlug: string, initial: DebateResults | null, active: boolean): LiveResults {
  const [results, setResults] = useState<DebateResults | null>(initial);
  const [failed, setFailed] = useState(false);
  const failures = useRef(0);

  const applyTotals = useCallback(
    (total: number, options: OptionTally[]) => {
      setResults((current) => withTotals(current, debateSlug, total, options));
    },
    [debateSlug],
  );

  useEffect(() => {
    if (!active) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | undefined;
    let stopped = false;
    let until = Date.now() + POLL_FOR_MS;

    const schedule = (delay: number) => {
      clearTimeout(timer);
      if (!stopped && document.visibilityState === "visible" && Date.now() < until) timer = setTimeout(poll, delay);
    };

    async function poll() {
      controller?.abort();
      controller = new AbortController();
      try {
        const response = await fetch(`/api/results/${debateSlug}`, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const next = parseResults(await response.json());
        if (!next) throw new Error("Malformed results");
        failures.current = 0;
        setFailed(false);
        setResults((current) => newerResults(current, next));
        schedule(POLL_MS);
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        failures.current += 1;
        setFailed(true);
        schedule(Math.min(POLL_MS * 2 ** failures.current, MAX_BACKOFF_MS));
      }
    }

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        until = Date.now() + POLL_FOR_MS;
        schedule(0);
      } else clearTimeout(timer);
    };

    // Refresh straight away: the server-rendered snapshot may be a little old.
    schedule(0);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stopped = true;
      clearTimeout(timer);
      controller?.abort();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [debateSlug, active]);

  return { results, unavailable: failed && !results, applyTotals };
}
