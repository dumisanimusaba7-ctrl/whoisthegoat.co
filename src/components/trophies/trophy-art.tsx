import { Fragment, type CSSProperties } from "react";

import type { TrophyKind } from "@/lib/trophies";

/**
 * Stylised trophies, drawn on a 48 × 64 grid with the base on the bottom
 * edge. Each is defined once per page in <TrophySprite> and drawn with
 * <TrophyIcon>, which adds a gleam that CSS can sweep across the metal.
 */

type Fill = "metal" | "plinth" | "dark" | "light" | "green" | "ribbonA" | "ribbonB" | "line";
type Part =
  | { el: "path"; d: string; fill: Fill }
  | { el: "rect"; x: number; y: number; w: number; h: number; r?: number; fill: Fill }
  | { el: "circle"; cx: number; cy: number; r: number; fill: Fill }
  | { el: "ellipse"; cx: number; cy: number; rx: number; ry: number; fill: Fill };

const path = (d: string, fill: Fill = "metal"): Part => ({ el: "path", d, fill });
const rect = (x: number, y: number, w: number, h: number, fill: Fill, r = 0): Part => ({ el: "rect", x, y, w, h, r, fill });
const circle = (cx: number, cy: number, r: number, fill: Fill = "metal"): Part => ({ el: "circle", cx, cy, r, fill });
const ellipse = (cx: number, cy: number, rx: number, ry: number, fill: Fill): Part => ({ el: "ellipse", cx, cy, rx, ry, fill });

const LEAGUE: Part[] = [
  rect(14, 54, 20, 8, "plinth", 1.2),
  path("M17 54 L31 54 L28.5 48 L19.5 48 Z"),
  path("M22 48 L26 48 L25.4 40.5 L22.6 40.5 Z"),
  path("M12.6 22.5 C5.4 21 5.4 33 14.2 34 L14.8 31.4 C9.6 30.6 9.6 25 12.9 25.4 Z"),
  path("M35.4 22.5 C42.6 21 42.6 33 33.8 34 L33.2 31.4 C38.4 30.6 38.4 25 35.1 25.4 Z"),
  path("M12 20 C12 31 17 39.5 24 40.5 C31 39.5 36 31 36 20 Z"),
  path("M14.5 20 C15.5 14.5 32.5 14.5 33.5 20 Z"),
  rect(23.2, 12.5, 1.6, 3, "metal"),
  circle(24, 11.5, 2.4),
  ellipse(24, 20, 12, 1.6, "light"),
  rect(14, 56.6, 20, 0.9, "light"),
];

