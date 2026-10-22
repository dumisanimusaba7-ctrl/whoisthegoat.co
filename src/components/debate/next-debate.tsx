"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { DEBATES, type Debate } from "@/lib/debates";
import { readStoredVote } from "@/lib/vote-storage";

import { useDebate } from "./debate-provider";

/** The next debate in the list this browser hasn't voted on, wrapping round; null when it's voted on them all. */
function nextUnsettled(current: string): Debate | null {
  const index = DEBATES.findIndex((debate) => debate.slug === current);
  const order = [...DEBATES.slice(index + 1), ...DEBATES.slice(0, Math.max(0, index))];
  return order.find((debate) => !readStoredVote(debate.slug, debate.options.map((o) => o.slug))) ?? null;
}

/**
 * Once you've voted, a bar pinned to the bottom of the screen points you to
 * the next debate you haven't settled. It waits for the celebration to finish.
 */
export function NextDebateBar({ delayMs }: { delayMs: number }) {
  const { debate } = useDebate();
  // Only rendered after a vote, which only happens in the browser.
  const [next] = useState(() => nextUnsettled(debate.slug));
  const [shown, setShown] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const visible = shown && !dismissed;

  useEffect(() => {
    const timer = setTimeout(() => setShown(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  // Leave room at the end of the page so the bar never hides the footer.
  useEffect(() => {
    const bar = ref.current;
    if (!visible || !bar) return;
    const root = document.documentElement;
    const observer = new ResizeObserver(() => root.style.setProperty("--sticky-bar", `${bar.offsetHeight}px`));
    observer.observe(bar);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--sticky-bar");
    };
  }, [visible]);

  if (!visible) return null;

  const total = DEBATES.length;
  // Rendered on <body>: the arena is its own stacking context, so a bar inside
  // it would sit under the rest of the page.
  return createPortal(
    <div
      ref={ref}
      role="region"
      aria-label="Next debate"
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:px-0 sm:pb-0"
    >
      <div className="animate-rise mx-auto flex max-w-xl items-center gap-3 border border-white/15 bg-ink/95 py-3 pl-4 pr-2 text-white shadow-[0_12px_40px_rgb(0_0_0/0.45)] backdrop-blur sm:w-[27rem]">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-mute-dark">
            {next ? `You’ve settled ${debate.title}.` : `You’ve settled all ${total} debates.`}
          </p>
          <p className="mt-0.5 font-semibold leading-snug">
            {next ? `Now let’s settle ${next.title}.` : "See how the world voted."}
          </p>
        </div>
        <Link
          href={next ? `/${next.slug}` : "/results"}
          className="btn btn-light h-11 shrink-0 px-4"
          aria-label={next ? `Vote on ${next.title}` : "See all results"}
        >
          {next ? "Vote" : "Results"}
          <svg aria-hidden="true" viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 6h8M6.5 2.5 10 6l-3.5 3.5" />
          </svg>
        </Link>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Hide"
          className="grid size-11 shrink-0 place-items-center text-mute-dark transition-colors duration-[var(--duration-micro)] hover:text-white"
        >
          <svg aria-hidden="true" viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" />
          </svg>
        </button>
      </div>
    </div>,
    document.body,
  );
}
