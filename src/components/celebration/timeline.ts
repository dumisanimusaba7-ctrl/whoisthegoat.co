/**
 * Celebration timelines. A timeline turns elapsed time into everything drawn
 * for one frame: where the runner is on the bar, how full the bar is, and the
 * runner's own state (a figure's pose and effects, a car, a phone). Bar fill
 * and runner share one position, so the runner always stops exactly at the
 * end of their result.
 */

import type { CarState, Livery } from "./car";
import type { FigureEffects, FigureProp, Kit } from "./figure";
import {
  AIR_PUNCH,
  AIR_PUNCH_LAND,
  FISTS_DOWN,
  FISTS_UP,
  ALI_GUARD,
  ARMS_CROSSED,
  boxerStep,
  CHALK_GATHER,
  CHALK_TOSS,
  FINGERS_304,
  FLYING,
  GUARD,
  HANDS_EARS,
  HANDS_ON_HIPS,
  hotline,
  JUMP_GATHER,
  JUMPMAN,
  MIC_DROPPED,
  MIC_OUT,
  PLANT,
  POINT_UP,
  SAMBA,
  SHOT,
  SHRUG,
  SKY_FINGER,
  SPIDER_CROUCH,
  STAND_OVER,
  strutPose,
  STRUT_BACK,
  SWINGING,
  TOUCHDOWN,
  UPPERCUT,
} from "./moves";
import type { Device, PhoneState } from "./phone";
import type { ShoeState, ShoeStyle } from "./shoe";
import {
  clamp01,
  easeInCubic,
  easeInOutCubic,
  easeOutBack,
  easeOutCubic,
  grounded,
  handPosition,
  lowestPoint,
  mixPose,
  runPose,
  SIU_AIR,
  SIU_GATHER,
  SIU_POSE,
  SKY_POSE,
  SLIDE_POSE,
  STANDING,
  type Pose,
} from "./pose";

export type FigureCelebration =
  | "siu"
  | "knee-slide"
  | "304"
  | "arms-crossed"
  | "hands-ears"
  | "samba-point"
  | "peekaboo"
  | "ali-shuffle"
  | "chalk-toss"
  | "jumpman-shrug"
  | "sky-finger"
  | "strut"
  | "hotline"
  | "mic-drop"
  | "flight"
  | "web-swing"
  | "air-punch"
  | "fist-pump";
export type CarCelebration = "doughnut" | "burnout";
export type PhoneCelebration = "unfold" | "wake";
export type ShoeCelebration = "swoosh" | "stripes";

/** What runs along the bar for an option, and how it celebrates. */
export type Runner =
  | { kind: "figure"; kit: Kit; celebration: FigureCelebration; prop?: FigureProp; label?: string }
  | { kind: "car"; livery: Livery; celebration: CarCelebration }
  | { kind: "phone"; device: Device; celebration: PhoneCelebration }
  | { kind: "shoe"; style: ShoeStyle; celebration: ShoeCelebration };

export const CAR_REST: CarState = { wheel: 0, spin: 0, pitch: 0, shake: 0, smoke: null };
export const PHONE_REST: PhoneState = { hop: 0, tilt: 0, unfold: 0, screen: 1, island: 0, shine: 0 };
export const SHOE_REST: ShoeState = { hop: 0, tilt: 0, squash: 1, trail: null, pulse: null };

/** When the runner reaches the result, and when the whole moment is over (ms). */
export type Timing = { arrive: number; end: number };

const TIMING: Record<FigureCelebration | CarCelebration | PhoneCelebration | ShoeCelebration, Timing> = {
  siu: { arrive: 1000, end: 1950 },
  "knee-slide": { arrive: 1250, end: 2000 },
  "304": { arrive: 1000, end: 2100 },
  "arms-crossed": { arrive: 1000, end: 1800 },
  "hands-ears": { arrive: 1000, end: 2150 },
  "samba-point": { arrive: 1000, end: 2400 },
  peekaboo: { arrive: 1100, end: 2300 },
  "ali-shuffle": { arrive: 1100, end: 2300 },
  "chalk-toss": { arrive: 1000, end: 2150 },
  "jumpman-shrug": { arrive: 1000, end: 2600 },
  "sky-finger": { arrive: 1000, end: 2100 },
  strut: { arrive: 1400, end: 2350 },
  hotline: { arrive: 1100, end: 2400 },
  "mic-drop": { arrive: 1100, end: 2400 },
  flight: { arrive: 1100, end: 2100 },
  "web-swing": { arrive: 1100, end: 1900 },
  "air-punch": { arrive: 1000, end: 2100 },
  "fist-pump": { arrive: 1000, end: 2200 },
  doughnut: { arrive: 1100, end: 2500 },
  burnout: { arrive: 1100, end: 2400 },
  unfold: { arrive: 1000, end: 1800 },
  wake: { arrive: 1000, end: 2000 },
  swoosh: { arrive: 1000, end: 2000 },
  stripes: { arrive: 1000, end: 2050 },
};

export function runnerTiming(runner: Runner): Timing {
  return TIMING[runner.celebration];
}

/** Fill time for the bar of the option that wasn't chosen. */
export const OTHER_BAR_MS = 1000;

/** Everything drawn for a runner at one moment. */
export type RunnerState = {
  pose?: Pose;
  effects?: FigureEffects;
  car?: CarState;
  phone?: PhoneState;
  shoe?: ShoeState;
};

export type Frame = RunnerState & {
  /** Runner and bar-end position as a fraction of the track. */
  pos: number;
  /** Skid highlight on the bar behind a slide, as track fractions. */
  streak: { from: number; to: number; alpha: number } | null;
  done: boolean;
};

