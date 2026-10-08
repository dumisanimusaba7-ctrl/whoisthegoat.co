"use client";

import { useEffect, useRef, useState } from "react";

import { formatCount, formatPercent } from "@/lib/format";

const FORMATTERS = {
  count: formatCount,
  percent: formatPercent,
  /** Percentage without the % sign, for layouts that set it separately. */
  "percent-value": (n: number) => n.toFixed(1),
} as const;

type Props = {
  value: number;
  format: keyof typeof FORMATTERS;
  /** Value to count up from on first render (e.g. 0 for the reveal). */
  from?: number;
  duration?: number;
  className?: string;
};

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Tweens between real values when they change. Screen readers only ever get
 * the final figure, not the intermediate frames.
 */
export function AnimatedNumber({ value, format, from, duration = 1100, className }: Props) {
  const [display, setDisplay] = useState(from ?? value);
  const current = useRef(from ?? value);

  useEffect(() => {
    const start = current.current;
    if (start === value) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const length = reduceMotion ? 0 : duration;
    const t0 = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = length === 0 ? 1 : Math.min(1, (now - t0) / length);
      const next = progress === 1 ? value : start + (value - start) * easeOutCubic(progress);
      current.current = next;
      setDisplay(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  const formatter = FORMATTERS[format];
  // Counts are whole numbers; round so intermediate frames don't show decimals.
  const shown = format === "count" ? Math.round(display) : Math.round(display * 10) / 10;
  return (
    <span className={className}>
      <span aria-hidden="true" className="tabular">
        {formatter(shown)}
      </span>
      <span className="sr-only">{formatter(value)}</span>
    </span>
  );
}
