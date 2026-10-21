"use client";

import { useId, useImperativeHandle, useRef, type Ref } from "react";

import { jointOffsets, lowestPoint, SKELETON, type Pose } from "./pose";

/**
 * How a figure is dressed. One description covers footballers, basketball
 * players, boxers, fighters, artists and costumed heroes: the drawing picks
 * shapes from `top`, `bottoms`, `shoes` and `gloves`, and colours from the rest.
 */
export type Kit = {
  skin: string;
  hair: string;
  hairStyle: "short" | "swept" | "curly" | "buzz" | "bald" | "long" | "parted";
  beard?: string;
  /** Full helmet with a visor, for armoured heroes. */
  helmet?: { color: string; visor: string };
  top: "shirt" | "vest" | "bare" | "jacket" | "suit";
  /** Colour of the top (ignored when bare). */
  shirt: string;
  /** Vertical shirt stripes (Argentina's sky blue, Barcelona's blaugrana). */
  stripes?: string;
  sleeves: "short" | "long" | "none";
  /** Collar, cuffs and armholes. */
  trim: string;
  /** Shirt number, shown when the figure turns its back. */
  number?: string;
  numberColor?: string;
  /** Chest emblem on a suit. */
  emblem?: string;
  belt?: string;
  cape?: string;
  bottoms: "football" | "basketball" | "trunks" | "fight" | "trousers" | "tights";
  /** Colour of the bottoms (shorts, trunks, trousers or tights). */
  shorts: string;
  shortsTrim?: string;
  socks?: string;
  sockBand?: string;
  socksLength?: "long" | "low";
  shoes: "boots" | "sneakers" | "boxing" | "barefoot" | "hero";
  /** Colour of the shoes. */
  boots: string;
  gloves?: { style: "boxing" | "mma" | "gauntlet"; color: string };
  /** Arms and legs in this colour instead of skin (suits). */
  limbs?: string;
};

export type FigureProp = "basketball" | "mic";

export type FigureEffects = {
  /** Landing debris, 0 → 1 over its life; null hides it. */
  dust?: number | null;
  /** A burst of chalk from (x, y), 0 → 1 over its life. */
  powder?: { x: number; y: number; progress: number } | null;
  /** The floating label (e.g. "304"), 0 → 1 over its life. */
  label?: number | null;
  /** A prop that has left the hand: where it is and how it's turned. */
  prop?: { x: number; y: number; angle: number } | null;
  /** A line from the hand up and away, e.g. a web. */
  line?: { x1: number; y1: number; x2: number; y2: number } | null;
};

export type FigureHandle = {
  setPose: (pose: Pose) => void;
  setEffects: (effects: FigureEffects) => void;
};

const S = SKELETON;