export type Timeline = Timing & { sample: (t: number) => Frame };

type Options = {
  /** Final result as a fraction of the track (0–1). */
  target: number;
  trackPx: number;
  /** Rendered size of one drawing unit, in pixels. */
  unitPx: number;
};

type PropAt = { x: number; y: number; angle: number };
type Moment = { pose: Pose; effects?: FigureEffects };

const NO_EFFECTS: Required<FigureEffects> = { dust: null, powder: null, label: null, prop: null, line: null };
const effects = (e?: FigureEffects): FigureEffects => ({ ...NO_EFFECTS, ...e });

/* ------------------------------------------------------------------------- */
/* Motion helpers                                                             */

/**
 * Run-in easing: from a standing start, peak speed at ~40% of the run, then
 * a longer, controlled deceleration into the plant.
 */
function runEase(u: number): number {
  return 0.5 - 0.5 * Math.cos(Math.PI * Math.pow(clamp01(u), 0.8));
}

/**
 * Distance covered (0–1) at time `u` (0–1): constant acceleration over the
 * first `a` of the time, a steady cruise, then constant braking over the last `d`.
 */
function travel(u: number, a: number, d: number): number {
  const t = clamp01(u);
  const v = 1 / (1 - (a + d) / 2);
  if (t < a) return (v * t * t) / (2 * a);
  if (t <= 1 - d) return v * (a / 2 + (t - a));
  return 1 - (v * (1 - t) * (1 - t)) / (2 * d);
}

/**
 * Integrates the stride so leg speed follows ground speed: legs slow down as
 * the runner does, and feet don't skate.
 */
class Stride {
  private phase = 0;
  private lastT = 0;
  private lastPos = 0;

  /** `length`: body heights covered by one full cycle (two steps) at speed. */
  constructor(
    private readonly trackPx: number,
    private readonly figurePx: number,
    private readonly length = 1.7,
  ) {}

  advance(t: number, pos: number): { phase: number; amount: number } {
    const dt = Math.max(1, t - this.lastT);
    const speedPxPerS = (Math.abs(pos - this.lastPos) * this.trackPx * 1000) / dt;
    const cadence = Math.min(2.6, speedPxPerS / (this.figurePx * this.length));
    this.phase += 2 * Math.PI * cadence * (dt / 1000);
    this.lastT = t;
    this.lastPos = pos;
    return { phase: this.phase, amount: clamp01(speedPxPerS / (this.figurePx * 4.5)) };
  }
}

type Ease = (t: number) => number;
type Key = { ms: number; to: Pose; ease?: Ease };

/** Keeps the 0–1 channels in range when an ease overshoots. */
function tidy(p: Pose): Pose {
  return { ...p, turn: clamp01(p.turn), pointN: clamp01(p.pointN), pointF: clamp01(p.pointF), hold: clamp01(p.hold), cape: clamp01(p.cape) };
}

/** Plays poses one after another, starting from `from`; the pose `s` ms in. */
function through(from: Pose, keys: Key[], s: number): Pose {
  let start = from;
  let t = s;
  for (const key of keys) {
    if (t < key.ms) return tidy(mixPose(start, key.to, (key.ease ?? easeInOutCubic)(clamp01(t / key.ms))));
    t -= key.ms;
    start = key.to;
  }
  return start;
}

const back = (s: number) => (t: number) => easeOutBack(t, s);

/** Rests on the ground if the pose would otherwise sink into it. */
function notBelowGround(pose: Pose): Pose {
  return lowestPoint(pose) > 0 ? grounded(pose) : pose;
}

/** Progress (0–1) of an effect that starts at `from` and lasts `ms`, or null outside it. */
function during(s: number, from: number, ms: number): number | null {
  const p = (s - from) / ms;
  return p >= 0 && p < 1 ? p : null;
}

const BALL_R = 4.4;
const BALL_OFFSET = 3.6;
const GRAVITY = 0.0005; // figure units per ms², about real gravity at this scale

/** A ball let go from the hand: it drops, bounces, rolls on and stops. */
function ballAfter(release: PropAt, ms: number): PropAt {
  const a0 = (release.angle * Math.PI) / 180;
  let cx = release.x - BALL_OFFSET * Math.sin(a0);
  let cy = release.y + BALL_OFFSET * Math.cos(a0);
  let vx = 0.03;
  let vy = 0;
  let spin = a0;
  const dt = 4;
  for (let t = 0; t < ms; t += dt) {
    vy += GRAVITY * dt;
    cx += vx * dt;
    cy += vy * dt;
    if (cy > -BALL_R) {
      cy = -BALL_R;
      vy = vy > 0.05 ? -vy * 0.45 : 0;
      vx *= 0.8;
    }
    if (vy === 0) vx *= 1 - 0.004 * dt;
    spin += (vx * dt) / BALL_R;
  }
  return { x: cx + BALL_OFFSET * Math.sin(spin), y: cy - BALL_OFFSET * Math.cos(spin), angle: (spin * 180) / Math.PI };
}

/** A microphone let go: it drops, tips over, bounces once and lies flat. */
function micAfter(release: PropAt, ms: number): PropAt {
  const groundY = -2;
  const fall = Math.sqrt((2 * Math.max(1, groundY - release.y)) / GRAVITY);
  if (ms < fall) {
    const u = ms / fall;
    return {
      x: release.x + 0.012 * ms,
      y: release.y + 0.5 * GRAVITY * ms * ms,
      angle: release.angle + (100 - release.angle) * easeInCubic(u),
    };
  }
  const b = ms - fall;
  const bounce = b < 140 ? 3.2 * 4 * (b / 140) * (1 - b / 140) : 0;
  return { x: release.x + 0.012 * fall + 0.006 * Math.min(b, 200), y: groundY - bounce, angle: 100 - 10 * easeOutCubic(clamp01(b / 220)) };
}

