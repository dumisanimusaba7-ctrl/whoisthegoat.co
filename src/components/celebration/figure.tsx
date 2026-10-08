"use client";

import { useId, useImperativeHandle, useRef, type Ref } from "react";

import { jointOffsets, lowestPoint, SKELETON, type Pose } from "./pose";

/** Kit and look for a figure, taken from the player's national team kit. */
export type Kit = {
  skin: string;
  hair: string;
  /** Short and styled up, or longer and swept back. */
  hairStyle: "short" | "swept";
  beard?: string;
  shirt: string;
  /** Vertical shirt stripes (e.g. Argentina's sky blue). */
  stripes?: string;
  sleeves: "short" | "long";
  /** Collar and cuffs. */
  trim: string;
  /** Shirt number, shown when the figure turns its back. */
  number: string;
  numberColor: string;
  shorts: string;
  shortsTrim?: string;
  socks: string;
  sockBand: string;
  boots: string;
};

export type FigureHandle = {
  setPose: (pose: Pose) => void;
  /** Landing debris, 0 → 1 over its life; null hides it. */
  setDust: (progress: number | null) => void;
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
  shortsSide: limb(13.5, 11.2, 12.2, 0.6, 1.4, 0.5, -4.5),
  shortsBack: limb(13.5, 10.6, 11, 1.2, 0.4, 0.5, -4.5),
  upperArm: limb(S.upperArm + 1, 5.4, 4.2, 0.7, 0.9, 0.3, -2),
  forearm: limb(S.forearm, 4.4, 2.9, 0.5, 0.3, 0.25, -1.2),
  sleeveShort: limb(S.upperArm * 0.55, 6.6, 5.6, 0.4, 0.6, 0.4, -3),
  sleeveLongUpper: limb(S.upperArm + 1, 6.4, 5, 0.6, 0.9, 0.3, -3),
  sleeveLongFore: limb(S.forearm - 0.6, 5, 3.6, 0.5, 0.3, 0.25, -1.4),
  bootSide: "M -3.2 -0.4 C -3.7 1.2 -3.7 3 -2.9 3.9 L 6.1 4.1 C 7.5 4.1 7.9 3 7.2 2.2 C 6.1 1.1 3.8 0.5 2.2 -0.4 Z",
  bootBack: "M -3 -0.4 L 3 -0.4 C 3.3 1.4 3.2 3.4 2.4 4.1 L -2.4 4.1 C -3.2 3.4 -3.3 1.4 -3 -0.4 Z",
  torsoSide:
    "M -5.8 4.4 C -5.2 -2 -5.4 -9 -6.2 -16 C -6.8 -21.6 -5.8 -26.8 -1.2 -27.4 C 2.6 -27.8 5.2 -26.2 6.4 -21.4 C 7.2 -17.4 6.2 -11.4 5.8 -6 C 5.6 -2 6 1.6 6.2 4.4 Z",
  torsoBack:
    "M -7.2 4.4 C -7.4 -3 -7.6 -10 -9.6 -19 C -10.4 -22.6 -9.4 -25.6 -6.4 -26.6 C -3.6 -27.5 3.6 -27.5 6.4 -26.6 C 9.4 -25.6 10.4 -22.6 9.6 -19 C 7.6 -10 7.4 -3 7.2 4.4 Z",
  headSide:
    "M -5.3 0.5 C -5.6 -4.4 -2.6 -6.6 0.4 -6.6 C 3.6 -6.6 5.2 -4.2 5.3 -1.8 L 6.4 0.7 L 5.4 1.3 C 5.6 2.2 5.4 3 5.1 3.3 C 5.2 4.6 4.6 5.9 3.2 6.2 C 1.6 6.6 -0.4 6.2 -1.8 5.2 C -3.6 4.2 -5.2 2.8 -5.3 0.5 Z",
  hairShortSide:
    "M -5.5 1.4 C -6.2 -4.6 -2.8 -7.9 1 -7.7 C 4.2 -7.5 6 -5.6 5.5 -3 C 4.1 -4.5 1.8 -4.9 -0.6 -4.4 C -2.3 -4 -3.4 -2.2 -3.8 0.8 C -4.2 1.6 -4.9 1.8 -5.5 1.4 Z",
  hairSweptSide:
    "M -5.7 3.4 C -6.8 -4 -3.2 -7.8 0.9 -7.6 C 4.4 -7.4 6.1 -5.2 5.6 -2.7 C 4.4 -4.1 2.3 -4.5 0.1 -4.1 C -2 -3.7 -3.1 -1.5 -3.3 1.5 C -3.6 2.8 -4.5 3.6 -5.7 3.4 Z",
  beardSide:
    "M 0.6 2.2 C 2 2.9 3.6 2.9 5.1 3.3 C 5.2 4.6 4.6 5.9 3.2 6.2 C 1.6 6.6 -0.4 6.2 -1.8 5.2 C -1.2 4 -0.3 2.8 0.6 2.2 Z",
  moustache: "M 3.6 2.4 C 4.4 2.1 5 2.2 5.4 2.6 C 4.8 2.8 4.2 2.8 3.6 2.4 Z",
  hairShortBack: "M -5.3 1.4 C -5.8 -4.6 -3 -7.6 0 -7.6 C 3 -7.6 5.8 -4.6 5.3 1.4 C 4.2 2.8 2 3.3 0 3.3 C -2 3.3 -4.2 2.8 -5.3 1.4 Z",
  hairSweptBack: "M -5.6 3 C -6.2 -4.6 -3.1 -7.6 0 -7.6 C 3.1 -7.6 6.2 -4.6 5.6 3 C 4.4 4.4 2.1 4.9 0 4.9 C -2.1 4.9 -4.4 4.4 -5.6 3 Z",
} as const;

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
  const finger = `translate(0 ${S.forearm + 2.6}) scale(1 ${r2(Math.max(0.001, p.point))})`;

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
    fingerN: finger,
    fingerF: finger,
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