function shade(hex: string, amount: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.min(255, Math.round(v * amount));
  return `#${((1 << 24) | (c((n >> 16) & 255) << 16) | (c((n >> 8) & 255) << 8) | c(n & 255)).toString(16).slice(1)}`;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

/**
 * A tapered limb hanging from its joint at the origin along +y: `top` and
 * `bottom` are widths, bulges push the front (+x) and back (−x) outlines
 * out, peaking at `at` along the length, and both ends are rounded.
 */
function limb(length: number, top: number, bottom: number, front: number, back: number, at: number, start = 0): string {
  const t = top / 2;
  const b = bottom / 2;
  const y0 = start;
  const y1 = length;
  const mid = y0 + (y1 - y0) * at;
  return [
    `M ${-t} ${y0}`,
    `C ${-t - back} ${r2(mid)} ${-b - back * 0.5} ${r2(mid + (y1 - mid) * 0.6)} ${-b} ${y1}`,
    `A ${b} ${b} 0 0 0 ${b} ${y1}`,
    `C ${b + front * 0.5} ${r2(mid + (y1 - mid) * 0.6)} ${t + front} ${r2(mid)} ${t} ${y0}`,
    `A ${t} ${t} 0 0 0 ${-t} ${y0}`,
    "Z",
  ].join(" ");
}

const PATHS = {
  thigh: limb(S.thigh + 1, 9.8, 6.6, 1.3, 0.9, 0.35, -2.5),
  shin: limb(S.shin, 6.4, 3.6, 0.3, 1.7, 0.28, -1.5),
  shortsFootball: limb(13.5, 11.2, 12.2, 0.6, 1.4, 0.5, -4.5),
  shortsBasketball: limb(21, 12.4, 13.6, 0.6, 1.2, 0.5, -4.5),
  trunks: limb(10.5, 12, 12.8, 0.6, 1.2, 0.5, -4.5),
  fightShorts: limb(12, 11.2, 11.6, 0.5, 1, 0.5, -4.5),
  shortsBack: limb(13.5, 10.6, 11, 1.2, 0.4, 0.5, -4.5),
  upperArm: limb(S.upperArm + 1, 5.4, 4.2, 0.7, 0.9, 0.3, -2),
  forearm: limb(S.forearm, 4.4, 2.9, 0.5, 0.3, 0.25, -1.2),
  sleeveShort: limb(S.upperArm * 0.55, 6.6, 5.6, 0.4, 0.6, 0.4, -3),
  sleeveLongUpper: limb(S.upperArm + 1, 6.4, 5, 0.6, 0.9, 0.3, -3),
  sleeveLongFore: limb(S.forearm - 0.6, 5, 3.6, 0.5, 0.3, 0.25, -1.4),
  bootSide: "M -3.2 -0.4 C -3.7 1.2 -3.7 3 -2.9 3.9 L 6.1 4.1 C 7.5 4.1 7.9 3 7.2 2.2 C 6.1 1.1 3.8 0.5 2.2 -0.4 Z",
  bootBack: "M -3 -0.4 L 3 -0.4 C 3.3 1.4 3.2 3.4 2.4 4.1 L -2.4 4.1 C -3.2 3.4 -3.3 1.4 -3 -0.4 Z",
  sneakerSide: "M -3.5 -2.6 L 3.6 -2.8 C 5.6 -1.4 7.6 0.4 7.9 2.4 L 7.9 4.1 L -3.7 4.1 Z",
  sneakerBack: "M -3.3 -2.6 L 3.3 -2.6 C 3.6 0 3.5 2.6 3.2 4.1 L -3.2 4.1 C -3.5 2.6 -3.6 0 -3.3 -2.6 Z",
  footSide: "M -2.8 -0.6 C -3.4 1.4 -3.2 3.2 -2.2 3.9 L 6.6 4 C 7.6 4 7.8 3 7 2.4 C 5.6 1.6 3.4 1 2 -0.4 Z",
  footBack: "M -2.6 -0.4 L 2.6 -0.4 C 2.9 1.4 2.8 3.2 2.2 4 L -2.2 4 C -2.8 3.2 -2.9 1.4 -2.6 -0.4 Z",
  torsoSide:
    "M -5.8 4.4 C -5.2 -2 -5.4 -9 -6.2 -16 C -6.8 -21.6 -5.8 -26.8 -1.2 -27.4 C 2.6 -27.8 5.2 -26.2 6.4 -21.4 C 7.2 -17.4 6.2 -11.4 5.8 -6 C 5.6 -2 6 1.6 6.2 4.4 Z",
  torsoBack:
    "M -7.2 4.4 C -7.4 -3 -7.6 -10 -9.6 -19 C -10.4 -22.6 -9.4 -25.6 -6.4 -26.6 C -3.6 -27.5 3.6 -27.5 6.4 -26.6 C 9.4 -25.6 10.4 -22.6 9.6 -19 C 7.6 -10 7.4 -3 7.2 4.4 Z",
  headSide:
    "M -5.3 0.5 C -5.6 -4.4 -2.6 -6.6 0.4 -6.6 C 3.6 -6.6 5.2 -4.2 5.3 -1.8 L 6.4 0.7 L 5.4 1.3 C 5.6 2.2 5.4 3 5.1 3.3 C 5.2 4.6 4.6 5.9 3.2 6.2 C 1.6 6.6 -0.4 6.2 -1.8 5.2 C -3.6 4.2 -5.2 2.8 -5.3 0.5 Z",
  beardSide:
    "M 0.6 2.2 C 2 2.9 3.6 2.9 5.1 3.3 C 5.2 4.6 4.6 5.9 3.2 6.2 C 1.6 6.6 -0.4 6.2 -1.8 5.2 C -1.2 4 -0.3 2.8 0.6 2.2 Z",
  moustache: "M 3.6 2.4 C 4.4 2.1 5 2.2 5.4 2.6 C 4.8 2.8 4.2 2.8 3.6 2.4 Z",
  helmetSide:
    "M -5.7 1 C -6.1 -5 -2.8 -7.3 0.6 -7.3 C 4.3 -7.3 6.3 -4.6 6.5 -1 L 6.7 2.8 C 6.7 5.1 5.3 6.7 3 6.9 L -1.6 6.9 C -4.1 6.5 -5.7 4.2 -5.7 1 Z",
  visorSide: "M 2 -3.4 L 6.4 -2.7 L 6.6 2.9 C 6.5 4.9 5.1 6.3 3.2 6.5 L 2 6.5 Z",
} as const;

const HAIR_SIDE: Record<Kit["hairStyle"], string | null> = {
  short:
    "M -5.5 1.4 C -6.2 -4.6 -2.8 -7.9 1 -7.7 C 4.2 -7.5 6 -5.6 5.5 -3 C 4.1 -4.5 1.8 -4.9 -0.6 -4.4 C -2.3 -4 -3.4 -2.2 -3.8 0.8 C -4.2 1.6 -4.9 1.8 -5.5 1.4 Z",
  swept:
    "M -5.7 3.4 C -6.8 -4 -3.2 -7.8 0.9 -7.6 C 4.4 -7.4 6.1 -5.2 5.6 -2.7 C 4.4 -4.1 2.3 -4.5 0.1 -4.1 C -2 -3.7 -3.1 -1.5 -3.3 1.5 C -3.6 2.8 -4.5 3.6 -5.7 3.4 Z",
  curly:
    "M -5.6 1.6 C -7.4 -1.4 -6.6 -5.6 -4.2 -7.4 C -3.2 -9.4 -0.4 -10 1.2 -8.8 C 3 -9.8 5.4 -8.6 5.6 -6.4 C 7 -5.4 6.6 -3.4 5.4 -2.6 C 4 -4.2 1.6 -4.6 -0.6 -4.2 C -2.4 -3.8 -3.4 -2 -3.8 0.8 C -4.3 1.8 -5 2 -5.6 1.6 Z",
  buzz: "M -5.4 0.6 C -5.8 -4.6 -2.7 -6.9 0.6 -6.9 C 3.8 -6.9 5.5 -4.8 5.4 -2.9 C 3.4 -4.6 0.4 -4.8 -1.6 -4 C -3.2 -3.2 -3.9 -1.4 -4.2 0.9 Z",
  bald: null,
  long:
    "M -5.9 9.4 C -7.6 2 -6.6 -6.2 -1.6 -7.8 C 2.4 -8.8 5.8 -7 5.8 -3.2 C 4.4 -4.7 2 -5 -0.2 -4.5 C -2.4 -4 -3.4 -1.6 -3.4 1.8 C -3.2 4.6 -2.8 7.2 -3.6 9.6 Z",
  parted:
    "M -5.5 1.2 C -6.1 -4.6 -2.8 -7.5 1 -7.4 C 4.1 -7.3 5.8 -5.4 5.4 -3 C 4 -4.4 1.7 -4.8 -0.6 -4.3 C -2.3 -3.9 -3.4 -2.1 -3.8 0.7 C -4.2 1.5 -4.9 1.6 -5.5 1.2 Z",
};

const HAIR_BACK: Record<Kit["hairStyle"], string | null> = {
  short: "M -5.3 1.4 C -5.8 -4.6 -3 -7.6 0 -7.6 C 3 -7.6 5.8 -4.6 5.3 1.4 C 4.2 2.8 2 3.3 0 3.3 C -2 3.3 -4.2 2.8 -5.3 1.4 Z",
  swept: "M -5.6 3 C -6.2 -4.6 -3.1 -7.6 0 -7.6 C 3.1 -7.6 6.2 -4.6 5.6 3 C 4.4 4.4 2.1 4.9 0 4.9 C -2.1 4.9 -4.4 4.4 -5.6 3 Z",
  curly:
    "M -5.6 1.8 C -7.2 -2 -6 -6.6 -3.4 -8 C -1.6 -10 1.6 -10 3.4 -8 C 6 -6.6 7.2 -2 5.6 1.8 C 4.2 3 2 3.4 0 3.4 C -2 3.4 -4.2 3 -5.6 1.8 Z",
  buzz: "M -5.3 0.8 C -5.6 -4.6 -2.9 -7 0 -7 C 2.9 -7 5.6 -4.6 5.3 0.8 C 4 2 2 2.4 0 2.4 C -2 2.4 -4 2 -5.3 0.8 Z",
  bald: null,
  long: "M -6 9.6 C -7.2 -2 -4.4 -7.8 0 -7.8 C 4.4 -7.8 7.2 -2 6 9.6 C 3.8 11 -3.8 11 -6 9.6 Z",
  parted: "M -5.3 1.4 C -5.8 -4.6 -3 -7.6 0 -7.6 C 3 -7.6 5.8 -4.6 5.3 1.4 C 4.2 2.8 2 3.3 0 3.3 C -2 3.3 -4.2 2.8 -5.3 1.4 Z",
};

/** A cape hanging from the shoulders behind the back; `f` streams it out (side view). */
function capeSidePath(f: number): string {
  const lerp = (a: number, b: number) => r2(a + (b - a) * f);
  return [
    `M -1.4 -26.6`,
    // In flight the body is level, so the cape streams down the back past the feet.
    `C ${lerp(-6, -9)} ${lerp(-24, -18)} ${lerp(-8, -15)} ${lerp(-10, 4)} ${lerp(-9.6, -17)} ${lerp(7, 27)}`,
    `L ${lerp(-2.4, -8)} ${lerp(8, 32)}`,
    `C ${lerp(-4, -6)} ${lerp(-6, 14)} ${lerp(-3.6, -5)} ${lerp(-18, -4)} -5.4 -21`,
    "Z",
  ].join(" ");
}

type Transforms = {
  root: string;
  legN: string;
  legF: string;
  shinN: string;
  shinF: string;
  footN: string;
  footF: string;
  armN: string;
  armF: string;
  foreN: string;
  foreF: string;
  fingerN: string;
  fingerF: string;
  holdN: string;
  torso: string;
  head: string;
  back: boolean;
  /** Which boot to draw; hidden when the shin points into the screen. */
  feet: Record<"N" | "F", "side" | "back" | "none">;
  shadow: { cx: number; rx: number; opacity: number };
};

function transforms(p: Pose): Transforms {
  const back = p.turn >= 0.5;
  // A turn reads as a squeeze through edge-on.
  const scaleX = Math.max(0.16, Math.abs(Math.cos(Math.PI * p.turn)));
  const { hip, shoulder } = jointOffsets(back);
  const pelvis = `translate(${r2(p.x)} ${r2(-S.hipHeight + p.y)})`;
  const lean = back ? 0 : p.lean;
  const torso = `${pelvis} rotate(${r2(lean)})`;
  const shoulderY = -S.torso + S.shoulderDrop;
  const leg = (offset: number, hipAngle: number) => `${pelvis} translate(${offset} 0) rotate(${r2(-hipAngle)})`;
  const shin = (knee: number, scale: number) => `translate(0 ${S.thigh}) rotate(${r2(knee)}) scale(1 ${r2(scale)})`;
  // The boot's pitch is relative to the ground, whatever the leg is doing.
  const foot = (hipAngle: number, knee: number, scale: number, pitch: number) =>
    `translate(0 ${S.thigh}) rotate(${r2(knee)}) translate(0 ${r2(S.shin * scale)}) rotate(${r2(hipAngle - knee + pitch)})`;
  const arm = (offset: number, angle: number) => `${torso} translate(${offset} ${shoulderY}) rotate(${r2(-angle)})`;
  const fore = (elbow: number) => `translate(0 ${S.upperArm}) rotate(${r2(-elbow)})`;
  const finger = (amount: number) => `translate(0 ${S.forearm + 2.6}) scale(1 ${r2(Math.max(0.001, amount))})`;

  const air = Math.max(0, -lowestPoint(p));
  return {
    root: `translate(${r2(p.x)} 0) scale(${r2(scaleX)} ${r2(p.squash)}) translate(${r2(-p.x)} 0)`,
    legN: leg(hip, p.hipN),
    legF: leg(-hip, p.hipF),
    shinN: shin(p.kneeN, p.shinN),
    shinF: shin(p.kneeF, p.shinF),
    footN: foot(p.hipN, p.kneeN, p.shinN, p.ankleN),
    footF: foot(p.hipF, p.kneeF, p.shinF, p.ankleF),
    armN: arm(shoulder, p.shoulderN),
    armF: arm(-shoulder, p.shoulderF),
    foreN: fore(p.elbowN),
    foreF: fore(p.elbowF),
    fingerN: finger(p.pointN),
    fingerF: finger(p.pointF),
    holdN: `translate(0 ${S.forearm + 1.4}) scale(${r2(Math.max(0.001, p.hold))})`,
    torso,
    head: `${torso} translate(0 ${-S.torso - S.neck - S.headRy + 1}) rotate(${r2(back ? 0 : p.head)})`,
    back,
    feet: {
      N: p.shinN < 0.5 ? "none" : back ? "back" : "side",
      F: p.shinF < 0.5 ? "none" : back ? "back" : "side",
    },
    shadow: {
      cx: r2(p.x),
      rx: r2((back ? 16 : 13) * (1 - Math.min(1, air / 30) * 0.5)),
      opacity: r2(0.42 * (1 - Math.min(1, air / 30) * 0.6)),
    },
  };
}

const DUST = [
  { dx: -1, dy: 0.7, r: 1.4 },
  { dx: -0.7, dy: 1.2, r: 1 },
  { dx: -0.35, dy: 1.5, r: 0.8 },
  { dx: 0.35, dy: 1.5, r: 0.8 },
  { dx: 0.7, dy: 1.2, r: 1 },
  { dx: 1, dy: 0.7, r: 1.4 },
];

/** Chalk thrown up from the hands: direction and size of each puff. */
const POWDER = Array.from({ length: 14 }, (_, i) => {
  const a = -Math.PI / 2 + ((i / 13) - 0.5) * 2.4;
  return { dx: Math.cos(a) * (0.6 + (i % 3) * 0.25), dy: Math.sin(a) * (0.8 + ((i * 7) % 4) * 0.15), r: 1.4 + (i % 4) * 0.7 };
});

const ANIMATED = [
  "root",
  "legN",
  "legF",
  "shinN",
  "shinF",
  "footN",
  "footF",
  "armN",
  "armF",
  "foreN",
  "foreF",
  "fingerN",
  "fingerF",
  "holdN",
  "torso",
  "head",
] as const;

function PropShape({ prop }: { prop: FigureProp }) {
  if (prop === "basketball") {
    return (
      <g transform="translate(0 3.6)">
        <circle r={4.4} fill="#e2762a" />
        <path d="M -4.4 0 H 4.4 M 0 -4.4 V 4.4 M -3.1 -3.1 C -1 -1.2 -1 1.2 -3.1 3.1 M 3.1 -3.1 C 1 -1.2 1 1.2 3.1 3.1" stroke="#3a1f0c" strokeWidth={0.5} fill="none" />
        <circle r={4.4} fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth={0.4} />
      </g>
    );
  }
  // A handheld microphone, head pointing away from the hand.
  return (
    <g>
      <rect x={-0.9} y={-1.4} width={1.8} height={6.4} rx={0.7} fill="#1b1d24" />
      <circle cx={0} cy={6.4} r={2} fill="#9aa0aa" />
      <path d="M -1.6 6 H 1.6 M -1.4 7.2 H 1.4" stroke="#5b6070" strokeWidth={0.35} />
    </g>
  );
}

/**
 * A small articulated figure, shaded like a figure under stadium lights.
 * Renders `pose` statically; the celebration drives it frame by frame through
 * the `handle` ref, which writes SVG attributes directly instead of
 * re-rendering React.
 */
export function Figure({
  kit,
  pose,
  handle,
  prop,
  label,
  mirrored = false,
  className,
}: {
  kit: Kit;
  pose: Pose;
  handle?: Ref<FigureHandle>;
  /** Something the figure can hold (and let go of). */
  prop?: FigureProp;
  /** Text that floats up during the celebration, e.g. "304". */
  label?: string;
  /** The figure is flipped to face left; keeps text readable. */
  mirrored?: boolean;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const svgRef = useRef<SVGSVGElement>(null);
  const partsRef = useRef<Record<string, SVGElement> | null>(null);
  // Parts are looked up once, on the first animated frame.
  const parts = () => {
    if (!partsRef.current && svgRef.current) {
      partsRef.current = Object.fromEntries(
        Array.from(svgRef.current.querySelectorAll<SVGElement>("[data-part]")).map((el) => [el.dataset.part!, el]),
      );
    }
    return partsRef.current ?? {};
  };

  useImperativeHandle(handle, () => ({
    setPose(next) {
      const t = transforms(next);
      const r = parts();
      for (const key of ANIMATED) r[key]?.setAttribute("transform", t[key]);
      r.capeSideAnchor?.setAttribute("transform", t.torso);
      r.capeBackAnchor?.setAttribute("transform", t.torso);
      for (const key of ["sideTorso", "sideHead", "sideShortsN", "sideShortsF", "capeSide"]) r[key]?.setAttribute("display", t.back ? "none" : "inline");
      for (const key of ["backTorso", "backHead", "backShortsN", "backShortsF", "capeBack"]) r[key]?.setAttribute("display", t.back ? "inline" : "none");
      for (const side of ["N", "F"] as const) {
        r[`sideFoot${side}`]?.setAttribute("display", t.feet[side] === "side" ? "inline" : "none");
        r[`backFoot${side}`]?.setAttribute("display", t.feet[side] === "back" ? "inline" : "none");
      }
      r.capeSide?.setAttribute("d", capeSidePath(next.cape));
      r.shadow?.setAttribute("cx", String(t.shadow.cx));
      r.shadow?.setAttribute("rx", String(t.shadow.rx));
      r.shadow?.setAttribute("opacity", String(t.shadow.opacity));
    },
    setEffects(fx) {
      const r = parts();
      if (fx.dust !== undefined && r.dust) {
        const progress = fx.dust;
        r.dust.setAttribute("display", progress === null ? "none" : "inline");
        if (progress !== null) {
          const ease = 1 - Math.pow(1 - progress, 2);
          Array.from(r.dust.children).forEach((child, i) => {
            const d = DUST[i];
            child.setAttribute("cx", String(r2(d.dx * (6 + 22 * ease))));
            child.setAttribute("cy", String(r2(-d.dy * 9 * Math.sin(Math.PI * Math.min(1, progress * 1.1)))));
            child.setAttribute("opacity", String(r2(0.8 * (1 - progress))));
          });
        }
      }
      if (fx.powder !== undefined && r.powder) {
        const p = fx.powder;
        r.powder.setAttribute("display", p === null ? "none" : "inline");
        if (p) {
          const ease = 1 - Math.pow(1 - p.progress, 2.4);
          Array.from(r.powder.children).forEach((child, i) => {
            const d = POWDER[i];
            child.setAttribute("cx", String(r2(p.x + d.dx * 20 * ease)));
            child.setAttribute("cy", String(r2(p.y + d.dy * 26 * ease - 6 * p.progress)));
            child.setAttribute("r", String(r2(d.r * (0.6 + 1.6 * ease))));
            child.setAttribute("opacity", String(r2(0.85 * (1 - p.progress))));
          });
        }
      }
      if (fx.label !== undefined && r.label) {
        const l = fx.label;
        r.label.setAttribute("display", l === null ? "none" : "inline");
        if (l !== null) {
          const fade = Math.min(1, l * 5) * Math.min(1, (1 - l) * 3);
          r.label.setAttribute("transform", `translate(0 ${r2(-102 - 16 * l)})`);
          r.label.setAttribute("opacity", String(r2(fade)));
        }
      }
      if (fx.line !== undefined && r.line) {
        const l = fx.line;
        r.line.setAttribute("display", l === null ? "none" : "inline");
        if (l) {
          r.line.setAttribute("x1", String(r2(l.x1)));
          r.line.setAttribute("y1", String(r2(l.y1)));
          r.line.setAttribute("x2", String(r2(l.x2)));
          r.line.setAttribute("y2", String(r2(l.y2)));
        }
      }
      if (fx.prop !== undefined && r.freeProp) {
        const p = fx.prop;
        r.freeProp.setAttribute("display", p === null ? "none" : "inline");
        if (p) r.freeProp.setAttribute("transform", `translate(${r2(p.x)} ${r2(p.y)}) rotate(${r2(p.angle)})`);
      }
    },
  }));

  const t = transforms(pose);
  // Limbs on the far side sit in shadow.
  const far = (hex: string) => shade(hex, 0.74);
  const shadeFill = `url(#${id}-shade)`;
  const clip = (name: string) => `url(#${id}-${name})`;

  /** A flat-coloured shape with the cylinder shading laid over it. */
  const shaded = (d: string, fill: string) => (
    <>
      <path d={d} fill={fill} />
      <path d={d} fill={shadeFill} />
    </>
  );

  const legColour = kit.limbs ?? (kit.bottoms === "trousers" ? kit.shorts : kit.skin);
  const armColour = kit.limbs ?? kit.skin;
  const highShoes = kit.shoes === "boxing" || kit.shoes === "hero";
  const legBottoms: Record<Kit["bottoms"], string | null> = {
    football: PATHS.shortsFootball,
    basketball: PATHS.shortsBasketball,
    trunks: PATHS.trunks,
    fight: PATHS.fightShorts,
    trousers: null,
    tights: null,
  };

  const shoe = (side: "N" | "F", tone: (hex: string) => string) => {
    const sole = <path d="M -3.1 3.4 L 6.6 3.5 L 6.1 4.1 L -2.9 3.9 Z" fill="#1b1d24" opacity={0.75} />;
    switch (kit.shoes) {
      case "barefoot":
        return [shaded(PATHS.footSide, tone(kit.skin)), shaded(PATHS.footBack, tone(kit.skin))];
      case "sneakers":
        return [
          <>
            {shaded(PATHS.sneakerSide, tone(kit.boots))}
            <rect x={-3.7} y={2.9} width={11.6} height={1.2} fill="#f4f5f7" />
          </>,
          <>
            {shaded(PATHS.sneakerBack, tone(kit.boots))}
            <rect x={-3.2} y={2.9} width={6.4} height={1.2} fill="#f4f5f7" />
          </>,
        ];
      default:
        return [
          <>
            {shaded(PATHS.bootSide, tone(kit.boots))}
            {sole}
          </>,
          <>
            {shaded(PATHS.bootBack, tone(kit.boots))}
            <rect x={-2.7} y={3.4} width={5.4} height={0.8} fill="#1b1d24" opacity={0.75} />
          </>,
        ];
    }
  };

  const leg = (side: "N" | "F") => {
    const tone = side === "F" ? far : (hex: string) => hex;
    const [sideShoe, backShoe] = shoe(side, tone);
    const bottoms = legBottoms[kit.bottoms];
    const lowSocks = kit.socksLength === "low";
    return (
      <g data-part={`leg${side}`} transform={t[`leg${side}`]}>
        {shaded(PATHS.thigh, tone(legColour))}
        <g data-part={`shin${side}`} transform={t[`shin${side}`]}>
          {shaded(PATHS.shin, tone(legColour))}
          {kit.socks && kit.bottoms !== "trousers" ? (
            <g clipPath={clip(lowSocks ? "sockLow" : "sock")}>
              {shaded(PATHS.shin, tone(kit.socks))}
              {kit.sockBand ? <rect x={-4.5} y={lowSocks ? 17.4 : 6.2} width={9} height={lowSocks ? 1.2 : 2} fill={tone(kit.sockBand)} /> : null}
            </g>
          ) : null}
          {highShoes ? (
            <g clipPath={clip("bootHigh")}>
              {shaded(PATHS.shin, tone(kit.boots))}
              <rect x={-4.5} y={11} width={9} height={1} fill="rgba(255,255,255,0.35)" />
            </g>
          ) : null}
        </g>
        <g data-part={`foot${side}`} transform={t[`foot${side}`]}>
          <g data-part={`sideFoot${side}`} display={t.feet[side] === "side" ? "inline" : "none"}>
            {sideShoe}
          </g>
          <g data-part={`backFoot${side}`} display={t.feet[side] === "back" ? "inline" : "none"}>
            {backShoe}
          </g>
        </g>
        {bottoms ? (
          <>
            <g data-part={`sideShorts${side}`} display={t.back ? "none" : "inline"}>
              {shaded(bottoms, tone(kit.shorts))}
            </g>
            <g data-part={`backShorts${side}`} display={t.back ? "inline" : "none"}>
              {shaded(kit.bottoms === "football" ? PATHS.shortsBack : bottoms, tone(kit.shorts))}
            </g>
            {kit.shortsTrim ? (
              kit.bottoms === "trunks" ? (
                <rect x={-6.2} y={-4.4} width={12.4} height={2.4} fill={tone(kit.shortsTrim)} />
              ) : (
                <rect x={-6.4} y={kit.bottoms === "basketball" ? 18.6 : kit.bottoms === "fight" ? 9.6 : 11.4} width={12.8} height={1.2} fill={tone(kit.shortsTrim)} />
              )
            ) : null}
          </>
        ) : null}
      </g>
    );
  };

  const hand = (side: "N" | "F", tone: (hex: string) => string) => {
    const gloves = kit.gloves;
    if (gloves?.style === "boxing") {
      return (
        <>
          <rect x={-2.4} y={S.forearm - 1.6} width={4.8} height={2.4} rx={0.6} fill={tone("#f2f2f2")} />
          <ellipse cx={0} cy={S.forearm + 2.8} rx={3.5} ry={4.2} fill={tone(gloves.color)} />
          <ellipse cx={-1} cy={S.forearm + 1.6} rx={1.4} ry={1.8} fill="rgba(255,255,255,0.22)" />
        </>
      );
    }
    const colour = gloves ? gloves.color : armColour;
    return (
      <>
        <ellipse cx={0} cy={S.forearm + 1.4} rx={gloves?.style === "mma" ? 2 : 1.75} ry={2.3} fill={tone(colour)} />
        <g data-part={`finger${side}`} transform={t[`finger${side}`]}>
          <rect x={-0.55} y={0} width={1.1} height={3.8} rx={0.55} fill={tone(colour)} />
        </g>
      </>
    );
  };

  const arm = (side: "N" | "F") => {
    const tone = side === "F" ? far : (hex: string) => hex;
    const long = kit.top !== "bare" && kit.sleeves === "long";
    const short = kit.top !== "bare" && kit.sleeves === "short";
    return (
      <g data-part={`arm${side}`} transform={t[`arm${side}`]}>
        {shaded(PATHS.upperArm, tone(armColour))}
        <g data-part={`fore${side}`} transform={t[`fore${side}`]}>
          {shaded(PATHS.forearm, tone(armColour))}
          {long ? (
            <>
              {shaded(PATHS.sleeveLongFore, tone(kit.shirt))}
              <rect x={-1.9} y={S.forearm - 2.2} width={3.8} height={0.9} rx={0.4} fill={tone(kit.trim)} />
            </>
          ) : null}
          {hand(side, tone)}
          {side === "N" && prop ? (
            <g data-part="holdN" transform={t.holdN}>
              <PropShape prop={prop} />
            </g>
          ) : null}
        </g>
        {long ? shaded(PATHS.sleeveLongUpper, tone(kit.shirt)) : null}
        {short ? (
          <>
            {shaded(PATHS.sleeveShort, tone(kit.shirt))}
            <rect x={-3.2} y={S.upperArm * 0.55 - 1.4} width={6.4} height={1.1} rx={0.5} fill={tone(kit.trim)} />
          </>
        ) : null}
      </g>
    );
  };

  const bare = kit.top === "bare";
  const torsoFill = bare ? kit.skin : kit.shirt;
  const hairSide = HAIR_SIDE[kit.hairStyle];
  const hairBack = HAIR_BACK[kit.hairStyle];
  // Stadium light catching the edge of dark hair, so it reads on a dark page.
  const rim = { stroke: "rgba(255,255,255,0.22)", strokeWidth: 0.45 };
  const counterFlip = mirrored ? "scale(-1 1)" : undefined;

  return (
    <svg ref={svgRef} viewBox="-42 -104 84 108" overflow="visible" className={className} aria-hidden="true" focusable="false">
      <defs>
        {/* Cylinder shading across every limb and the torso: lit from the front, shadowed behind. */}
        <linearGradient id={`${id}-shade`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.34" />
          <stop offset="0.38" stopColor="#000" stopOpacity="0.06" />
          <stop offset="0.7" stopColor="#fff" stopOpacity="0.12" />
          <stop offset="0.88" stopColor="#fff" stopOpacity="0.04" />
          <stop offset="1" stopColor="#000" stopOpacity="0.18" />
        </linearGradient>
        <clipPath id={`${id}-sock`} clipPathUnits="userSpaceOnUse">
          <rect x={-6} y={6.2} width={12} height={S.shin + 4} />
        </clipPath>
        <clipPath id={`${id}-sockLow`} clipPathUnits="userSpaceOnUse">
          <rect x={-6} y={17.4} width={12} height={S.shin} />
        </clipPath>
        <clipPath id={`${id}-bootHigh`} clipPathUnits="userSpaceOnUse">
          <rect x={-6} y={11} width={12} height={S.shin} />
        </clipPath>
        <clipPath id={`${id}-torsoSide`} clipPathUnits="userSpaceOnUse">
          <path d={PATHS.torsoSide} />
        </clipPath>
        <clipPath id={`${id}-torsoBack`} clipPathUnits="userSpaceOnUse">
          <path d={PATHS.torsoBack} />
        </clipPath>
      </defs>

      <ellipse data-part="shadow" cx={t.shadow.cx} cy={0.6} rx={t.shadow.rx} ry={2.2} fill="#000" opacity={t.shadow.opacity} />
      <g data-part="root" transform={t.root}>
        {kit.cape ? (
          <g data-part="capeSideAnchor" transform={t.torso}>
            <path data-part="capeSide" d={capeSidePath(pose.cape)} fill={shade(kit.cape, 0.85)} display={t.back ? "none" : "inline"} />
          </g>
        ) : null}
        {arm("F")}
        {leg("F")}
        {leg("N")}

        <g data-part="torso" transform={t.torso}>
          <g data-part="sideTorso" display={t.back ? "none" : "inline"}>
            <path d={PATHS.torsoSide} fill={torsoFill} />
            {kit.stripes ? (
              <g clipPath={clip("torsoSide")} fill={kit.stripes}>
                <rect x={-4} y={-S.torso - 1} width={2.7} height={S.torso + 6} />
                <rect x={1.5} y={-S.torso - 1} width={2.7} height={S.torso + 6} />
              </g>
            ) : null}
            {kit.top === "suit" && kit.emblem ? <path d="M 2.4 -21 L 6.4 -21 L 4.4 -16.6 Z" fill={kit.emblem} /> : null}
            {kit.belt ? <rect x={-6} y={-1.2} width={12.4} height={2.2} fill={kit.belt} clipPath={clip("torsoSide")} /> : null}
            <path d={PATHS.torsoSide} fill={shadeFill} />
            {bare ? (
              <path d="M 1.8 -18.6 C 3.6 -17.2 5.4 -17.4 6.6 -19 M 4.4 -13 C 4.8 -9 4.6 -5 4.2 -1" stroke={shade(kit.skin, 0.78)} strokeWidth={0.55} fill="none" />
            ) : kit.top === "jacket" ? (
              <path d="M 5.6 -24 C 6.6 -16 6 -6 6 3.6" stroke={shade(kit.shirt, 1.5)} strokeWidth={0.5} fill="none" />
            ) : kit.top !== "suit" ? (
              <path d="M -0.6 -27.2 C 1.6 -27.6 3.6 -27 4.8 -25.6 L 4.1 -24.9 C 3 -26 1.4 -26.4 -0.4 -26.2 Z" fill={kit.trim} />
            ) : null}
          </g>
          <g data-part="backTorso" display={t.back ? "inline" : "none"}>
            <path d={PATHS.torsoBack} fill={torsoFill} />
            {kit.stripes ? (
              <g clipPath={clip("torsoBack")} fill={kit.stripes}>
                <rect x={-7.4} y={-S.torso - 1} width={2.8} height={S.torso + 6} />
                <rect x={-1.4} y={-S.torso - 1} width={2.8} height={S.torso + 6} />
                <rect x={4.6} y={-S.torso - 1} width={2.8} height={S.torso + 6} />
              </g>
            ) : null}
            {kit.belt ? <rect x={-7.6} y={-1.2} width={15.2} height={2.2} fill={kit.belt} clipPath={clip("torsoBack")} /> : null}
            <path d={PATHS.torsoBack} fill={shadeFill} opacity={0.6} />
            {bare ? (
              <path d="M 0 -24 V -2 M -5.6 -21 C -3.6 -18.6 -2.4 -18 -1.4 -18.4 M 5.6 -21 C 3.6 -18.6 2.4 -18 1.4 -18.4" stroke={shade(kit.skin, 0.8)} strokeWidth={0.5} fill="none" />
            ) : kit.top !== "suit" ? (
              <path d="M -3.6 -27.1 C -2.4 -25.8 2.4 -25.8 3.6 -27.1" stroke={kit.trim} strokeWidth={1.1} fill="none" strokeLinecap="round" />
            ) : null}
            {kit.number && !bare ? (
              <text
                x={0}
                y={-8}
                textAnchor="middle"
                fontSize={12.5}
                fontWeight={800}
                fill={kit.numberColor ?? "#fff"}
                transform={counterFlip}
                style={{ fontFamily: "inherit", fontStretch: "75%" }}
              >
                {kit.number}
              </text>
            ) : null}
          </g>
        </g>

        {kit.cape ? (
          <g data-part="capeBackAnchor" transform={t.torso}>
            <path
              data-part="capeBack"
              d="M -8.6 -26.4 C -4 -27.6 4 -27.6 8.6 -26.4 L 11 6.4 C 4 8 -4 8 -11 6.4 Z"
              fill={kit.cape}
              display={t.back ? "inline" : "none"}
            />
          </g>
        ) : null}

        {arm("N")}

        <g data-part="head" transform={t.head}>
          <path d="M -2.3 4 L 2.6 4 L 2.8 9.4 L -2.1 9.4 Z" fill={shade(kit.helmet ? kit.helmet.color : kit.skin, 0.86)} />
          <g data-part="sideHead" display={t.back ? "none" : "inline"}>
            {kit.helmet ? (
              <>
                {shaded(PATHS.helmetSide, kit.helmet.color)}
                <path d={PATHS.visorSide} fill={kit.helmet.visor} />
                <rect x={3.4} y={-1.4} width={2.9} height={0.8} rx={0.4} fill="#c8f4ff" />
              </>
            ) : (
              <>
                <path d={PATHS.headSide} fill={kit.skin} />
                <path d={PATHS.headSide} fill={shadeFill} opacity={0.7} />
                <ellipse cx={-0.7} cy={0.7} rx={1.15} ry={1.8} fill={shade(kit.skin, 0.82)} />
                <circle cx={3.4} cy={-0.5} r={0.45} fill="#1a1412" />
                <path d="M 2.4 -1.9 L 4.6 -1.7" stroke={kit.hair} strokeWidth={0.55} strokeLinecap="round" />
                {kit.beard ? (
                  <>
                    <path d={PATHS.beardSide} fill={kit.beard} />
                    <path d={PATHS.moustache} fill={kit.beard} />
                  </>
                ) : null}
                {hairSide ? <path d={hairSide} fill={kit.hair} {...rim} /> : <path d="M -2 -5.6 C 0 -6.4 2.4 -6.2 3.6 -5" stroke="rgba(255,255,255,0.3)" strokeWidth={0.6} fill="none" />}
                {kit.hairStyle === "parted" ? <path d="M 2.6 -6.9 L 0.8 -4.7" stroke={shade(kit.skin, 1.05)} strokeWidth={0.4} /> : null}
              </>
            )}
          </g>
          <g data-part="backHead" display={t.back ? "inline" : "none"}>
            {kit.helmet ? (
              shaded("M -5.8 2 C -6.2 -5 -3.2 -7.4 0 -7.4 C 3.2 -7.4 6.2 -5 5.8 2 C 5.6 5.4 3 6.8 0 6.8 C -3 6.8 -5.6 5.4 -5.8 2 Z", kit.helmet.color)
            ) : (
              <>
                <ellipse cx={-5.1} cy={0.8} rx={1} ry={1.7} fill={shade(kit.skin, 0.82)} />
                <ellipse cx={5.1} cy={0.8} rx={1} ry={1.7} fill={shade(kit.skin, 0.82)} />
                <ellipse cx={0} cy={0} rx={S.headRx} ry={S.headRy} fill={kit.skin} />
                {hairBack ? <path d={hairBack} fill={kit.hair} {...rim} /> : null}
              </>
            )}
          </g>
        </g>
      </g>
      <line data-part="line" display="none" stroke="#f1f1ee" strokeWidth={0.7} strokeLinecap="round" opacity={0.85} />
      <g data-part="dust" display="none" fill="#e9e6dd">
        {DUST.map((d, i) => (
          <circle key={i} cx={0} cy={0} r={d.r} opacity={0} />
        ))}
      </g>
      <g data-part="powder" display="none" fill="#f4f3ef">
        {POWDER.map((d, i) => (
          <circle key={i} cx={0} cy={0} r={d.r} opacity={0} />
        ))}
      </g>
      {prop ? (
        <g data-part="freeProp" display="none">
          <PropShape prop={prop} />
        </g>
      ) : null}
      {label ? (
        <g data-part="label" display="none">
          <text
            textAnchor="middle"
            fontSize={11}
            fontWeight={800}
            fill="#fff"
            transform={counterFlip}
            style={{ fontFamily: "inherit", fontStretch: "75%" }}
          >
            {label}
          </text>
        </g>
      ) : null}
    </svg>
  );
}