/* ------------------------------------------------------------------------- */
/* Approaches: how each runner gets to the result                            */

type Approach = "run" | "strut" | "bounce" | "fly" | "swing";
type ApproachFrame = { pos: number; pose: Pose; effects?: FigureEffects };

/** Track fraction where the web is anchored, and its height above the bar. */
const WEB_ANCHOR = { at: 0.55, y: -175 };

function createApproach(kind: Approach, { target, trackPx, unitPx }: Options, arrive: number, carry: Partial<Pose>) {
  const figurePx = 92 * unitPx;
  const stride = new Stride(trackPx, figurePx, kind === "run" ? 1.7 : kind === "strut" ? 0.9 : 0.8);
  // Track fractions to figure units, for things drawn relative to the runner.
  const units = (fraction: number) => (fraction * trackPx) / unitPx;

  return (t: number): ApproachFrame => {
    const u = t / arrive;
    switch (kind) {
      case "run": {
        const pos = target * runEase(u);
        const { phase, amount } = stride.advance(t, pos);
        return { pos, pose: { ...runPose(phase, amount), ...carry } };
      }
      case "strut": {
        const pos = target * travel(u, 0.2, 0.3);
        const { phase, amount } = stride.advance(t, pos);
        return { pos, pose: { ...strutPose(phase, amount), ...carry } };
      }
      case "bounce": {
        const pos = target * travel(u, 0.25, 0.3);
        const { phase, amount } = stride.advance(t, pos);
        const pose = grounded(boxerStep(phase));
        return { pos, pose: { ...pose, y: pose.y - 2.2 * Math.min(1, amount * 3) * Math.abs(Math.sin(phase)) } };
      }
      case "fly": {
        const pos = target * travel(u, 0.1, 0.45);
        return { pos, pose: { ...FLYING, y: FLYING.y + 2.5 * Math.sin(t / 140), cape: 0.82 + 0.18 * Math.sin(t / 45) } };
      }
      case "swing": {
        // One long pendulum swing: slow at either end, fastest at the bottom.
        const w = clamp01(u);
        const pos = target * (0.5 - 0.5 * Math.cos(Math.PI * w));
        const pose: Pose = { ...SWINGING, y: -38 + 30 * Math.sin(Math.PI * w), lean: SWINGING.lean + 26 * (w - 0.5) };
        // The near arm points up the web line.
        const pelvisY = -49 + pose.y;
        const dx = units(WEB_ANCHOR.at * target - pos);
        const dy = WEB_ANCHOR.y - (pelvisY - 23);
        const shoulder = pose.lean - (Math.atan2(-dx, dy) * 180) / Math.PI;
        const hanging = { ...pose, shoulderN: shoulder, elbowN: 0 };
        const hand = handPosition(hanging, "N");
        return {
          pos,
          pose: hanging,
          effects: { line: { x1: hand.x, y1: hand.y, x2: units(WEB_ANCHOR.at * target - pos), y2: WEB_ANCHOR.y } },
        };
      }
    }
  };
}

/* ------------------------------------------------------------------------- */
/* Figure celebrations                                                       */

type FigureSpec = {
  approach: Approach;
  /** Held through the approach, e.g. a ball or a microphone in hand. */
  carry?: Partial<Pose>;
  /** The celebration, `s` ms after arriving; `from` is the last approach pose. */
  after: (s: number, from: Pose) => Moment;
  final: Pose;
  /** Where a dropped prop comes to rest. */
  finalProp?: PropAt;
};

const JORDAN_RELEASE_MS = 700; // gather 160 + air 480 + landing 60
const TOUCHDOWN_BALL: Pose = { ...TOUCHDOWN, hold: 1 };
const JORDAN_LANDED = grounded(TOUCHDOWN_BALL);
const JORDAN_RELEASE = handPosition(JORDAN_LANDED, "N");

const MIC_RELEASE_MS = 650;
const MIC_HELD = grounded(MIC_OUT);
const MIC_RELEASE = handPosition(MIC_HELD, "N");

const CHALK_HANDS = handPosition(grounded(CHALK_TOSS), "N");

const SUPER_LANDED = grounded({ ...STANDING, cape: 0.65 });
const SUPER_FINAL = grounded({ ...HANDS_ON_HIPS, cape: 0.2 });

