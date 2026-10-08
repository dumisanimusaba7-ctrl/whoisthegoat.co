"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";

import { Figure, type FigureHandle } from "@/components/celebration/figure";
import { easeOutCubic } from "@/components/celebration/pose";
import { createTimeline, FINAL_POSE, OTHER_BAR_MS } from "@/components/celebration/timeline";
import type { Debate } from "@/lib/debates";
import { formatCount, pluralize } from "@/lib/format";
import { optionPercentages, votesFor, type DebateResults } from "@/lib/results";

type Props = {
  debate: Debate;
  results: DebateResults | null;
  /** The option this browser voted for. Its player stands on the bar. */
  choice?: string | null;
  /** A vote was just cast: play the celebration instead of showing the end state. */
  celebrate?: boolean;
  /** Leave room above the bar for the player figure. */
  withFigure?: boolean;
  tone?: "dark" | "light";
  className?: string;
};

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * The head-to-head on one bar: the first option fills from the left, the
 * second from the right, each to its share, so they meet at the split.
 * After a vote the chosen player runs in from their end to the split and
 * celebrates there. The animation only ever draws on top of numbers that
 * are already final: if it fails or is skipped, the bar simply shows the
 * result.
 */
export function ResultBars({ debate, results, choice, celebrate = false, withFigure = false, tone = "dark", className = "" }: Props) {
  const [a, b] = debate.options;
  const percents = results ? optionPercentages(results.options, [a.slug, b.slug]) : [0, 0];
  const chosenIndex = debate.options.findIndex((o) => o.slug === choice);
  const chosen = chosenIndex >= 0 ? debate.options[chosenIndex] : undefined;
  const figure = withFigure ? chosen?.figure : undefined;
  // The second option's player starts at the right-hand end and runs left.
  const fromRight = chosenIndex === 1;

  const track = useRef<HTMLDivElement>(null);
  const fills = useRef<(HTMLDivElement | null)[]>([]);
  const runner = useRef<HTMLDivElement>(null);
  const streak = useRef<HTMLDivElement>(null);
  const figureHandle = useRef<FigureHandle>(null);
  const [playing, setPlaying] = useState(Boolean(celebrate && figure));

  // Read final numbers inside the animation without restarting it.
  const latest = useRef(percents);
  useLayoutEffect(() => {
    latest.current = percents;
  });

  useLayoutEffect(() => {
    if (!playing || !figure || chosenIndex < 0) return;

    const finish = () => setPlaying(false);
    if (prefersReducedMotion()) {
      finish();
      return;
    }

    const figureEl = runner.current?.querySelector("svg");
    if (!track.current || !figureEl || !runner.current) {
      finish();
      return;
    }

    const other = 1 - chosenIndex;
    const timeline = createTimeline(figure.celebration, {
      // How far the player runs: their own share, measured from their end.
      target: latest.current[chosenIndex] / 100,
      trackPx: track.current.getBoundingClientRect().width,
      figurePx: figureEl.getBoundingClientRect().height * (92 / 108),
    });
    const toScreen = (distance: number) => (fromRight ? 1 - distance : distance);

    let frame = 0;
    let start = 0;
    const draw = (t: number) => {
      const f = timeline.sample(t);
      runner.current!.style.transform = `translateX(${toScreen(f.pos) * 100}%)`;
      figureHandle.current?.setPose(f.pose);
      figureHandle.current?.setDust(f.dust);
      const own = fills.current[chosenIndex];
      const rival = fills.current[other];
      if (own) own.style.transform = `scaleX(${f.pos})`;
      if (rival) rival.style.transform = `scaleX(${(latest.current[other] / 100) * easeOutCubic(Math.min(1, t / OTHER_BAR_MS))})`;
      if (streak.current) {
        const s = f.streak;
        streak.current.style.opacity = s ? String(s.alpha) : "0";
        if (s) {
          const left = fromRight ? 1 - s.to : s.from;
          streak.current.style.transform = `translateX(${left * 100}%) scaleX(${Math.max(0, s.to - s.from)})`;
        }
      }
      return f.done;
    };
    const tick = (now: number) => {
      try {
        start ||= now;
        if (draw(now - start)) {
          finish();
          return;
        }
        frame = requestAnimationFrame(tick);
      } catch (error) {
        // Presentation only: never let the animation get in the way of the result.
        console.error("[celebration]", error);
        finish();
      }
    };
    // First frame before paint, so the end-state figure never flashes.
    draw(0);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, figure, chosenIndex, fromRight]);

  // Once the celebration ends, hand the final state back to React.
  useLayoutEffect(() => {
    if (playing) return;
    figureHandle.current?.setDust(null);
    if (figure) figureHandle.current?.setPose(FINAL_POSE[figure.celebration]);
    if (streak.current) streak.current.style.opacity = "0";
  }, [playing, figure]);

  const dark = tone === "dark";
  const settle: CSSProperties = { transition: playing ? "none" : "transform var(--duration-large) var(--ease-out)" };
  const scales = playing ? [0, 0] : percents.map((p) => p / 100);
  // Where the two colours meet, and where the player comes to rest.
  const split = fromRight ? 1 - scales[1] : scales[0];

  return (
    <div data-result-bars className={className}>
      <div className={figure ? "pt-[62px] sm:pt-[86px]" : ""}>
        <div
          ref={track}
          role="img"
          aria-label={results ? `${a.name} ${percents[0].toFixed(1)}%, ${b.name} ${percents[1].toFixed(1)}%` : "No results yet"}
          className={`relative h-2.5 sm:h-3 ${dark ? "bg-white/10" : "bg-ink/10"}`}
        >
          {[a, b].map((option, i) => (
            <div
              key={option.slug}
              ref={(el) => {
                fills.current[i] = el;
              }}
              className={`absolute inset-0 ${i === 0 ? "origin-left" : "origin-right"}`}
              style={{ background: option.color, transform: `scaleX(${scales[i]})`, ...settle }}
            />
          ))}
          {figure && chosen ? (
            <>
              <div ref={streak} aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] origin-left bg-white opacity-0" />
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-full">
                <div ref={runner} className="w-full" style={{ transform: `translateX(${split * 100}%)`, ...settle }}>
                  <div
                    className="absolute bottom-0 left-0"
                    style={{ transform: `translate(-50%, 3.7%)${fromRight ? " scaleX(-1)" : ""}` }}
                  >
                    <Figure
                      kit={figure.kit}
                      pose={FINAL_POSE[figure.celebration]}
                      handle={figureHandle}
                      mirrored={fromRight}
                      className="block h-[64px] w-auto sm:h-[88px]"
                    />
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
      <div className={`mt-3 flex items-start justify-between gap-4 text-sm ${dark ? "text-white/60" : "text-mute"}`}>
        {[a, b].map((option, i) => {
          const votes = results ? votesFor(results.options, option.slug) : null;
          return (
            <p key={option.slug} className={`flex flex-col ${i === 1 ? "items-end text-right" : ""}`}>
              <span className={`inline-flex items-center gap-2 font-semibold ${dark ? "text-white" : "text-ink"}`}>
                {i === 0 ? <span aria-hidden="true" className="size-2" style={{ background: option.color }} /> : null}
                {option.name}
                {i === 1 ? <span aria-hidden="true" className="size-2" style={{ background: option.color }} /> : null}
              </span>
              <span className="tabular mt-0.5">{votes === null ? "—" : `${formatCount(votes)} ${pluralize(votes, "vote")}`}</span>
            </p>
          );
        })}
      </div>
    </div>
  );
}
