"use client";

import Image from "next/image";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

import { CELEBRATION_TIMING, OTHER_BAR_MS } from "@/components/celebration/timeline";
import { InlineScript } from "@/components/inline-script";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { getOption, type Debate, type DebateOption } from "@/lib/debates";
import { formatCount, pluralize } from "@/lib/format";
import { optionPercentages, type DebateResults } from "@/lib/results";
import { prevotedScript } from "@/lib/vote-storage";

import { useDebate, type VoteState } from "./debate-provider";
import { ResultBars } from "./result-bars";

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
  const chosen = vote.choice ? getOption(debate, vote.choice) : undefined;

  // The pre-paint script hides the buttons for returning voters. If storage
  // turned out not to hold a usable vote, bring them back.
  useEffect(() => {
    if (vote.phase === "open") sectionRef.current?.removeAttribute("data-prevoted");
  }, [vote.phase]);

  // After voting, take keyboard and screen reader users to the result.
  useEffect(() => {
    if (vote.revealedNow) headingRef.current?.focus({ preventScroll: true });
  }, [vote.revealedNow]);

  // The numbers count up in step with the bars: the chosen side lands when
  // its player reaches the result.
  const kind = chosen?.figure?.celebration;
  const countUp = (option: DebateOption) =>
    option.slug === chosen?.slug && kind ? CELEBRATION_TIMING[kind].arrive : OTHER_BAR_MS;

  return (
    <section
      id={id}
      ref={sectionRef}
      aria-labelledby={`${id}-title`}
      className="arena relative isolate overflow-hidden bg-ink text-white"
      style={{ "--chars": Math.max(a.shortName.length, b.shortName.length) } as CSSProperties}
      suppressHydrationWarning
    >
      <InlineScript html={prevotedScript(debate.slug, id, [a.slug, b.slug])} />

      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-12">
        {banner}
        <p className="type-label text-mute-dark">{debate.title}</p>
        <h1
          key={revealed ? "result" : "question"}
          id={`${id}-title`}
          ref={headingRef}
          tabIndex={-1}
          className={`type-headline mt-3 text-[2.6rem] outline-none sm:text-6xl lg:text-[4.75rem] ${vote.revealedNow ? "animate-enter" : ""}`}
        >
          {revealed ? "The world has spoken" : debate.question}
        </h1>
        <p className="mt-3 text-base text-mute-dark sm:text-lg">
          {revealed && chosen ? (
            <>
              You voted <span className="font-semibold text-white">{chosen.name}</span>.
              {vote.alreadyVoted ? " You’d already voted from this browser, so that vote stands." : null}
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
              countUpMs={countUp(option)}
              showNumber={!debate.artwork}
              disabled={busy || vote.phase === "checking"}
              onVote={castVote}
            />
          ))}
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/10" />
          <span
            aria-hidden="true"
            className="type-overline absolute left-1/2 top-[42%] grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center border border-white/20 bg-ink text-white sm:size-14 sm:text-xs"
          >
            VS
          </span>
        </div>
      </div>

      {vote.error ? (
        <p role="alert" className="animate-enter mx-auto mt-5 max-w-6xl px-4 text-sm font-semibold text-error sm:px-6">
          {vote.error}
        </p>
      ) : null}

      <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6 sm:pb-14">
        {revealed ? <RevealStrip results={results} celebrate={vote.revealedNow} /> : <VoteCount results={results} unavailable={resultsUnavailable} />}
      </div>

      <p className="sr-only" aria-live="polite">
        {busy ? "Counting your vote." : vote.revealedNow && chosen ? `Your vote for ${chosen.name} has been counted.` : ""}
      </p>
    </section>
  );
}