const FIGURES: Record<Exclude<FigureCelebration, "siu" | "knee-slide">, FigureSpec> = {
  /** Lamine Yamal: hands up, fingers spelling 304, his Rocafonda postcode. */
  "304": {
    approach: "run",
    after: (s, from) => {
      const pose = grounded(through(from, [{ ms: 140, to: PLANT, ease: easeOutCubic }, { ms: 380, to: FINGERS_304, ease: back(1.4) }], s));
      const sway = s > 520 ? Math.sin((s - 520) / 160) * Math.exp(-(s - 520) / 500) : 0;
      return { pose: { ...pose, lean: pose.lean + 3 * sway }, effects: { label: during(s, 200, 900) } };
    },
    final: grounded(FINGERS_304),
  },

  /** Kylian Mbappé: stops dead, folds his arms, chin up. */
  "arms-crossed": {
    approach: "run",
    after: (s, from) => {
      const pose = grounded(through(from, [{ ms: 150, to: PLANT, ease: easeOutCubic }, { ms: 360, to: ARMS_CROSSED, ease: back(1.2) }], s));
      const chin = easeInOutCubic(clamp01((s - 520) / 260));
      return { pose: { ...pose, head: pose.head - 5 * chin, lean: pose.lean - 2 * chin } };
    },
    final: grounded({ ...ARMS_CROSSED, head: ARMS_CROSSED.head - 5, lean: ARMS_CROSSED.lean - 2 }),
  },

  /** Neymar, turned away to show the 10: hands cupped to the ears, swaying. */
  "hands-ears": {
    approach: "run",
    after: (s, from) => {
      const pose = grounded(through(from, [{ ms: 140, to: PLANT, ease: easeOutCubic }, { ms: 420, to: HANDS_EARS }], s));
      const sway = s > 560 ? Math.sin((2 * Math.PI * (s - 560)) / 380) * clamp01((s - 560) / 150) * clamp01((1150 - s) / 200) : 0;
      return { pose: grounded({ ...pose, x: 1.8 * sway, hipN: pose.hipN + 4 * sway, hipF: pose.hipF + 4 * sway }) };
    },
    final: grounded(HANDS_EARS),
  },

  /** Ronaldinho: a samba shimmy with his back turned, then both fingers to the sky. */
  "samba-point": {
    approach: "run",
    after: (s, from) => {
      if (s < 1060) {
        const pose = grounded(through(from, [{ ms: 140, to: PLANT, ease: easeOutCubic }, { ms: 300, to: SAMBA }], s));
        const beat = s > 440 ? Math.sin((2 * Math.PI * (s - 440)) / 310) : 0;
        return {
          pose: grounded({
            ...pose,
            x: 2.2 * beat,
            hipN: pose.hipN + 8 * beat,
            hipF: pose.hipF + 8 * beat,
            kneeN: pose.kneeN + 6 * Math.max(0, beat),
            kneeF: pose.kneeF - 6 * Math.max(0, -beat),
            shoulderN: pose.shoulderN + 22 * beat,
            shoulderF: pose.shoulderF + 22 * beat,
          }),
        };
      }
      return { pose: grounded(through(SAMBA, [{ ms: 320, to: POINT_UP, ease: back(1.3) }], s - 1060)) };
    },
    final: grounded(POINT_UP),
  },

  /** Mike Tyson: peek-a-boo guard, a bob and weave, then the uppercut. */
  peekaboo: {
    approach: "bounce",
    after: (s, from) => {
      if (s < 160) return { pose: grounded(through(from, [{ ms: 160, to: GUARD, ease: easeOutCubic }], s)) };
      if (s < 640) {
        const dip = Math.abs(Math.sin((Math.PI * (s - 160)) / 240));
        return {
          pose: grounded({ ...GUARD, lean: GUARD.lean + 18 * dip, head: GUARD.head + 6 * dip, kneeN: GUARD.kneeN + 24 * dip, kneeF: GUARD.kneeF + 22 * dip, hipN: GUARD.hipN + 10 * dip }),
        };
      }
      return {
        pose: grounded(
          through(GUARD, [{ ms: 150, to: UPPERCUT, ease: easeOutCubic }, { ms: 220, to: UPPERCUT }, { ms: 300, to: GUARD }], s - 640),
        ),
      };
    },
    final: grounded(GUARD),
  },

  /** Muhammad Ali: the Ali shuffle, then standing over the fallen man. */
  "ali-shuffle": {
    approach: "bounce",
    after: (s, from) => {
      if (s < 150) return { pose: grounded(through(from, [{ ms: 150, to: ALI_GUARD, ease: easeOutCubic }], s)) };
      if (s < 660) {
        const f = Math.sin((2 * Math.PI * (s - 150)) / 125);
        const pose = grounded({ ...ALI_GUARD, hipN: 4 + 13 * f, hipF: -4 - 13 * f, kneeN: 14, kneeF: 14 });
        return { pose: { ...pose, y: pose.y - 2.4 * Math.abs(f) } };
      }
      const pose = grounded(through(ALI_GUARD, [{ ms: 340, to: STAND_OVER, ease: back(1.3) }], s - 660));
      const shout = s > 1000 ? 3 * Math.sin((s - 1000) / 45) * Math.exp(-(s - 1000) / 250) : 0;
      return { pose: { ...pose, head: pose.head + shout } };
    },
    final: grounded(STAND_OVER),
  },

  /** LeBron James: crouch, then the chalk thrown up into the lights. */
  "chalk-toss": {
    approach: "run",
    after: (s, from) => {
      const pose = grounded(through(from, [{ ms: 260, to: CHALK_GATHER, ease: easeOutCubic }, { ms: 220, to: CHALK_TOSS, ease: easeOutCubic }], s));
      const hop = s > 260 && s < 620 ? 7 * Math.sin((Math.PI * (s - 260)) / 360) : 0;
      const burst = during(s, 330, 800);
      return {
        pose: { ...pose, y: pose.y - hop },
        effects: { powder: burst === null ? null : { x: CHALK_HANDS.x, y: CHALK_HANDS.y - 4, progress: burst } },
      };
    },
    final: grounded(CHALK_TOSS),
  },

  /** Michael Jordan: the Jumpman leap, then the shrug, ball left bouncing. */
  "jumpman-shrug": {
    approach: "run",
    carry: { hold: 1 },
    after: (s, from) => {
      const GATHER = 160;
      const AIR = 480;
      const ball = s >= JORDAN_RELEASE_MS ? ballAfter(JORDAN_RELEASE, s - JORDAN_RELEASE_MS) : null;
      if (s < GATHER) return { pose: grounded(through(from, [{ ms: GATHER, to: JUMP_GATHER, ease: easeOutCubic }], s)) };
      if (s < GATHER + AIR) {
        const u = (s - GATHER) / AIR;
        const body = u < 0.45 ? mixPose(JUMP_GATHER, JUMPMAN, easeOutCubic(u / 0.45)) : mixPose(JUMPMAN, TOUCHDOWN_BALL, easeInCubic((u - 0.45) / 0.55) * 0.6);
        const pose = grounded(body);
        return { pose: { ...pose, y: pose.y - 30 * 4 * u * (1 - u) } };
      }
      const l = s - GATHER - AIR;
      const impact = 1 - easeOutCubic(clamp01(l / 160));
      const pose = grounded(
        through(
          mixPose(JUMPMAN, TOUCHDOWN_BALL, 0.6),
          // The ball is let go the moment he lands (JORDAN_RELEASE_MS).
          [{ ms: 60, to: TOUCHDOWN_BALL, ease: easeOutCubic }, { ms: 1, to: TOUCHDOWN }, { ms: 340, to: SHRUG }],
          l,
        ),
      );
      return {
        pose: { ...pose, squash: 1 - 0.06 * impact },
        effects: { dust: during(s, GATHER + AIR, 420), prop: ball },
      };
    },
    final: grounded(SHRUG),
    finalProp: ballAfter(JORDAN_RELEASE, 6000),
  },

  /** Khabib Nurmagomedov: a level change at the legs, then one finger to the sky. */
  "sky-finger": {
    approach: "run",
    after: (s, from) => ({
      pose: grounded(
        through(from, [{ ms: 220, to: SHOT, ease: easeOutCubic }, { ms: 90, to: SHOT }, { ms: 360, to: SKY_FINGER }], s),
      ),
    }),
    final: grounded(SKY_FINGER),
  },

  /** Pelé: a run, a crouch, then the leap with his fist punched at the sky. */
  "air-punch": {
    approach: "run",
    after: (s, from) => {
      const GATHER = 160;
      const AIR = 440;
      if (s < GATHER) return { pose: grounded(through(from, [{ ms: GATHER, to: JUMP_GATHER, ease: easeOutCubic }], s)) };
      if (s < GATHER + AIR) {
        const u = (s - GATHER) / AIR;
        const pose = grounded(mixPose(JUMP_GATHER, AIR_PUNCH, easeOutCubic(Math.min(1, u / 0.4))));
        return { pose: { ...pose, y: pose.y - 34 * 4 * u * (1 - u) } };
      }
      const l = s - GATHER - AIR;
      const impact = 1 - easeOutCubic(clamp01(l / 160));
      const pose = grounded(through(AIR_PUNCH, [{ ms: 120, to: AIR_PUNCH_LAND, ease: easeOutCubic }], l));
      return { pose: { ...pose, squash: 1 - 0.06 * impact }, effects: { dust: during(s, GATHER + AIR, 380) } };
    },
    final: grounded(AIR_PUNCH_LAND),
  },

  /** Diego Maradona, Mexico 1986: fists pulled down in a roar, then thrown up, twice. */
  "fist-pump": {
    approach: "run",
    after: (s, from) => {
      const pose = grounded(
        through(
          from,
          [
            { ms: 140, to: PLANT, ease: easeOutCubic },
            { ms: 200, to: FISTS_DOWN, ease: easeOutCubic },
            { ms: 220, to: FISTS_UP, ease: back(1.3) },
            { ms: 180, to: FISTS_DOWN, ease: easeInOutCubic },
            { ms: 240, to: FISTS_UP, ease: back(1.4) },
          ],
          s,
        ),
      );
      const shake = s > 980 ? 2.5 * Math.sin((s - 980) / 40) * Math.exp(-(s - 980) / 260) : 0;
      return { pose: { ...pose, head: pose.head + shake } };
    },
    final: grounded(FISTS_UP),
  },

  /** Conor McGregor: the billionaire strut, turned to show the back. */
  strut: {
    approach: "strut",
    after: (s, from) => {
      const pose = grounded(through(from, [{ ms: 320, to: STRUT_BACK }], s));
      const b = s > 320 ? Math.sin((2 * Math.PI * (s - 320)) / 620) * clamp01((900 - s) / 200) : 0;
      return {
        pose: grounded({ ...pose, x: 1.4 * b, shoulderN: pose.shoulderN + 16 * b, shoulderF: pose.shoulderF + 16 * b, hipN: pose.hipN + 5 * b, hipF: pose.hipF + 5 * b }),
      };
    },
    final: grounded(STRUT_BACK),
  },

  /** Drake: the Hotline Bling two-step. */
  hotline: {
    approach: "strut",
    after: (s, from) => {
      if (s < 200) return { pose: grounded(through(from, [{ ms: 200, to: hotline(-1) }], s)) };
      const b = -Math.cos(Math.min(3 * Math.PI, (2 * Math.PI * (s - 200)) / 560));
      return { pose: grounded(hotline(b)) };
    },
    final: grounded(hotline(1)),
  },

  /** Kendrick Lamar: mic held out to the crowd, then dropped. */
  "mic-drop": {
    approach: "strut",
    carry: { hold: 1 },
    after: (s, from) => {
      const mic = s >= MIC_RELEASE_MS ? micAfter(MIC_RELEASE, s - MIC_RELEASE_MS) : null;
      const pose = grounded(
        through(from, [{ ms: 300, to: MIC_OUT, ease: easeOutCubic }, { ms: MIC_RELEASE_MS - 300, to: MIC_OUT }, { ms: 1, to: { ...MIC_OUT, hold: 0 } }, { ms: 420, to: MIC_DROPPED }], s),
      );
      return { pose, effects: { prop: mic } };
    },
    final: grounded(MIC_DROPPED),
    finalProp: micAfter(MIC_RELEASE, 4000),
  },

  /** DC: Superman flies in, lands, and stands with his hands on his hips. */
  flight: {
    approach: "fly",
    after: (s, from) => {
      const LAND = 360;
      if (s < LAND) {
        const pose = notBelowGround(tidy(mixPose(from, SUPER_LANDED, easeInOutCubic(s / LAND))));
        return { pose, effects: { dust: during(s, LAND - 30, 420) } };
      }
      const pose = grounded(through(SUPER_LANDED, [{ ms: 380, to: SUPER_FINAL }], s - LAND));
      const flutter = 0.35 * Math.exp(-(s - LAND) / 320) * (0.5 + 0.5 * Math.sin(s / 55));
      return { pose: { ...pose, cape: clamp01(pose.cape + flutter) }, effects: { dust: during(s, LAND - 30, 420) } };
    },
    final: SUPER_FINAL,
  },

  /** Marvel: Spider-Man swings in on a web and drops into a crouch. */
  "web-swing": {
    approach: "swing",
    after: (s, from) => {
      const DROP = 300;
      const crouch = grounded(SPIDER_CROUCH);
      const pose = s < DROP ? notBelowGround(tidy(mixPose(from, crouch, easeInCubic(s / DROP)))) : crouch;
      const impact = s >= DROP ? 1 - easeOutCubic(clamp01((s - DROP) / 180)) : 0;
      return { pose: { ...pose, squash: 1 - 0.07 * impact }, effects: { dust: during(s, DROP - 20, 420) } };
    },
    final: grounded(SPIDER_CROUCH),
  },
};