const ANIMATED = ["root", "legN", "legF", "shinN", "shinF", "footN", "footF", "armN", "armF", "foreN", "foreF", "fingerN", "fingerF", "torso", "head"] as const;

/**
 * A small articulated footballer in a player's kit, shaded like a figure
 * under stadium lights. Renders `pose` statically; the celebration drives it
 * frame by frame through the `handle` ref, which writes SVG transforms
 * directly instead of re-rendering React.
 */
export function Figure({
  kit,
  pose,
  handle,
  mirrored = false,
  className,
}: {
  kit: Kit;
  pose: Pose;
  handle?: Ref<FigureHandle>;
  /** The figure is flipped to face left; keeps the shirt number readable. */
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
      for (const key of ["sideTorso", "sideHead", "sideShortsN", "sideShortsF"]) r[key]?.setAttribute("display", t.back ? "none" : "inline");
      for (const key of ["backTorso", "backHead", "backShortsN", "backShortsF"]) r[key]?.setAttribute("display", t.back ? "inline" : "none");
      for (const side of ["N", "F"] as const) {
        r[`sideFoot${side}`]?.setAttribute("display", t.feet[side] === "side" ? "inline" : "none");
        r[`backFoot${side}`]?.setAttribute("display", t.feet[side] === "back" ? "inline" : "none");
      }
      r.shadow?.setAttribute("cx", String(t.shadow.cx));
      r.shadow?.setAttribute("rx", String(t.shadow.rx));
      r.shadow?.setAttribute("opacity", String(t.shadow.opacity));
    },
    setDust(progress) {
      const group = parts().dust;
      if (!group) return;
      if (progress === null) {
        group.setAttribute("display", "none");
        return;
      }
      group.setAttribute("display", "inline");
      const ease = 1 - Math.pow(1 - progress, 2);
      Array.from(group.children).forEach((child, i) => {
        const d = DUST[i];
        child.setAttribute("cx", String(r2(d.dx * (6 + 22 * ease))));
        child.setAttribute("cy", String(r2(-d.dy * 9 * Math.sin(Math.PI * Math.min(1, progress * 1.1)))));
        child.setAttribute("opacity", String(r2(0.8 * (1 - progress))));
      });
    },
  }));

  const t = transforms(pose);
  // Limbs on the far side sit in shadow.
  const far = (hex: string) => shade(hex, 0.74);
  const shadeFill = `url(#${id}-shade)`;
  const sockClip = `url(#${id}-sock)`;

  /** A flat-coloured shape with the cylinder shading laid over it. */
  const shaded = (d: string, fill: string) => (
    <>
      <path d={d} fill={fill} />
      <path d={d} fill={shadeFill} />
    </>
  );

  const leg = (side: "N" | "F") => {
    const tone = side === "F" ? far : (hex: string) => hex;
    return (
      <g data-part={`leg${side}`} transform={t[`leg${side}`]}>
        {shaded(PATHS.thigh, tone(kit.skin))}
        <g data-part={`shin${side}`} transform={t[`shin${side}`]}>
          {shaded(PATHS.shin, tone(kit.skin))}
          <g clipPath={sockClip}>
            {shaded(PATHS.shin, tone(kit.socks))}
            <rect x={-4.5} y={6.2} width={9} height={2} fill={tone(kit.sockBand)} />
          </g>
        </g>
        <g data-part={`foot${side}`} transform={t[`foot${side}`]}>
          <g data-part={`sideFoot${side}`} display={t.feet[side] === "side" ? "inline" : "none"}>
            {shaded(PATHS.bootSide, tone(kit.boots))}
            <path d="M -3.1 3.4 L 6.6 3.5 L 6.1 4.1 L -2.9 3.9 Z" fill="#1b1d24" opacity={0.75} />
          </g>
          <g data-part={`backFoot${side}`} display={t.feet[side] === "back" ? "inline" : "none"}>
            {shaded(PATHS.bootBack, tone(kit.boots))}
            <rect x={-2.7} y={3.4} width={5.4} height={0.8} fill="#1b1d24" opacity={0.75} />
          </g>
        </g>
        {/* Shorts over the top of the thigh */}
        <g data-part={`sideShorts${side}`} display={t.back ? "none" : "inline"}>
          {shaded(PATHS.shortsSide, tone(kit.shorts))}
        </g>
        <g data-part={`backShorts${side}`} display={t.back ? "inline" : "none"}>
          {shaded(PATHS.shortsBack, tone(kit.shorts))}
        </g>
        {kit.shortsTrim ? <rect x={-6.2} y={11.4} width={12.4} height={1.2} fill={tone(kit.shortsTrim)} /> : null}
      </g>
    );
  };

  const arm = (side: "N" | "F") => {
    const tone = side === "F" ? far : (hex: string) => hex;
    const long = kit.sleeves === "long";
    return (
      <g data-part={`arm${side}`} transform={t[`arm${side}`]}>
        {shaded(PATHS.upperArm, tone(kit.skin))}
        <g data-part={`fore${side}`} transform={t[`fore${side}`]}>
          {shaded(PATHS.forearm, tone(kit.skin))}
          {long ? (
            <>
              {shaded(PATHS.sleeveLongFore, tone(kit.shirt))}
              <rect x={-1.9} y={S.forearm - 2.2} width={3.8} height={0.9} rx={0.4} fill={tone(kit.trim)} />
            </>
          ) : null}
          <ellipse cx={0} cy={S.forearm + 1.4} rx={1.75} ry={2.3} fill={tone(kit.skin)} />
          <g data-part={`finger${side}`} transform={t[`finger${side}`]}>
            <rect x={-0.55} y={0} width={1.1} height={3.8} rx={0.55} fill={tone(kit.skin)} />
          </g>
        </g>
        {long ? (
          shaded(PATHS.sleeveLongUpper, tone(kit.shirt))
        ) : (
          <>
            {shaded(PATHS.sleeveShort, tone(kit.shirt))}
            <rect x={-3.2} y={S.upperArm * 0.55 - 1.4} width={6.4} height={1.1} rx={0.5} fill={tone(kit.trim)} />
          </>
        )}
      </g>
    );
  };

  const hairSide = kit.hairStyle === "swept" ? PATHS.hairSweptSide : PATHS.hairShortSide;
  const hairBack = kit.hairStyle === "swept" ? PATHS.hairSweptBack : PATHS.hairShortBack;
  // Stadium light catching the edge of dark hair, so it reads on a dark page.
  const rim = { stroke: "rgba(255,255,255,0.22)", strokeWidth: 0.45 };

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
        <clipPath id={`${id}-torsoSide`} clipPathUnits="userSpaceOnUse">
          <path d={PATHS.torsoSide} />
        </clipPath>
      </defs>

      <ellipse data-part="shadow" cx={t.shadow.cx} cy={0.6} rx={t.shadow.rx} ry={2.2} fill="#000" opacity={t.shadow.opacity} />
      <g data-part="root" transform={t.root}>
        {arm("F")}
        {leg("F")}
        {leg("N")}

        <g data-part="torso" transform={t.torso}>
          <g data-part="sideTorso" display={t.back ? "none" : "inline"}>
            <path d={PATHS.torsoSide} fill={kit.shirt} />
            {kit.stripes ? (
              <g clipPath={`url(#${id}-torsoSide)`} fill={kit.stripes}>
                <rect x={-4} y={-S.torso - 1} width={2.7} height={S.torso + 6} />
                <rect x={1.5} y={-S.torso - 1} width={2.7} height={S.torso + 6} />
              </g>
            ) : null}
            <path d={PATHS.torsoSide} fill={shadeFill} />
            <path d="M -0.6 -27.2 C 1.6 -27.6 3.6 -27 4.8 -25.6 L 4.1 -24.9 C 3 -26 1.4 -26.4 -0.4 -26.2 Z" fill={kit.trim} />
          </g>
          <g data-part="backTorso" display={t.back ? "inline" : "none"}>
            <path d={PATHS.torsoBack} fill={kit.shirt} />
            <path d={PATHS.torsoBack} fill={shadeFill} opacity={0.6} />
            <path d="M -3.6 -27.1 C -2.4 -25.8 2.4 -25.8 3.6 -27.1" stroke={kit.trim} strokeWidth={1.1} fill="none" strokeLinecap="round" />
            <text
              x={0}
              y={-8}
              textAnchor="middle"
              fontSize={12.5}
              fontWeight={800}
              fill={kit.numberColor}
              transform={mirrored ? "scale(-1 1)" : undefined}
              style={{ fontFamily: "inherit", fontStretch: "75%" }}
            >
              {kit.number}
            </text>
          </g>
        </g>

        {arm("N")}

        <g data-part="head" transform={t.head}>
          <path d="M -2.3 4 L 2.6 4 L 2.8 9.4 L -2.1 9.4 Z" fill={shade(kit.skin, 0.86)} />
          <g data-part="sideHead" display={t.back ? "none" : "inline"}>
            <path d={PATHS.headSide} fill={kit.skin} />
            <path d={PATHS.headSide} fill={shadeFill} opacity={0.7} />
            <ellipse cx={-0.7} cy={0.7} rx={1.15} ry={1.8} fill={shade(kit.skin, 0.82)} />
            <circle cx={3.4} cy={-0.5} r={0.45} fill="#1a1412" />
            <path d="M 2.4 -1.9 L 4.6 -1.7" stroke={shade(kit.hair, 1)} strokeWidth={0.55} strokeLinecap="round" />
            {kit.beard ? (
              <>
                <path d={PATHS.beardSide} fill={kit.beard} />
                <path d={PATHS.moustache} fill={kit.beard} />
              </>
            ) : null}
            <path d={hairSide} fill={kit.hair} {...rim} />
          </g>
          <g data-part="backHead" display={t.back ? "inline" : "none"}>
            <ellipse cx={-5.1} cy={0.8} rx={1} ry={1.7} fill={shade(kit.skin, 0.82)} />
            <ellipse cx={5.1} cy={0.8} rx={1} ry={1.7} fill={shade(kit.skin, 0.82)} />
            <ellipse cx={0} cy={0} rx={S.headRx} ry={S.headRy} fill={kit.skin} />
            <path d={hairBack} fill={kit.hair} {...rim} />
          </g>
        </g>
      </g>
      <g data-part="dust" display="none" fill="#e9e6dd">
        {DUST.map((d, i) => (
          <circle key={i} cx={0} cy={0} r={d.r} opacity={0} />
        ))}
      </g>
    </svg>
  );
}
