"use client";

import { useImperativeHandle, useRef, type Ref } from "react";

/** A Formula 1 car's colours, after the team's livery. */
export type Livery = {
  body: string;
  /** Sidepod and engine-cover stripe. */
  accent: string;
  /** Nose tip and wing details. */
  detail: string;
  /** Wings and floor. */
  wing: string;
  helmet: string;
  number: string;
  numberColor: string;
};

export type CarState = {
  /** Wheel rotation, degrees. */
  wheel: number;
  /** Turns completed in a doughnut (1 = a full 360°). */
  spin: number;
  /** Body pitch, degrees: positive lifts the nose. */
  pitch: number;
  /** Sideways judder from wheelspin, units. */
  shake: number;
  smoke: { mode: "ring" | "trail"; progress: number } | null;
};

export type CarHandle = { set: (state: CarState) => void };

const r2 = (n: number) => Math.round(n * 100) / 100;
const WHEELS = [
  { x: -36, part: "wheelRear" },
  { x: 34, part: "wheelFront" },
] as const;
const R = 8.2;

const SMOKE = Array.from({ length: 12 }, (_, i) => ({
  a: (i / 12) * Math.PI * 2,
  d: 0.55 + ((i * 5) % 7) / 14,
  h: 0.4 + ((i * 3) % 5) / 8,
  r: 2.6 + (i % 3) * 1.2,
}));

function bodyTransform(s: CarState): string {
  const flip = Math.cos(2 * Math.PI * s.spin);
  // A doughnut seen side-on: the car turns through edge-on and back.
  const scaleX = Math.sign(flip || 1) * Math.max(0.12, Math.abs(flip));
  return `translate(${r2(s.shake)} 0) rotate(${r2(-s.pitch)} 0 -8) scale(${r2(scaleX)} 1)`;
}

/**
 * A side-on Formula 1 car in a team's colours, facing right. Driven frame by
 * frame through `handle`, which writes SVG attributes directly.
 */
export function Car({
  livery,
  state,
  handle,
  mirrored = false,
  className,
}: {
  livery: Livery;
  state: CarState;
  handle?: Ref<CarHandle>;
  mirrored?: boolean;
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

  useImperativeHandle(handle, () => ({
    set(next) {
      const p = parts();
      p.body?.setAttribute("transform", bodyTransform(next));
      for (const wheel of WHEELS) p[wheel.part]?.setAttribute("transform", `rotate(${r2(next.wheel)})`);
      const smoke = p.smoke;
      if (!smoke) return;
      smoke.setAttribute("display", next.smoke ? "inline" : "none");
      if (!next.smoke) return;
      const { mode, progress } = next.smoke;
      const ease = 1 - Math.pow(1 - progress, 2);
      Array.from(smoke.children).forEach((child, i) => {
        const puff = SMOKE[i];
        const x = mode === "ring" ? Math.cos(puff.a) * (16 + 40 * ease * puff.d) : -40 - puff.d * (8 + 66 * ease);
        const y = mode === "ring" ? -5 + Math.sin(puff.a) * (4 + 6 * ease) - 10 * ease * puff.h : -5 - puff.h * (3 + 24 * ease);
        child.setAttribute("cx", String(r2(x)));
        child.setAttribute("cy", String(r2(y)));
        child.setAttribute("r", String(r2(puff.r * (1 + 2.2 * ease))));
        child.setAttribute("opacity", String(r2(0.62 * (1 - progress))));
      });
    },
  }));

  const counterFlip = mirrored ? "scale(-1 1)" : undefined;

  return (
    <svg ref={svgRef} viewBox="-64 -104 128 108" overflow="visible" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="car-sheen" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.28" />
        </linearGradient>
      </defs>
      <ellipse cx={0} cy={0.6} rx={50} ry={2.4} fill="#000" opacity={0.45} />
      <g data-part="body" transform={bodyTransform(state)}>
        {/* Rear wing */}
        <rect x={-55} y={-31} width={13} height={4} rx={0.8} fill={livery.wing} />
        <rect x={-53} y={-28} width={3} height={18} fill={livery.wing} />
        {/* Floor and plank */}
        <rect x={-50} y={-8} width={100} height={4} rx={1} fill="#15171d" />
        {/* Bodywork */}
        <path
          d="M -48 -8 L -48 -18 C -44 -22 -34 -24 -24 -24 L -16 -29 C -12 -31 -8 -30 -6 -26 L -4 -20 L 8 -19 C 20 -18 34 -14 50 -10 L 54 -8 Z"
          fill={livery.body}
        />
        <path d="M -40 -14 L 10 -14 C 24 -13 36 -11 48 -9.4 L 48 -8 L -40 -9.6 Z" fill={livery.accent} />
        <path d="M 46 -10.6 L 54 -8.6 L 54 -8 L 46 -8 Z" fill={livery.detail} />
        <path
          d="M -48 -8 L -48 -18 C -44 -22 -34 -24 -24 -24 L -16 -29 C -12 -31 -8 -30 -6 -26 L -4 -20 L 8 -19 C 20 -18 34 -14 50 -10 L 54 -8 Z"
          fill="url(#car-sheen)"
        />
        {/* Driver and halo */}
        <circle cx={-1} cy={-23} r={3.6} fill={livery.helmet} />
        <rect x={0.4} y={-24.4} width={2.6} height={1.4} rx={0.6} fill="#1b1d24" />
        <path d="M -8 -21.5 C -5 -28 4 -28 8 -21" stroke="#1b1d24" strokeWidth={1.6} fill="none" strokeLinecap="round" />
        {/* Front wing */}
        <rect x={45} y={-6.2} width={14} height={2.8} rx={0.8} fill={livery.wing} />
        <rect x={57} y={-9} width={2.2} height={6} fill={livery.detail} />
        <text x={-22} y={-15.6} textAnchor="middle" fontSize={7.5} fontWeight={800} fill={livery.numberColor} transform={counterFlip ? `translate(-44 0) ${counterFlip}` : undefined} style={{ fontFamily: "inherit", fontStretch: "75%" }}>
          {livery.number}
        </text>
        {WHEELS.map((wheel) => (
          <g key={wheel.part} transform={`translate(${wheel.x} ${-R})`}>
            <circle r={R} fill="#101114" />
            <circle r={R} fill="none" stroke="#2c2f37" strokeWidth={0.8} />
            <g data-part={wheel.part} transform={`rotate(${state.wheel})`}>
              <circle r={4.8} fill="#2b2e36" />
              <path d="M -4.6 0 H 4.6 M 0 -4.6 V 4.6 M -3.3 -3.3 L 3.3 3.3 M -3.3 3.3 L 3.3 -3.3" stroke="#6b7080" strokeWidth={0.7} />
              <circle r={1.4} fill={livery.detail} />
            </g>
          </g>
        ))}
      </g>
      <g data-part="smoke" display="none" fill="#d9d6ce">
        {SMOKE.map((_, i) => (
          <circle key={i} cx={0} cy={0} r={2} opacity={0} />
        ))}
      </g>
    </svg>
  );
}