function figureTimeline(spec: FigureSpec, timing: Timing, options: Options): Timeline {
  const { arrive, end } = timing;
  const approach = createApproach(spec.approach, options, arrive, spec.carry ?? {});
  let from: Pose = STANDING;
  return {
    arrive,
    end,
    sample(t) {
      if (t < arrive) {
        const a = approach(t);
        from = a.pose;
        return { pos: a.pos, pose: a.pose, effects: effects(a.effects), streak: null, done: false };
      }
      const m = spec.after(t - arrive, from);
      return { pos: options.target, pose: m.pose, effects: effects(m.effects), streak: null, done: t >= end };
    },
  };
}

/* ------------------------------------------------------------------------- */
/* Cars and phones                                                           */

const WHEEL_R = 8.2;

function carTimeline(kind: CarCelebration, timing: Timing, { target, trackPx, unitPx }: Options): Timeline {
  const { arrive, end } = timing;
  // Wheels turn with the distance covered: no skidding on the way in.
  const rolled = (pos: number) => ((pos * trackPx) / (WHEEL_R * unitPx)) * (180 / Math.PI);
  const parked = rolled(target);
  const show = end - arrive;

  return {
    arrive,
    end,
    sample(t) {
      if (t < arrive) {
        const u = t / arrive;
        const pos = target * travel(u, 0.18, 0.4);
        // The nose dips under braking.
        const braking = u > 0.6 ? Math.sin((Math.PI * (u - 0.6)) / 0.4) : 0;
        return { pos, car: { ...CAR_REST, wheel: rolled(pos), pitch: -1.8 * braking }, streak: null, done: false };
      }
      const s = t - arrive;
      if (kind === "doughnut") {
        const SPIN = 1100;
        const spinning = s < SPIN;
        const settle = spinning ? 0 : 1.4 * Math.exp(-(s - SPIN) / 110) * Math.sin((s - SPIN) / 38);
        return {
          pos: target,
          car: {
            wheel: parked + 1.6 * Math.min(s, SPIN),
            spin: 2 * easeInOutCubic(clamp01(s / SPIN)),
            pitch: settle,
            shake: spinning ? 0.5 * Math.sin(s / 16) : 0,
            smoke: { mode: "ring", progress: clamp01(s / show) },
          },
          streak: null,
          done: t >= end,
        };
      }
      // Burnout: held on the brakes, rear wheels spinning up a cloud of smoke.
      const SPIN = 1050;
      const spinning = s > 120 && s < SPIN;
      return {
        pos: target,
        car: {
          wheel: parked + (s > 120 ? 2.4 * (Math.min(s, SPIN) - 120) : 0),
          spin: 0,
          pitch: s < 120 ? -1.8 * (1 - s / 120) : spinning ? 1.3 : 1.3 * Math.exp(-(s - SPIN) / 120),
          shake: spinning ? 0.7 * Math.sin(s / 12) : 0,
          smoke: s > 120 ? { mode: "trail", progress: clamp01((s - 120) / (show - 120)) } : null,
        },
        streak: null,
        done: t >= end,
      };
    },
  };
}

