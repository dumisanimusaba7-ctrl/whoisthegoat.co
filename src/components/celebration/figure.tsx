"use client";

import { useId, useImperativeHandle, useRef, type Ref } from "react";

import { jointOffsets, lowestPoint, SKELETON, type Pose } from "./pose";

/** Kit colours for a figure. Taken from each player's national team kit. */
export type Kit = {
  skin: string;
  hair: string;
  beard?: string;
  shirt: string;
  /** Vertical shirt stripes (e.g. Argentina's sky blue). */
  stripes?: string;
  trim: string;
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
  const r = Math.round(((n >> 16) & 255) * amount);
  const g = Math.round(((n >> 8) & 255) * amount);
  const b = Math.round((n & 255) * amount);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
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
  torso: string;
  head: string;
  front: boolean;
  /** Which boot to draw; hidden when the shin points into the screen (kneeling). */
  feet: Record<"N" | "F", "side" | "front" | "none">;
  shadow: { cx: number; rx: number; opacity: number };
};

const r2 = (n: number) => Math.round(n * 100) / 100;

function transforms(p: Pose): Transforms {
  const front = p.turn >= 0.5;
  // A turn towards the camera reads as a squeeze through edge-on.
  const scaleX = Math.max(0.14, Math.abs(Math.cos(Math.PI * p.turn)));
  const { hip, shoulder } = jointOffsets(front);
  const pelvis = `translate(${r2(p.x)} ${r2(-S.hipHeight + p.y)})`;
  const torso = `${pelvis} rotate(${r2(p.lean)})`;
  const shoulderY = -S.torso + S.shoulderDrop;
  const leg = (offset: number, hipAngle: number) => `${pelvis} translate(${offset} 0) rotate(${r2(-hipAngle)})`;
  const shin = (knee: number, scale: number) => `translate(0 ${S.thigh}) rotate(${r2(knee)}) scale(1 ${r2(scale)})`;
  // Feet sit at the end of the (possibly foreshortened) shin and stay
  // roughly level with the ground.
  const foot = (hipAngle: number, knee: number, scale: number) =>
    `translate(0 ${S.thigh}) rotate(${r2(knee)}) translate(0 ${r2(S.shin * scale)}) rotate(${r2((hipAngle - knee) * 0.6)})`;
  const arm = (offset: number, angle: number) => `${torso} translate(${offset} ${shoulderY}) rotate(${r2(-angle)})`;
  const fore = (elbow: number) => `translate(0 ${S.upperArm}) rotate(${r2(-elbow)})`;

  const air = Math.max(0, -lowestPoint(p));
  return {
    root: `translate(${r2(p.x)} 0) scale(${r2(scaleX)} ${r2(p.squash)}) translate(${r2(-p.x)} 0)`,
    legN: leg(hip, p.hipN),
    legF: leg(-hip, p.hipF),
    shinN: shin(p.kneeN, p.shinN),
    shinF: shin(p.kneeF, p.shinF),
    footN: foot(p.hipN, p.kneeN, p.shinN),
    footF: foot(p.hipF, p.kneeF, p.shinF),
    armN: arm(shoulder, p.shoulderN),
    armF: arm(-shoulder, p.shoulderF),
    foreN: fore(p.elbowN),
    foreF: fore(p.elbowF),
    torso,
    head: `${torso} translate(0 ${-S.torso - S.neck - S.headR}) rotate(${r2(p.head)})`,
    front,
    feet: {
      N: p.shinN < 0.5 ? "none" : front ? "front" : "side",
      F: p.shinF < 0.5 ? "none" : front ? "front" : "side",
    },
    shadow: {
      cx: r2(p.x),
      rx: r2((front ? 15 : 13) * (1 - Math.min(1, air / 30) * 0.5)),
      opacity: r2(0.38 * (1 - Math.min(1, air / 30) * 0.6)),
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

/**
 * A small articulated figure in a player's kit. Renders `pose` statically;
 * the celebration drives it frame by frame through the `handle` ref, which
 * writes SVG transforms directly instead of re-rendering React.
 */
export function Figure({ kit, pose, handle, className }: { kit: Kit; pose: Pose; handle?: Ref<FigureHandle>; className?: string }) {
  const clipSide = useId();
  const clipFront = useId();
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
      for (const key of ["root", "legN", "legF", "shinN", "shinF", "footN", "footF", "armN", "armF", "foreN", "foreF", "torso", "head"] as const) {
        r[key]?.setAttribute("transform", t[key]);
      }
      for (const key of ["sideTorso", "sideHead"]) r[key]?.setAttribute("display", t.front ? "none" : "inline");
      for (const key of ["frontTorso", "frontHead"]) r[key]?.setAttribute("display", t.front ? "inline" : "none");
      for (const side of ["N", "F"] as const) {
        r[`sideFoot${side}`]?.setAttribute("display", t.feet[side] === "side" ? "inline" : "none");
        r[`frontFoot${side}`]?.setAttribute("display", t.feet[side] === "front" ? "inline" : "none");
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
        child.setAttribute("cx", String(r2(d.dx * (5 + 20 * ease))));
        child.setAttribute("cy", String(r2(-d.dy * 9 * Math.sin(Math.PI * Math.min(1, progress * 1.1)))));
        child.setAttribute("opacity", String(r2(0.85 * (1 - progress))));
      });
    },
  }));

  const t = transforms(pose);
  const far = 0.8;
  const farKit: Kit = {
    ...kit,
    skin: shade(kit.skin, far),
    shirt: shade(kit.shirt, far),
    stripes: kit.stripes ? shade(kit.stripes, far) : undefined,
    shorts: shade(kit.shorts, far),
    socks: shade(kit.socks, far),
    sockBand: shade(kit.sockBand, far),
    boots: shade(kit.boots, far),
  };

  const leg = (k: Kit, side: "N" | "F") => (
    <g data-part={`leg${side}`} transform={t[`leg${side}`]}>
      <rect x={-4.3} y={-3} width={8.6} height={S.thigh + 4} rx={4.3} fill={k.skin} />
      <g data-part={`shin${side}`} transform={t[`shin${side}`]}>
        <rect x={-3.2} y={-2.5} width={6.4} height={S.shin + 2} rx={3.2} fill={k.skin} />
        <rect x={-3.4} y={S.shin * 0.24} width={6.8} height={S.shin * 0.76 + 0.5} rx={2.6} fill={k.socks} />
        <rect x={-3.4} y={S.shin * 0.24} width={6.8} height={2.2} fill={k.sockBand} />
      </g>
      <g data-part={`foot${side}`} transform={t[`foot${side}`]}>
        <rect data-part={`sideFoot${side}`} display={t.feet[side] === "side" ? "inline" : "none"} x={-3.6} y={-0.5} width={10.4} height={4.4} rx={2} fill={k.boots} />
        <rect data-part={`frontFoot${side}`} display={t.feet[side] === "front" ? "inline" : "none"} x={-3.3} y={-0.5} width={6.6} height={4.4} rx={2} fill={k.boots} />
      </g>
      {/* Shorts over the top of the thigh */}
      <rect x={-5.3} y={-4} width={10.6} height={S.thigh * 0.55 + 4} rx={3} fill={k.shorts} />
      {k.shortsTrim ? <rect x={-5.3} y={S.thigh * 0.55 - 1.4} width={10.6} height={1.6} fill={k.shortsTrim} /> : null}
    </g>
  );

  const arm = (k: Kit, side: "N" | "F") => (
    <g data-part={`arm${side}`} transform={t[`arm${side}`]}>
      <rect x={-2.7} y={-2} width={5.4} height={S.upperArm + 3} rx={2.7} fill={k.skin} />
      <g data-part={`fore${side}`} transform={t[`fore${side}`]}>
        <rect x={-2.3} y={-1.5} width={4.6} height={S.forearm + 1.5} rx={2.3} fill={k.skin} />
        <circle cx={0} cy={S.forearm + 1} r={2.6} fill={k.skin} />
      </g>
      <rect x={-3.4} y={-3} width={6.8} height={S.upperArm * 0.5 + 3} rx={2.6} fill={k.shirt} />
      <rect x={-3.4} y={S.upperArm * 0.5 - 1.2} width={6.8} height={1.4} fill={k.trim} />
    </g>
  );

  return (
    <svg ref={svgRef} viewBox="-42 -104 84 108" overflow="visible" className={className} aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={clipSide}>
          <rect x={-6.6} y={-S.torso} width={13.2} height={S.torso + 4.5} rx={5} />
        </clipPath>
        <clipPath id={clipFront}>
          <rect x={-9.6} y={-S.torso} width={19.2} height={S.torso + 4.5} rx={5.5} />
        </clipPath>
      </defs>
      <ellipse data-part="shadow" cx={t.shadow.cx} cy={0.6} rx={t.shadow.rx} ry={2.2} fill="#000" opacity={t.shadow.opacity} />
      <g data-part="root" transform={t.root}>
        {arm(farKit, "F")}
        {leg(farKit, "F")}
        {leg(kit, "N")}

        <g data-part="torso" transform={t.torso}>
          <g data-part="sideTorso" display={t.front ? "none" : "inline"}>
            <rect x={-6.6} y={-S.torso} width={13.2} height={S.torso + 4.5} rx={5} fill={kit.shirt} />
            {kit.stripes ? (
              <g clipPath={`url(#${clipSide})`} fill={kit.stripes}>
                <rect x={-4.6} y={-S.torso} width={3.1} height={S.torso + 5} />
                <rect x={1.6} y={-S.torso} width={3.1} height={S.torso + 5} />
              </g>
            ) : null}
            <rect x={-1} y={-S.torso - 0.6} width={6.2} height={2.6} rx={1.2} fill={kit.trim} />
          </g>
          <g data-part="frontTorso" display={t.front ? "inline" : "none"}>
            <rect x={-9.6} y={-S.torso} width={19.2} height={S.torso + 4.5} rx={5.5} fill={kit.shirt} />
            {kit.stripes ? (
              <g clipPath={`url(#${clipFront})`} fill={kit.stripes}>
                <rect x={-7.4} y={-S.torso} width={3.2} height={S.torso + 5} />
                <rect x={-1.6} y={-S.torso} width={3.2} height={S.torso + 5} />
                <rect x={4.2} y={-S.torso} width={3.2} height={S.torso + 5} />
              </g>
            ) : null}
            <path d={`M -4 ${-S.torso - 0.4} L 0 ${-S.torso + 3} L 4 ${-S.torso - 0.4}`} stroke={kit.trim} strokeWidth={1.8} fill="none" strokeLinecap="round" />
          </g>
        </g>

        {arm(kit, "N")}

        <g data-part="head" transform={t.head}>
          <rect x={-2.2} y={S.headR - 2} width={4.4} height={S.neck + 3} fill={kit.skin} />
          <g data-part="sideHead" display={t.front ? "none" : "inline"}>
            <circle cx={0.6} cy={0} r={S.headR} fill={kit.skin} />
            {kit.beard ? <path d="M 1.2 2.4 C 3.6 3.4 6.4 3 8 0.6 C 7.8 5 5 7.8 1.2 7.8 C -1.2 7.8 -2.8 6.6 -3.2 4.6 C -1.6 4.4 -0.2 3.6 1.2 2.4 Z" fill={kit.beard} /> : null}
            <path d="M -7.2 2.6 C -9 -5.6 -4.4 -9.6 1.4 -9.6 C 5.6 -9.6 8.6 -7 8.4 -3.4 C 5.4 -5.8 1.4 -6 -1.8 -4.2 C -3.4 -2.4 -4.4 0.2 -4.8 3 Z" fill={kit.hair} />
          </g>
          <g data-part="frontHead" display={t.front ? "inline" : "none"}>
            <circle cx={0} cy={0} r={S.headR} fill={kit.skin} />
            {kit.beard ? <path d="M -7.2 0.6 C -6.6 6.2 -3.4 8.2 0 8.2 C 3.4 8.2 6.6 6.2 7.2 0.6 C 5.4 3.4 3 4.4 0 4.4 C -3 4.4 -5.4 3.4 -7.2 0.6 Z" fill={kit.beard} /> : null}
            <path d="M -7.9 -0.6 C -8.6 -7.6 -4 -9.9 0 -9.9 C 4 -9.9 8.6 -7.6 7.9 -0.6 C 6.6 -4 3.6 -5.6 0 -5.6 C -3.6 -5.6 -6.6 -4 -7.9 -0.6 Z" fill={kit.hair} />
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
