"use client";

import { useId, useImperativeHandle, useRef, type Ref } from "react";

/** A phone, standing on its edge. Generic shapes; colours from the brand. */
export type Device = {
  kind: "foldable" | "slab";
  frame: string;
  /** Wallpaper colours when the screen lights up. */
  wallpaper: [string, string];
};

export type PhoneState = {
  /** Height off the ground, units. */
  hop: number;
  /** Lean, degrees. */
  tilt: number;
  /** How far a foldable has opened, 0–1. */
  unfold: number;
  /** Screen brightness, 0–1. */
  screen: number;
  /** The camera cut-out swelling into a notification, 0–1. */
  island: number;
  /** A sweep of light across the glass, 0–1 (0 = before it starts). */
  shine: number;
};

export type PhoneHandle = { set: (state: PhoneState) => void };

const r2 = (n: number) => Math.round(n * 100) / 100;
const H = 62;

/**
 * A phone hopping along the bar: a foldable that opens out, or a slab whose
 * screen wakes with a notification. Driven through `handle`.
 */
export function Phone({
  device,
  state,
  handle,
  className,
}: {
  device: Device;
  state: PhoneState;
  handle?: Ref<PhoneHandle>;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const svgRef = useRef<SVGSVGElement>(null);
  const partsRef = useRef<Record<string, SVGElement> | null>(null);
  const parts = () => {
    if (!partsRef.current && svgRef.current) {
      partsRef.current = Object.fromEntries(
        Array.from(svgRef.current.querySelectorAll<SVGElement>("[data-part]")).map((el) => [el.dataset.part!, el]),
      );
    }
    return partsRef.current ?? {};
  };

  const foldable = device.kind === "foldable";
  const width = foldable ? 22 : 30;
  const left = -width / 2;

  const apply = (s: PhoneState, p: Record<string, SVGElement>) => {
    p.body?.setAttribute("transform", `translate(0 ${r2(-s.hop)}) rotate(${r2(s.tilt)} 0 0)`);
    p.screen?.setAttribute("opacity", String(r2(s.screen)));
    p.flap?.setAttribute("transform", `translate(${r2(left + width)} 0) scale(${r2(Math.max(0.001, s.unfold))} 1)`);
    p.island?.setAttribute("width", String(r2(9 + 13 * s.island)));
    p.island?.setAttribute("x", String(r2(-(9 + 13 * s.island) / 2)));
    p.shine?.setAttribute("transform", `translate(${r2(-40 + 90 * s.shine)} 0) skewX(-20)`);
    p.shine?.setAttribute("opacity", s.shine > 0 && s.shine < 1 ? "0.55" : "0");
    p.shadow?.setAttribute("rx", String(r2((foldable ? 14 + 12 * s.unfold : 18) * (1 - Math.min(0.5, s.hop / 30)))));
  };

  useImperativeHandle(handle, () => ({
    set(next) {
      apply(next, parts());
    },
  }));

  const screenFill = `url(#${id}-wall)`;

  return (
    <svg ref={svgRef} viewBox="-42 -104 84 108" overflow="visible" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-wall`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor={device.wallpaper[0]} />
          <stop offset="1" stopColor={device.wallpaper[1]} />
        </linearGradient>
        <clipPath id={`${id}-glass`} clipPathUnits="userSpaceOnUse">
          <rect x={left + 1.6} y={-H + 1.6} width={width - 3.2} height={H - 3.2} rx={3.6} />
        </clipPath>
      </defs>
      <ellipse data-part="shadow" cx={0} cy={0.6} rx={foldable ? 14 : 18} ry={2.2} fill="#000" opacity={0.45} />
      <g data-part="body" transform={`translate(0 ${-state.hop}) rotate(${state.tilt} 0 0)`}>
        {foldable ? (
          // The inner half that swings open from the hinge.
          <g data-part="flap" transform={`translate(${left + width} 0) scale(${Math.max(0.001, state.unfold)} 1)`}>
            <rect x={0} y={-H} width={width} height={H} rx={4.6} fill={device.frame} />
            <rect x={0} y={-H + 1.6} width={width - 1.6} height={H - 3.2} rx={3.6} fill={screenFill} />
          </g>
        ) : null}
        <rect x={left} y={-H} width={width} height={H} rx={foldable ? 4.6 : 6} fill={device.frame} />
        <rect x={left + 1.6} y={-H + 1.6} width={width - 3.2} height={H - 3.2} rx={foldable ? 3.6 : 4.8} fill="#0b0c10" />
        <g data-part="screen" opacity={state.screen}>
          <rect x={left + 1.6} y={-H + 1.6} width={width - 3.2} height={H - 3.2} rx={foldable ? 3.6 : 4.8} fill={screenFill} />
          {/* Clock and a row of icons, just enough to read as a home screen. */}
          <rect x={left + 5} y={-H + 12} width={width - 10} height={3.4} rx={1.2} fill="rgba(255,255,255,0.75)" />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={left + 4 + i * ((width - 8) / 3)} y={-14} width={(width - 8) / 3 - 2} height={(width - 8) / 3 - 2} rx={1.4} fill="rgba(255,255,255,0.4)" />
          ))}
        </g>
        {foldable ? (
          <rect x={left + width - 0.6} y={-H + 2} width={1.2} height={H - 4} fill="rgba(0,0,0,0.35)" />
        ) : (
          <rect data-part="island" x={-4.5} y={-H + 4} width={9} height={3.2} rx={1.6} fill="#050506" />
        )}
        <g clipPath={`url(#${id}-glass)`}>
          <rect data-part="shine" x={-6} y={-H} width={8} height={H} fill="#fff" opacity={0} transform="translate(-40 0) skewX(-20)" />
        </g>
        <rect x={left} y={-H} width={width} height={H} rx={foldable ? 4.6 : 6} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={0.6} />
      </g>
    </svg>
  );
}