function phoneTimeline(kind: PhoneCelebration, timing: Timing, { target, trackPx, unitPx }: Options): Timeline {
  const { arrive, end } = timing;
  // A whole number of hops, so the last one lands on the result.
  const hops = Math.max(1, Math.round((target * trackPx) / (30 * unitPx)));
  const asleep = 0.35;

  return {
    arrive,
    end,
    sample(t) {
      if (t < arrive) {
        const pos = target * travel(t / arrive, 0.15, 0.25);
        const ph = Math.PI * hops * (target > 0 ? pos / target : 1);
        return {
          pos,
          phone: { ...PHONE_REST, hop: 9 * Math.abs(Math.sin(ph)), tilt: 7 * Math.sin(2 * ph), screen: asleep },
          streak: null,
          done: false,
        };
      }
      const s = t - arrive;
      const screen = asleep + (1 - asleep) * easeOutCubic(clamp01(s / 300));
      if (kind === "unfold") {
        return {
          pos: target,
          phone: {
            ...PHONE_REST,
            hop: s < 260 ? 4 * Math.sin((Math.PI * s) / 260) : 0,
            unfold: Math.max(0, s < 120 ? 0 : easeOutBack(clamp01((s - 120) / 480), 1.1)),
            screen,
          },
          streak: null,
          done: t >= end,
        };
      }
      const sweep = (s - 280) / 520;
      const island = s < 200 ? 0 : s < 460 ? easeOutBack((s - 200) / 260, 1.4) : s < 700 ? 1 : 1 - easeInOutCubic(clamp01((s - 700) / 220));
      return {
        pos: target,
        phone: { ...PHONE_REST, screen, island, shine: sweep > 0 && sweep < 1 ? sweep : 0 },
        streak: null,
        done: t >= end,
      };
    },
  };
}