const SHAPES: Record<TrophyKind, Part[]> = {
  "champions-league": [
    rect(16, 53, 16, 9, "plinth", 1.2),
    path("M18 53 L30 53 L28 49 L20 49 Z"),
    path("M21 49 C21 46.5 22.6 44 24 44 C25.4 44 27 46.5 27 49 Z"),
    path("M14 15 C3 9 0 27 6 36 C9 40.4 14 41.4 18.4 39.4 L17.4 36.6 C13.8 38.2 10.4 37.4 8.6 34.6 C4.6 28.6 6.8 16.2 14.6 18.8 Z"),
    path("M34 15 C45 9 48 27 42 36 C39 40.4 34 41.4 29.6 39.4 L30.6 36.6 C34.2 38.2 37.6 37.4 39.4 34.6 C43.4 28.6 41.2 16.2 33.4 18.8 Z"),
    path("M13 12 C13 28 17 40 24 44 C31 40 35 28 35 12 Z"),
    ellipse(24, 12, 11, 2.2, "light"),
    rect(16, 56.5, 16, 1, "light"),
  ],
  "world-cup": [
    rect(13, 53, 22, 9, "plinth", 1.5),
    rect(13, 55.2, 22, 1.6, "green"),
    rect(13, 58.6, 22, 1.6, "green"),
    path("M15.5 53 C17.5 46 14.5 39 17.5 32 C19.5 27.5 21 26 24 26 C27 26 28.5 27.5 30.5 32 C33.5 39 30.5 46 32.5 53 Z"),
    path("M18.5 50 C22.5 45.5 26.5 39 25 30", "line"),
    path("M29.5 50 C25.5 45.5 21.5 39 23 30", "line"),
    circle(24, 16, 11),
    path("M16 12 C18 9 22 9 23 11 C24 13 21 15 22 18 C23 21 19 22 17 19 C15.5 17 14.6 14 16 12 Z", "dark"),
    path("M27 9 C30 8.4 33 10 33.6 13 C34 15.4 32 15.6 30.6 17.4 C29.4 19 27.4 18 27.6 15.8 C27.8 13.6 25.6 10.4 27 9 Z", "dark"),
    ellipse(20, 10.5, 3.6, 2.2, "light"),
  ],
  league: LEAGUE,
  trophy: LEAGUE,
  cup: [
    rect(15, 55, 18, 7, "plinth", 1.2),
    path("M18 55 L30 55 L27.5 50 L20.5 50 Z"),
    path("M22.5 50 L25.5 50 L25 45 L23 45 Z"),
    path("M14.6 19.6 C7 17.6 4.6 29.6 11.6 36.2 C13.2 37.6 15.4 38 17.2 37.2 L16.6 34.6 C14.4 35 12.6 34.4 11.2 32.8 C7.6 28.2 9.6 21.8 14.4 22.6 Z"),
    path("M33.4 19.6 C41 17.6 43.4 29.6 36.4 36.2 C34.8 37.6 32.6 38 30.8 37.2 L31.4 34.6 C33.6 35 35.4 34.4 36.8 32.8 C40.4 28.2 38.4 21.8 33.6 22.6 Z"),
    path("M14 18 C13 30 16 41 24 45 C32 41 35 30 34 18 Z"),
    rect(14, 17.6, 20, 2.2, "dark"),
    path("M15 17.6 C15 10.6 33 10.6 33 17.6 Z"),
    path("M22.6 11 L25.4 11 L24.9 7.4 L23.1 7.4 Z"),
    circle(24, 6.4, 2),
  ],
  "super-cup": [
    rect(15, 55, 18, 7, "plinth", 1.2),
    path("M19 55 L29 55 L26.5 45 L21.5 45 Z"),
    circle(24, 26, 19),
    circle(24, 26, 14, "dark"),
    circle(24, 26, 12.6),
    circle(24, 26, 5, "light"),
  ],
  "club-world-cup": [
    rect(14, 55, 20, 7, "plinth", 1.2),
    path("M17.5 55 L30.5 55 L28 31 L20 31 Z"),
    path("M24 55 L24 31", "line"),
    path("M19 31.5 C14.5 25 15 15 20.5 10.2 L22.2 12.4 C18.4 16.4 18.4 23.6 21.4 29 Z"),
    path("M29 31.5 C33.5 25 33 15 27.5 10.2 L25.8 12.4 C29.6 16.4 29.6 23.6 26.6 29 Z"),
    circle(24, 20, 7.6),
    ellipse(21.6, 17.6, 2.6, 1.8, "light"),
  ],
  continental: [
    rect(12, 56, 24, 6, "plinth", 1.2),
    rect(15.5, 51, 17, 5, "plinth", 1),
    rect(15.5, 52.6, 17, 0.8, "light"),
    path("M19.5 51 L28.5 51 L26.2 44 L21.8 44 Z"),
    path("M14.5 7 C14.5 25 18.6 37.6 24 44 C29.4 37.6 33.5 25 33.5 7 Z"),
    ellipse(24, 7, 9.5, 1.8, "light"),
    path("M18 10 C18.4 22 20.4 31 23 37 L21.6 37.6 C18.8 31 17 22 16.6 10 Z", "light"),
  ],
  shield: [
    path("M8 6 L40 6 L40 27 C40 43 31 51 24 55 C17 51 8 43 8 27 Z"),
    path("M12 10 L36 10 L36 27 C36 40 29 46.6 24 50 C19 46.6 12 40 12 27 Z", "dark"),
    path("M13.4 11.4 L34.6 11.4 L34.6 27 C34.6 39 28.4 45 24 48.2 C19.6 45 13.4 39 13.4 27 Z"),
    rect(16, 57, 16, 5, "plinth", 1),
  ],
  medal: [
    path("M15 2 L23 2 L28.5 27 L20.5 27 Z", "ribbonB"),
    path("M33 2 L25 2 L19.5 27 L27.5 27 Z", "ribbonA"),
    rect(21.5, 24.5, 5, 3, "metal", 1),
    circle(24, 40, 14),
    circle(24, 40, 10.4, "dark"),
    circle(24, 40, 9.4),
    path("M18 34 C20 31.6 25 31 28.4 33 L27.8 34 C25 32.6 21 33 19 35 Z", "light"),
  ],
  "ballon-dor": [
    rect(17, 56, 14, 6, "plinth", 1),
    path("M20.5 56 L27.5 56 L26 50.5 L22 50.5 Z"),
    circle(24, 32, 18.5),
    path("M24 25.5 L30.2 30 L27.8 37.2 L20.2 37.2 L17.8 30 Z", "line"),
    path("M24 25.5 L24 14 M30.2 30 L41.2 26.6 M27.8 37.2 L34.6 46.6 M20.2 37.2 L13.4 46.6 M17.8 30 L6.8 26.6", "line"),
    ellipse(17.8, 23.6, 5.4, 3.2, "light"),
  ],
  // A boot in profile: tall ankle collar on the left, toe on the right, studs below.
  "golden-shoe": [
    rect(8, 57, 32, 5, "plinth", 1),
    rect(13.5, 52, 2.6, 5, "metal", 0.6),
    rect(19.5, 52, 2.6, 5, "metal", 0.6),
    rect(29, 52, 2.6, 5, "metal", 0.6),
    rect(35, 52, 2.6, 5, "metal", 0.6),
    path("M11.5 52.4 L11.5 21 C11.5 17.8 14 16.2 17.2 16.7 L21.4 17.4 C22.2 23.8 25.8 29.4 31.4 32 C37 34.6 40.6 38.6 40.6 44.6 L40.6 49 C40.6 51.2 39.4 52.4 37.2 52.4 Z"),
    path("M21.8 23 L26 21 M23.4 26.6 L27.6 24.6 M25.8 29.8 L29.8 27.8", "line"),
    rect(11.5, 48.6, 29.1, 3.8, "dark"),
    path("M13.6 22 C13.6 20 15.2 18.8 17.2 19 L17.6 20.6 C16.2 20.6 15.2 21.4 15.1 23 L15.1 45 L13.6 45 Z", "light"),
  ],
  // A tall award that opens out towards a ball at the top.
  statuette: [
    rect(15.5, 55, 17, 7, "plinth", 1.2),
    path("M19.6 55 L28.4 55 C28.2 47 31.6 38 32.4 30 C33 24.6 31 21 28 19.4 L20 19.4 C17 21 15 24.6 15.6 30 C16.4 38 19.8 47 19.6 55 Z"),
    path("M24 54 C24.8 44 27.4 34 28.6 24", "line"),
    circle(24, 13, 7.4),
    ellipse(21.4, 10.8, 2.4, 1.6, "light"),
    path("M18.2 27 C18.2 33 20.6 41 21.6 50 L20.4 50 C19.2 41 17 33 17.2 27 Z", "light"),
  ],
};

