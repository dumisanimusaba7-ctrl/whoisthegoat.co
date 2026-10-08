"use client";

import Image from "next/image";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

import { InlineScript } from "@/components/inline-script";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { LiveDot } from "@/components/ui/live-dot";
import { getOption, SPORT_LABELS, type Debate, type DebateOption } from "@/lib/debates";
import { countryFlag, formatCount, pluralize } from "@/lib/format";
import { optionPercentages, type DebateResults } from "@/lib/results";
import { prevotedScript } from "@/lib/vote-storage";

import { useDebate, type VoteState } from "./debate-provider";
import { SplitBar } from "./split-bar";

/**
 * The face-off: question, both players, one-tap voting, and the reveal of
 * the live global result in the same space once you've voted.
 */
export function Arena({ banner }: { banner?: ReactNode }) {
  const { debate, results, resultsUnavailable, vote, castVote } = useDebate();
  const [a, b] = debate.options;
  const id = `arena-${debate.slug}`;
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const revealed = vote.phase === "voted";
  const busy = vote.phase === "submitting";
  const percents = (results ? optionPercentages(results.options, [a.slug, b.slug]) : [0, 0]) as [number, number];

  // The pre-paint script hides the buttons for returning voters. If storage
  // turned out not to hold a usable vote, bring them back.
  useEffect(() => {
    if (vote.phase === "open") sectionRef.current?.removeAttribute("data-prevoted");
  }, [vote.phase]);

  // After voting, take keyboard and screen reader users to the result.
  useEffect(() => {
    if (vote.revealedNow) headingRef.current?.focus({ preventScroll: true });
  }, [vote.revealedNow]);

  const chars = Math.max(a.shortName.length, b.shortName.length);
  const chosen = vote.choice ? getOption(debate, vote.choice) : undefined;

  return (
    <section
      id={id}
      ref={sectionRef}
      aria-labelledby={`${id}-title`}
      className="arena relative isolate overflow-hidden bg-ink text-white"
      style={{ "--chars": chars } as CSSProperties}
      suppressHydrationWarning
    >
      <InlineScript html={prevotedScript(debate.slug, id, [a.slug, b.slug])} />

      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-12">
        {banner}
        <p className="type-label flex items-center gap-2 text-mute-dark">
          <LiveDot />
          <span>Live global vote · {SPORT_LABELS[debate.sport]}</span>
        </p>
        <h1
          id={`${id}-title`}
          ref={headingRef}
          tabIndex={-1}
          className="type-headline mt-4 text-[2.6rem] outline-none sm:text-6xl lg:text-[4.75rem]"
        >
          {revealed ? "The world has spoken" : debate.question}
        </h1>
        <p className="mt-3 text-base text-mute-dark sm:text-lg">
          {revealed && chosen ? (
            <>
              You voted <strong className="font-bold text-white">{chosen.name}</strong>.
              {vote.alreadyVoted ? " You’d already voted from this browser, so your original vote stands." : null}
            </>
          ) : (
            "The world decides."
          )}
        </p>
      </div>

      <div className="relative mx-auto mt-8 max-w-6xl sm:mt-10 sm:px-6">
        <div className="relative grid grid-cols-2 overflow-hidden border-y border-white/10 sm:border-x">
          {debate.artwork ? <BoardArtwork artwork={debate.artwork} revealed={revealed} /> : null}
          {debate.options.map((option, index) => (
            <Side
              key={option.slug}
              option={option}
              align={index === 0 ? "start" : "end"}
              vote={vote}
              percent={percents[index]}
              showNumber={!debate.artwork}
              disabled={busy || vote.phase === "checking"}
              onVote={castVote}
            />
          ))}
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/10" />
          <span
            aria-hidden="true"
            className="type-label absolute left-1/2 top-[42%] grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center border border-white/20 bg-ink text-[0.7rem] text-white sm:size-14 sm:text-xs"
          >
            VS
          </span>
        </div>
      </div>

      {vote.error ? (
        <p role="alert" className="mx-auto mt-5 max-w-6xl px-4 text-center text-sm font-semibold text-[#ff8a80] sm:px-6">
          {vote.error}
        </p>
      ) : null}

      <div className="mx-auto max-w-6xl px-4 pb-8 pt-5 sm:px-6 sm:pb-12 sm:pt-7">
        {revealed ? (
          <RevealStrip results={results} percents={percents} animate={vote.revealedNow} />
        ) : (
          <LiveStrip results={results} unavailable={resultsUnavailable} />
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        {busy ? "Counting your vote." : vote.revealedNow && chosen ? `Your vote for ${chosen.name} has been counted.` : ""}
      </p>
    </section>
  );
}

/**
 * The debate's artwork behind both halves of the board, split at the seam.
 * Decorative: names, flags and results are all in the text above it.
 */
function BoardArtwork({ artwork, revealed }: { artwork: NonNullable<Debate["artwork"]>; revealed: boolean }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <Image
        src={artwork.image}
        alt=""
        fill
        placeholder="blur"
        loading="eager"
        fetchPriority="high"
        sizes="(min-width: 1200px) 1104px, (min-width: 640px) calc(100vw - 48px), 100vw"
        className={`object-cover transition-opacity duration-700 ${revealed ? "opacity-60" : ""}`}
        style={{ objectPosition: artwork.position ?? "50% 50%" }}
      />
      {/* Scrims keep the flags (top) and names, buttons and results (bottom) legible. */}
      <div className="absolute inset-x-0 top-0 h-1/3 bg-linear-to-b from-ink/70 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-3/4 bg-linear-to-t from-ink via-ink/70 to-transparent" />
    </div>
  );
}

function Side({
  option,
  align,
  vote,
  percent,
  showNumber,
  disabled,
  onVote,
}: {
  option: DebateOption;
  align: "start" | "end";
  vote: VoteState;
  percent: number;
  /** Shirt number behind the player, used when the debate has no artwork. */
  showNumber: boolean;
  disabled: boolean;
  onVote: (choice: string) => void;
}) {
  const end = align === "end";
  const revealed = vote.phase === "voted";
  const pending = vote.pending === option.slug;
  // While a vote is in flight the other side steps back. After the reveal both
  // sides are shown equally: the platform doesn't take sides.
  const dimmed = vote.phase === "submitting" && !pending;

  return (
    <div
      className={`relative flex min-h-[19.5rem] flex-col overflow-hidden px-4 pb-5 pt-5 sm:min-h-[24rem] sm:p-8 lg:min-h-[28rem] ${end ? "items-end text-right" : ""}`}
      style={{ "--accent": option.color, "--on-accent": option.onColor } as CSSProperties}
    >
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1" style={{ background: option.color }} />
      {showNumber ? (
        <span
          aria-hidden="true"
          className={`ghost-number absolute top-3 transition-opacity duration-700 ${end ? "right-2 sm:right-6" : "left-2 sm:left-6"} ${revealed ? "opacity-30" : ""}`}
        >
          {option.number}
        </span>
      ) : null}

      <p className="type-label relative flex items-center gap-1.5 text-white/85">
        <span aria-hidden="true" className="text-[0.95rem] leading-none tracking-normal">
          {countryFlag(option.country.code)}
        </span>
        {option.country.name}
      </p>

      <div className={`relative mt-auto transition-opacity duration-500 ${dimmed ? "opacity-45" : ""}`}>
        <p className="text-[0.8rem] font-bold uppercase tracking-[0.1em] text-white/75 [font-stretch:112.5%] sm:text-base">
          {option.firstName}
        </p>
        <p className="player-name type-display mt-1">{option.shortName}</p>
      </div>

      {revealed ? (
        <div className="relative mt-3 sm:mt-5">
          <p className="player-percent type-display" style={{ color: option.color }}>
            <AnimatedNumber value={percent} from={vote.revealedNow ? 0 : undefined} format="percent" />
          </p>
          {/* Rendered on both sides (hidden on one) so the two names stay level. */}
          <p
            aria-hidden={vote.choice !== option.slug || undefined}
            className={`type-label mt-2 inline-flex items-center gap-1.5 text-white ${vote.choice === option.slug ? "" : "invisible"}`}
          >
            <svg aria-hidden="true" viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 6.5 5 9.5 10 3" />
            </svg>
            Your vote
          </p>
        </div>
      ) : (
        <div data-vote-controls className="relative mt-4 w-full sm:mt-6">
          <button
            type="button"
            onClick={() => onVote(option.slug)}
            disabled={disabled}
            aria-busy={pending || undefined}
            className={`type-label flex h-14 w-full items-center justify-center gap-2 bg-white text-[0.78rem] text-ink transition-[background-color,color,opacity] duration-200 hover:bg-[var(--accent)] hover:text-[var(--on-accent)] focus-visible:outline-white active:scale-[0.99] disabled:cursor-default sm:h-16 sm:text-sm ${pending ? "bg-[var(--accent)] text-[var(--on-accent)]" : ""} ${dimmed ? "opacity-40" : ""}`}
          >
            {pending ? "Counting…" : `Vote ${option.shortName}`}
          </button>
        </div>
      )}
    </div>
  );
}

function LiveStrip({ results, unavailable }: { results: DebateResults | null; unavailable: boolean }) {
  let content: ReactNode;
  if (results && results.total > 0) {
    content = (
      <>
        <strong className="tabular text-[0.8rem] text-white sm:text-sm">
          <AnimatedNumber value={results.total} format="count" />
        </strong>
        <span>{pluralize(results.total, "vote")} cast</span>
        {results.countries.count > 0 ? (
          <>
            <span aria-hidden="true">·</span>
            <span>
              {formatCount(results.countries.count)} {pluralize(results.countries.count, "country", "countries")}
            </span>
          </>
        ) : null}
      </>
    );
  } else if (results) {
    content = <span>Voting is open. Be the first to vote.</span>;
  } else if (unavailable) {
    content = <span>Live count reconnecting…</span>;
  } else {
    content = <span className="skeleton-dark inline-block h-3 w-44" aria-label="Loading live count" />;
  }

  return (
    <p className="type-label flex min-h-5 flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-mute-dark">
      <LiveDot />
      <span className="text-white">Live</span>
      <span aria-hidden="true">·</span>
      {content}
    </p>
  );
}

function RevealStrip({ results, percents, animate }: { results: DebateResults | null; percents: [number, number]; animate: boolean }) {
  const { debate } = useDebate();
  return (
    <div>
      <SplitBar options={debate.options} percents={percents} animateIn={animate} size="h-3 sm:h-4" />
      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-baseline gap-2">
            <strong className="type-display text-4xl text-white sm:text-5xl">
              {results ? <AnimatedNumber value={results.total} format="count" from={animate ? 0 : undefined} /> : "—"}
            </strong>
            <span className="type-label text-mute-dark">{pluralize(results?.total ?? 0, "vote")} worldwide</span>
          </p>
          <p className="type-label mt-2 flex items-center gap-2 text-mute-dark">
            <LiveDot />
            <span>Live</span>
            {results && results.countries.count > 0 ? (
              <span>
                · <span className="tabular text-white">{formatCount(results.countries.count)}</span>{" "}
                {pluralize(results.countries.count, "country", "countries")} voting
              </span>
            ) : null}
          </p>
        </div>
        <div>
          <a
            href="#share"
            className="type-label flex h-12 w-full items-center justify-center gap-2 bg-white px-5 text-ink transition-colors hover:bg-paper-2 sm:w-auto"
          >
            Share your vote
            <svg aria-hidden="true" viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 1.5v9M2 6.5l4 4 4-4" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