/**
 * Trainers walk in heel to toe. Nike's leaps and draws the swoosh through the
 * air; Adidas's stamps twice and its three stripes light up in turn.
 */
function shoeTimeline(kind: ShoeCelebration, timing: Timing, { target, trackPx, unitPx }: Options): Timeline {
  const { arrive, end } = timing;
  // A whole number of steps, so the last one lands on the result.
  const steps = Math.max(1, Math.round((target * trackPx) / (34 * unitPx)));

  return {
    arrive,
    end,
    sample(t) {
      if (t < arrive) {
        const pos = target * travel(t / arrive, 0.15, 0.25);
        const ph = Math.PI * steps * (target > 0 ? pos / target : 1);
        // Toe up as it lifts, heel up as it pushes off.
        return {
          pos,
          shoe: { ...SHOE_REST, hop: 7 * Math.abs(Math.sin(ph)), tilt: 9 * Math.sin(2 * ph) },
          streak: null,
          done: false,
        };
      }
      const s = t - arrive;
      if (kind === "swoosh") {
        const LEAP = 520;
        const u = clamp01(s / LEAP);
        const airborne = s < LEAP;
        const land = s >= LEAP ? 1 - easeOutCubic(clamp01((s - LEAP) / 220)) : 0;
        return {
          pos: target,
          shoe: {
            hop: airborne ? 34 * 4 * u * (1 - u) : 0,
            tilt: airborne ? 18 * Math.sin(Math.PI * u) : 0,
            squash: 1 - 0.12 * land,
            trail: clamp01((s - 60) / (end - arrive - 60)),
            pulse: null,
          },
          streak: null,
          done: t >= end,
        };
      }
      // Two stamps, then the stripes light up.
      const STAMP = 200;
      const stamp = s < 2 * STAMP ? Math.sin((Math.PI * (s % STAMP)) / STAMP) : 0;
      const pulse = s >= 2 * STAMP ? clamp01((s - 2 * STAMP) / (end - arrive - 2 * STAMP)) : null;
      return {
        pos: target,
        shoe: { hop: 9 * stamp, tilt: -6 * stamp, squash: s < 2 * STAMP && stamp < 0.15 ? 0.94 : 1, trail: null, pulse },
        streak: null,
        done: t >= end,
      };
    },
  };
}

/* ------------------------------------------------------------------------- */

/** Where a runner comes to rest; also what returning voters see. */
export function restState(runner: Runner): RunnerState {
  switch (runner.kind) {
    case "figure": {
      if (runner.celebration === "siu") return { pose: grounded(SIU_POSE), effects: effects() };
      if (runner.celebration === "knee-slide") return { pose: grounded(SKY_POSE), effects: effects() };
      const spec = FIGURES[runner.celebration];
      return { pose: spec.final, effects: effects({ prop: spec.finalProp ?? null }) };
    }
    case "car":
      return { car: CAR_REST };
    case "phone":
      return { phone: runner.celebration === "unfold" ? { ...PHONE_REST, unfold: 1 } : PHONE_REST };
    case "shoe":
      return { shoe: SHOE_REST };
  }
}

export function createTimeline(runner: Runner, options: Options): Timeline {
  const timing = runnerTiming(runner);
  switch (runner.kind) {
    case "figure":
      if (runner.celebration === "siu") return siuTimeline(timing, options);
      if (runner.celebration === "knee-slide") return kneeSlideTimeline(timing, options);
      return figureTimeline(FIGURES[runner.celebration], timing, options);
    case "car":
      return carTimeline(runner.celebration, timing, options);
    case "phone":
      return phoneTimeline(runner.celebration, timing, options);
    case "shoe":
      return shoeTimeline(runner.celebration, timing, options);
  }
}

/* ------------------------------------------------------------------------- */

/**
 * Ronaldo: run to the result, plant, jump and turn his back to the camera
 * in the air, then land the Siu: feet wide, arms thrust down and out.
 */