/**
 * The debate's artwork behind both halves of the board, split at the seam.
 * Decorative: names, countries and results are all in the text above it.
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
        className={`object-cover transition-opacity duration-[var(--duration-large)] ease-out ${revealed ? "opacity-60" : ""}`}
        style={{ objectPosition: artwork.position ?? "50% 50%" }}
      />
      {/* Scrims keep the labels (top) and names, buttons and results (bottom) legible. */}
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
  countUpMs,
  showNumber,
  disabled,
  onVote,
}: {
  option: DebateOption;
  align: "start" | "end";
  vote: VoteState;
  percent: number;
  countUpMs: number;
  /** Shirt number behind the player, used when the debate has no artwork. */
  showNumber: boolean;
  disabled: boolean;
  onVote: (choice: string) => void;
}) {
  const end = align === "end";
  const revealed = vote.phase === "voted";
  const pending = vote.pending === option.slug;
  // While a vote is in flight the other side steps back. After the reveal both
  // sides are shown equally: the site doesn't take sides.
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
          className={`ghost-number absolute top-3 transition-opacity duration-[var(--duration-large)] ${end ? "right-2 sm:right-6" : "left-2 sm:left-6"} ${revealed ? "opacity-30" : ""}`}
        >
          {option.number}
        </span>
      ) : null}

      <p className="type-overline relative text-white/80">{option.country.name}</p>

      <div className={`relative mt-auto transition-opacity duration-[var(--duration-ui)] ${dimmed ? "opacity-40" : ""}`}>
        <p className="text-sm font-semibold text-white/75 sm:text-base">{option.firstName}</p>
        <p className="player-name type-display mt-1">{option.shortName}</p>
      </div>

      {revealed ? (
        <div className={`relative mt-3 sm:mt-5 ${vote.revealedNow ? "animate-enter" : ""}`}>
          <p className="player-percent type-display" style={{ color: option.color }}>
            <AnimatedNumber value={percent} from={vote.revealedNow ? 0 : undefined} duration={countUpMs} format="percent" />
          </p>
          {/* Rendered on both sides (hidden on one) so the two names stay level. */}
          <p
            aria-hidden={vote.choice !== option.slug || undefined}
            className={`type-overline mt-2 inline-flex items-center gap-1.5 text-white ${vote.choice === option.slug ? "" : "invisible"}`}
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
            className={`btn btn-light h-14 w-full text-base sm:h-16 ${pending ? "!bg-[var(--accent)] !text-[var(--on-accent)]" : ""} ${dimmed ? "opacity-40" : ""}`}
          >
            {pending ? "Counting…" : `Vote ${option.shortName}`}
          </button>
        </div>
      )}
    </div>
  );
}

/** Before voting: the size of the vote so far. The number moving is the only signal it's live. */
function VoteCount({ results, unavailable }: { results: DebateResults | null; unavailable: boolean }) {
  let content: ReactNode = null;
  if (results && results.total > 0) {
    content = (
      <>
        <span className="tabular font-semibold text-white">
          <AnimatedNumber value={results.total} format="count" />
        </span>{" "}
        {pluralize(results.total, "vote")}
        {results.countries.count > 0
          ? ` from ${formatCount(results.countries.count)} ${pluralize(results.countries.count, "country", "countries")}`
          : null}
      </>
    );
  } else if (results) {
    content = "No votes yet. Be the first.";
  } else if (unavailable) {
    content = "The vote count is unavailable right now.";
  }
  return <p className="type-label min-h-5 text-mute-dark">{content}</p>;
}

/** After voting: the result bars (where the celebration plays), then sharing. */
function RevealStrip({ results, celebrate }: { results: DebateResults | null; celebrate: boolean }) {
  const { debate, vote } = useDebate();
  const ref = useRef<HTMLDivElement>(null);
  const kind = vote.choice ? getOption(debate, vote.choice)?.figure?.celebration : undefined;

  // On short screens the bars sit below the fold: bring them into view so
  // the result (and the celebration) is actually seen.
  useEffect(() => {
    if (!celebrate || !ref.current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    ref.current.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }, [celebrate]);

  return (
    <div ref={ref}>
      <ResultBars debate={debate} results={results} choice={vote.choice} celebrate={celebrate} withFigure />
      <div
        className={`mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${celebrate ? "animate-enter" : ""}`}
        style={celebrate && kind ? { animationDelay: `${CELEBRATION_TIMING[kind].end - 150}ms` } : undefined}
      >
        <p className="type-label text-mute-dark">
          {results ? (
            <>
              <span className="tabular font-semibold text-white">
                <AnimatedNumber value={results.total} format="count" />
              </span>{" "}
              {pluralize(results.total, "vote")}
              {results.countries.count > 0
                ? ` from ${formatCount(results.countries.count)} ${pluralize(results.countries.count, "country", "countries")}`
                : null}
            </>
          ) : null}
        </p>
        <a href="#share" className="btn btn-light w-full sm:w-auto">
          Share your vote
          <svg aria-hidden="true" viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 1.5v9M2 6.5l4 4 4-4" />
          </svg>
        </a>
      </div>
    </div>
  );
}