const METAL: Record<TrophyKind, "gold" | "silver"> = {
  "champions-league": "silver",
  "world-cup": "gold",
  league: "silver",
  trophy: "gold",
  cup: "silver",
  "super-cup": "silver",
  "club-world-cup": "gold",
  continental: "silver",
  shield: "silver",
  medal: "gold",
  "ballon-dor": "gold",
  "golden-shoe": "gold",
  statuette: "gold",
};

const KINDS = Object.keys(SHAPES) as TrophyKind[];

function fillFor(fill: Fill, metal: "gold" | "silver") {
  switch (fill) {
    case "metal":
      return { fill: `url(#tg-${metal})` };
    case "plinth":
      return { fill: "url(#tg-plinth)" };
    case "dark":
      return { fill: "rgba(0,0,0,0.24)" };
    case "light":
      return { fill: "rgba(255,255,255,0.38)" };
    case "green":
      return { fill: "#1f7a4d" };
    case "ribbonA":
      return { fill: "#2f5fc0" };
    case "ribbonB":
      return { fill: "#1f428c" };
    case "line":
      return { fill: "none", stroke: "rgba(0,0,0,0.3)", strokeWidth: 0.9, strokeLinecap: "round" as const };
  }
}

function renderPart(part: Part, key: number, paint?: ReturnType<typeof fillFor>) {
  switch (part.el) {
    case "path":
      return <path key={key} d={part.d} {...paint} />;
    case "rect":
      return <rect key={key} x={part.x} y={part.y} width={part.w} height={part.h} rx={part.r} {...paint} />;
    case "circle":
      return <circle key={key} cx={part.cx} cy={part.cy} r={part.r} {...paint} />;
    case "ellipse":
      return <ellipse key={key} cx={part.cx} cy={part.cy} rx={part.rx} ry={part.ry} {...paint} />;
  }
}

