"use client";

import { useImperativeHandle, useRef, type Ref } from "react";

/** A trainer's colours and the brand mark on its side. Generic shapes. */
export type ShoeStyle = {
  upper: string;
  /** Toe overlay (suede on a Samba); defaults to the upper. */
  toe?: string;
  midsole: string;
  outsole: string;
  laces: string;
  /** Heel tab. */
  accent: string;
  mark: "swoosh" | "stripes";
  markColor: string;
};

export type ShoeState = {
  /** Height off the ground, units. */
  hop: number;
  /** Lean, degrees: positive tips the toe up. */
  tilt: number;
  /** Vertical squash on landing (1 = none). */
  squash: number;
  /** The swoosh drawn through the air, 0–1; null hides it. */
  trail: number | null;
  /** The three stripes lighting up in turn, 0–1; null leaves them plain. */
  pulse: number | null;
};

export type ShoeHandle = { set: (state: ShoeState) => void };

const r2 = (n: number) => Math.round(n * 100) / 100;

const UPPER =
  "M -33 -10 L -34.5 -25 C -34.5 -31 -31 -34 -25 -34 L -17 -34 C -12 -34 -9 -31 -6 -28 L 9 -23.5 C 22 -20 32 -17 37 -14 C 40 -12.4 40 -10.6 38 -10 Z";
const TOE = "M 19 -10 L 20 -20.4 C 28 -18.6 34 -16.4 37 -14 C 40 -12.4 40 -10.6 38 -10 Z";
const MIDSOLE = "M -35 -4.5 L -35 -10.5 L 38.5 -10.5 C 40.5 -10.5 41 -8 39.5 -6.5 C 38.5 -5.2 37 -4.5 35 -4.5 Z";
const OUTSOLE = "M -35.5 -1 L -35.5 -4.8 L 39.6 -4.8 C 40.6 -3 40 -0.6 37.5 0 L -33 0 C -34.6 0 -35.5 -0.4 -35.5 -1 Z";
const SWOOSH = "M -26 -15.5 C -27 -11 -20 -9.6 -10 -12.4 L 27 -27 L -6 -17.6 C -15 -15.2 -22 -15 -26 -15.5 Z";
/** A big swoosh drawn through the air behind the leap, in shoe units. */
const TRAIL = "M -96 -46 C -90 -14 -58 -6 -20 -26 L 64 -92";
const STRIPES = [-1, 6.5, 14];

/**
 * A trainer seen from the side, toe to the right. A celebration drives it
 * frame by frame through `handle`, which writes SVG attributes directly.
 */
export function Shoe({
  style,
  state,
  handle,
  className,
}: {
  style: ShoeStyle;
  state: ShoeState;
  handle?: Ref<ShoeHandle>;
  className?: string;
}) {
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

  // Rocks about the middle of the sole; lifted by however far the heel or toe would dip below the ground.
  const body = (s: ShoeState) => {
    const lift = 38 * Math.sin((Math.abs(s.tilt) * Math.PI) / 180);
    return `translate(0 ${r2(-s.hop - lift)}) rotate(${r2(-s.tilt)} 2 0) scale(1 ${r2(s.squash)})`;
  };

  useImperativeHandle(handle, () => ({
    set(next) {
      const p = parts();
      p.body?.setAttribute("transform", body(next));
      p.shadow?.setAttribute("rx", String(r2(34 * (1 - Math.min(0.5, next.hop / 50)))));
      if (p.trail) {
        p.trail.setAttribute("display", next.trail === null ? "none" : "inline");
        if (next.trail !== null) {
          const draw = Math.min(1, next.trail / 0.6);
          p.trail.setAttribute("stroke-dashoffset", String(r2(1 - draw)));
          p.trail.setAttribute("opacity", String(r2(next.trail < 0.6 ? 0.95 : 0.95 * (1 - (next.trail - 0.6) / 0.4))));
        }
      }
      STRIPES.forEach((_, i) => {
        const glow = p[`glow${i}`];
        if (!glow) return;
        // Each stripe flares in turn, then all three hold together and fade.
        const t = next.pulse;
        const level = t === null ? 0 : Math.max(0, Math.min(1, (t - i * 0.14) / 0.14)) * Math.min(1, (1 - t) / 0.3);
        glow.setAttribute("opacity", String(r2(level)));
      });
    },
  }));

  const markColor = style.markColor;
  return (
    <svg ref={svgRef} viewBox="-42 -104 84 108" overflow="visible" className={className} aria-hidden="true" focusable="false">
      <ellipse data-part="shadow" cx={2} cy={0.6} rx={34} ry={2.2} fill="#000" opacity={0.45} />
      {style.mark === "swoosh" ? (
        <path
          data-part="trail"
          d={TRAIL}
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1}
          display="none"
          fill="none"
          stroke={markColor}
          strokeWidth={5}
          strokeLinecap="round"
        />
      ) : null}
      <g data-part="body" transform={body(state)}>
        <path d={UPPER} fill={style.upper} />
        {style.toe ? <path d={TOE} fill={style.toe} /> : null}
        {/* Collar opening and heel tab. */}
        <path d="M -30 -33.4 C -26 -30.6 -16 -30 -9.4 -30.6 C -11 -33 -14 -34.4 -18 -34.4 L -25 -34.4 Z" fill="#14161c" />
        <path d="M -35 -27 L -34.6 -15 L -31.5 -15 L -31.6 -27.6 Z" fill={style.accent} />
        {/* Laces over the tongue. */}
        {[0, 1, 2, 3].map((i) => (
          <path
            key={i}
            d={`M ${-6 + i * 4.6} ${-27.6 + i * 1.4} l 2.8 3.6`}
            stroke={style.laces}
            strokeWidth={1.4}
            strokeLinecap="round"
          />
        ))}
        {style.mark === "swoosh" ? (
          <path d={SWOOSH} fill={markColor} />
        ) : (
          STRIPES.map((x, i) => (
            <g key={i} transform={`translate(${x} -10.5) rotate(24)`}>
              <rect x={-1.7} y={-15.5} width={3.4} height={15.5} fill={markColor} />
              <rect data-part={`glow${i}`} x={-2.6} y={-16.4} width={5.2} height={17.3} fill="#ffffff" opacity={0} />
            </g>
          ))
        )}
        <path d={MIDSOLE} fill={style.midsole} />
        <path d={OUTSOLE} fill={style.outsole} />
        {/* A lit edge along the top, as the figures have. */}
        <path d={UPPER} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={0.6} />
      </g>
    </svg>
  );
}
