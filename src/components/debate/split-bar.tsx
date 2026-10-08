"use client";

import { useEffect, useState } from "react";

import type { DebateOption } from "@/lib/debates";
import { formatPercent } from "@/lib/format";

type Props = {
  options: [DebateOption, DebateOption];
  percents: [number, number];
  /** Grow both segments in from the edges when first shown. */
  animateIn?: boolean;
  /** Bar thickness, e.g. "h-3". */
  size?: string;
  /** Track colour behind the bar (visible when nobody has voted). */
  track?: string;
  className?: string;
};

/**
 * Head-to-head bar: each side grows from its own edge and they meet where
 * the vote splits. The tick marks the halfway line.
 */
export function SplitBar({ options, percents, animateIn = false, size = "h-3", track = "bg-white/10", className = "" }: Props) {
  const [a, b] = options;
  const [shown, setShown] = useState(!animateIn);

  useEffect(() => {
    if (shown) return;
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, [shown]);

  const [pa, pb] = shown ? percents : [0, 0];
  return (
    <div
      role="img"
      aria-label={`${a.shortName} ${formatPercent(percents[0])}, ${b.shortName} ${formatPercent(percents[1])}`}
      className={`relative flex w-full justify-between overflow-hidden ${size} ${track} ${className}`}
    >
      <div
        className="h-full transition-[width] duration-[1200ms] ease-out-expo"
        style={{ width: `max(0px, calc(${pa}% - 1px))`, background: a.color }}
      />
      <div
        className="h-full transition-[width] duration-[1200ms] ease-out-expo"
        style={{ width: `max(0px, calc(${pb}% - 1px))`, background: b.color }}
      />
      <span aria-hidden="true" className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-current opacity-50" />
    </div>
  );
}