/** Shapes, metals and clip paths for every trophy. Render once per page. */
export function TrophySprite() {
  return (
    <svg aria-hidden="true" focusable="false" width="0" height="0" className="pointer-events-none absolute size-0 overflow-hidden">
      <defs>
        {/* Polished metal: dark edges, a bright band just left of centre. */}
        <linearGradient id="tg-gold" x1="0" x2="1" y1="0" y2="0.2">
          <stop offset="0" stopColor="#6b4d12" />
          <stop offset="0.2" stopColor="#c3942b" />
          <stop offset="0.42" stopColor="#fbe7a1" />
          <stop offset="0.6" stopColor="#dcad45" />
          <stop offset="0.84" stopColor="#a47a20" />
          <stop offset="1" stopColor="#5e430f" />
        </linearGradient>
        <linearGradient id="tg-silver" x1="0" x2="1" y1="0" y2="0.2">
          <stop offset="0" stopColor="#525760" />
          <stop offset="0.2" stopColor="#a1a6af" />
          <stop offset="0.42" stopColor="#f6f8fa" />
          <stop offset="0.6" stopColor="#c6cad1" />
          <stop offset="0.84" stopColor="#8a8f98" />
          <stop offset="1" stopColor="#474b53" />
        </linearGradient>
        <linearGradient id="tg-plinth" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#3b3f4a" />
          <stop offset="1" stopColor="#15171d" />
        </linearGradient>
        <linearGradient id="tg-gleam" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        {KINDS.map((kind) => (
          <Fragment key={kind}>
            <g id={`trophy-${kind}`}>{SHAPES[kind].map((part, i) => renderPart(part, i, fillFor(part.fill, METAL[kind])))}</g>
            <clipPath id={`trophy-clip-${kind}`}>
              {SHAPES[kind].filter((part) => part.fill !== "line").map((part, i) => renderPart(part, i))}
            </clipPath>
          </Fragment>
        ))}
      </defs>
    </svg>
  );
}

/** One trophy. Decorative: whatever it stands for is written next to it. */
export function TrophyIcon({ kind, className = "", style }: { kind: TrophyKind; className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 48 64" className={`trophy ${className}`} style={style} aria-hidden="true" focusable="false">
      <use href={`#trophy-${kind}`} />
      <g clipPath={`url(#trophy-clip-${kind})`}>
        <rect className="trophy-gleam" x={-16} y={-6} width={12} height={76} fill="url(#tg-gleam)" />
      </g>
    </svg>
  );
}