function siuTimeline({ arrive, end }: Timing, { target, trackPx, unitPx }: Options): Timeline {
  const stride = new Stride(trackPx, 92 * unitPx);
  let arrivalPose: Pose = STANDING;

  const position = (t: number) => target * runEase(t / arrive);
  const frame = (pose: Pose, dust: number | null = null, done = false): Frame => ({
    pos: target,
    pose,
    effects: effects({ dust }),
    streak: null,
    done,
  });

  return {
    arrive,
    end,
    sample(t) {
      if (t < arrive) {
        const pos = position(t);
        const { phase, amount } = stride.advance(t, pos);
        arrivalPose = runPose(phase, amount);
        return { ...frame(arrivalPose), pos };
      }

      const s = t - arrive;
      const GATHER = 130;
      const JUMP = 360;
      const AIR = 24;

      // 1. Last step planted: knees load, arms swing back.
      if (s < GATHER) return frame(grounded(mixPose(arrivalPose, SIU_GATHER, easeOutCubic(s / GATHER))));

      // 2. Spring up with the arms, turn away from the camera at the top,
      //    and open the legs to land wide.
      if (s < GATHER + JUMP) {
        const u = (s - GATHER) / JUMP;
        const rising = u < 0.45;
        const body = rising
          ? mixPose(SIU_GATHER, SIU_AIR, easeOutCubic(u / 0.45))
          : mixPose(SIU_AIR, { ...SIU_POSE, shoulderN: SIU_AIR.shoulderN, shoulderF: SIU_AIR.shoulderF }, easeInOutCubic((u - 0.45) / 0.55));
        const turn = easeInOutCubic(clamp01((u - 0.1) / 0.5));
        const lift = AIR * 4 * u * (1 - u);
        const pose = grounded({ ...body, turn });
        return frame({ ...pose, y: pose.y - lift });
      }

      // 3. Land: knees give, then the arms are thrust down and out, a touch
      //    past their final angle before they settle.
      const l = s - GATHER - JUMP;
      const impact = 1 - easeOutCubic(clamp01(l / 170));
      const thrust = easeOutBack(clamp01(l / 240), 1.7);
      const pose = grounded({
        ...SIU_POSE,
        shoulderN: SIU_AIR.shoulderN + (SIU_POSE.shoulderN - SIU_AIR.shoulderN) * thrust,
        shoulderF: SIU_AIR.shoulderF + (SIU_POSE.shoulderF - SIU_AIR.shoulderF) * thrust,
        kneeN: SIU_POSE.kneeN + 22 * impact,
        kneeF: SIU_POSE.kneeF - 22 * impact,
      });
      return frame({ ...pose, squash: 1 - 0.08 * impact }, l < 440 ? l / 440 : null, t >= end);
    },
  };
}

/**
 * Messi: run, drop onto the knees and slide to the result, then rise up on
 * the knees with both index fingers pointing to the sky.
 */
function kneeSlideTimeline({ arrive, end }: Timing, { target, trackPx, unitPx }: Options): Timeline {
  const RUN = 800;
  const SLIDE = arrive - RUN;
  const ACCEL = 0.35; // share of the run spent accelerating
  const K = 2.4; // slide deceleration exponent
  const RISE = 480;

  // Pick the run speed so the slide starts at the speed the run ends at.
  const v = target / (RUN * (1 - ACCEL / 2) + SLIDE / K);
  const runEnd = v * RUN * (1 - ACCEL / 2);
  const slideLen = target - runEnd;
  const stride = new Stride(trackPx, 92 * unitPx);
  let dropPose: Pose = STANDING;

  const runPosition = (t: number) => {
    const ta = RUN * ACCEL;
    return t < ta ? (v * t * t) / (2 * ta) : v * (ta / 2 + (t - ta));
  };

  return {
    arrive,
    end,
    sample(t) {
      if (t < RUN) {
        const pos = runPosition(t);
        const { phase, amount } = stride.advance(t, pos);
        dropPose = runPose(phase, amount);
        return { pos, pose: dropPose, effects: effects(), streak: null, done: false };
      }

      if (t < arrive) {
        const w = (t - RUN) / SLIDE;
        const pos = runEnd + slideLen * (1 - Math.pow(1 - w, K));
        // Drop onto the knees and lean back into the slide as the arms open.
        const drop = easeOutCubic(clamp01(w / 0.32));
        return {
          pos,
          pose: grounded(mixPose(dropPose, SLIDE_POSE, drop)),
          effects: effects(),
          streak: { from: runEnd, to: pos, alpha: 0.55 },
          done: false,
        };
      }

      // Stopped: sit up and raise both arms, fingers to the sky, with a
      // little give in the body as the momentum dies away.
      const h = t - arrive;
      const up = easeOutBack(clamp01(h / RISE), 1.3);
      const body = easeOutCubic(clamp01(h / RISE));
      const rock = Math.exp(-h / 180) * Math.sin(h / 75);
      const pose = grounded({
        ...mixPose(SLIDE_POSE, SKY_POSE, body),
        shoulderN: SLIDE_POSE.shoulderN + (SKY_POSE.shoulderN - SLIDE_POSE.shoulderN) * up,
        shoulderF: SLIDE_POSE.shoulderF + (SKY_POSE.shoulderF - SLIDE_POSE.shoulderF) * up,
        lean: SLIDE_POSE.lean + (SKY_POSE.lean - SLIDE_POSE.lean) * body + 5 * rock,
        pointN: clamp01((h - RISE * 0.45) / (RISE * 0.4)),
        pointF: clamp01((h - RISE * 0.45) / (RISE * 0.4)),
      });
      const fade = clamp01(1 - h / 380);
      return {
        pos: target,
        pose,
        effects: effects(),
        streak: fade > 0 ? { from: runEnd, to: target, alpha: 0.55 * fade } : null,
        done: t >= end,
      };
    },
  };
}
