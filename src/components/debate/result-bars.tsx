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
  /** The option this browser voted for. Its player stands on its bar. */
  choice?: string | null;
  /** A vote was just cast: play the celebration instead of showing the end state. */
  celebrate?: boolean;
  /** Leave room above the bars for the player figure. */
  withFigure?: boolean;
  tone?: "dark" | "light";
  className?: string;
};

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * One bar per option, each measured from zero. After a vote the chosen
 * player runs along their bar to the result and celebrates there. The
 * animation only ever draws on top of numbers that are already final: if it
 * fails or is skipped, the bars simply show the result.
 */
export function ResultBars({ debate, results, choice, celebrate = false, withFigure = false, tone = "dark", className = "" }: Props) {
  const percents = results ? optionPercentages(results.options, debate.options.map((o) => o.slug)) : debate.options.map(() => 0);
  const chosenIndex = debate.options.findIndex((o) => o.slug === choice);
  const chosen = chosenIndex >= 0 ? debate.options[chosenIndex] : undefined;
  const figure = withFigure ? chosen?.figure : undefined;

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

    const track = fills.current[chosenIndex]?.parentElement;
    const figureEl = runner.current?.querySelector("svg");
    if (!track || !figureEl || !runner.current) {
      finish();
      return;
    }

    const target = latest.current[chosenIndex] / 100;
    const timeline = createTimeline(figure.celebration, {
      target,
      trackPx: track.getBoundingClientRect().width,
      figurePx: figureEl.getBoundingClientRect().height * (93 / 108),
    });

    let frame = 0;
    let start = 0;
    const draw = (t: number) => {
      const f = timeline.sample(t);
      runner.current!.style.transform = `translateX(${f.pos * 100}%)`;
      figureHandle.current?.setPose(f.pose);
      figureHandle.current?.setDust(f.dust);
      fills.current.forEach((el, i) => {
        if (!el) return;
        const scale = i === chosenIndex ? f.pos : (latest.current[i] / 100) * easeOutCubic(Math.min(1, t / OTHER_BAR_MS));
        el.style.transform = `scaleX(${scale})`;
      });
      if (streak.current) {
        const s = f.streak;
        streak.current.style.opacity = s ? String(s.alpha) : "0";
        if (s) streak.current.style.transform = `translateX(${s.from * 100}%) scaleX(${Math.max(0, s.to - s.from)})`;
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
  }, [playing, figure, chosenIndex]);

  // Once the celebration ends, hand the final state back to React.
  useLayoutEffect(() => {
    if (playing) return;
    figureHandle.current?.setDust(null);
    if (figure) figureHandle.current?.setPose(FINAL_POSE[figure.celebration]);
    if (streak.current) streak.current.style.opacity = "0";
  }, [playing, figure]);

  const dark = tone === "dark";
  const settle: CSSProperties = { transition: playing ? "none" : "transform var(--duration-large) var(--ease-out)" };

  return (
    <div data-result-bars className={`space-y-4 sm:space-y-5 ${className}`}>
      {debate.options.map((option, i) => {
        const votes = results ? votesFor(results.options, option.slug) : null;
        const isChosen = i === chosenIndex && Boolean(figure);
        const scale = playing ? 0 : percents[i] / 100;
        return (
          // Only the bar with a player on it needs headroom.
          <div key={option.slug} className={isChosen ? "pt-[52px] sm:pt-[72px]" : ""}>
            <div className={`relative h-2 sm:h-2.5 ${dark ? "bg-white/10" : "bg-ink/10"}`}>
              <div
                ref={(el) => {
                  fills.current[i] = el;
                }}
                className="absolute inset-0 origin-left"
                style={{ background: option.color, transform: `scaleX(${scale})`, ...settle }}
              />
              {isChosen && figure ? (
                <>
                  <div ref={streak} aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] origin-left bg-white opacity-0" />
                  <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-full">
                    <div ref={runner} className="w-full" style={{ transform: `translateX(${scale * 100}%)`, ...settle }}>
                      <div className="absolute bottom-0 left-0" style={{ transform: "translate(-50%, 3.7%)" }}>
                        <Figure
                          kit={figure.kit}
                          pose={FINAL_POSE[figure.celebration]}
                          handle={figureHandle}
                          className="block h-[54px] w-auto sm:h-[76px]"
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
            <div className={`mt-2.5 flex items-baseline justify-between gap-4 text-sm ${dark ? "text-white/60" : "text-mute"}`}>
              <span className={`font-semibold ${dark ? "text-white" : "text-ink"}`}>{option.name}</span>
              <span className="tabular">{votes === null ? "—" : `${formatCount(votes)} ${pluralize(votes, "vote")}`}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
