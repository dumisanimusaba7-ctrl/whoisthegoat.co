/**
 * Celebration timelines. A timeline turns elapsed time into everything drawn
 * for one frame: where the runner is on the bar, how full the bar is, the
 * figure's pose and any effects. Bar fill and runner share one position, so
 * the player always stands exactly at the end of their result.
 */

import {
  clamp01,
  easeInOutCubic,
  easeOutBack,
  easeOutCubic,
  grounded,
  KNEEL_POSE,
  mixPose,
  runPose,
  SIU_POSE,
  SLIDE_POSE,
  STANDING,
  type Pose,
} from "./pose";

export type CelebrationKind = "siu" | "knee-slide";

/** When the runner reaches the result, and when the whole moment is over (ms). */
export const CELEBRATION_TIMING: Record<CelebrationKind, { arrive: number; end: number }> = {
  siu: { arrive: 1000, end: 1900 },
  "knee-slide": { arrive: 1250, end: 1800 },
};

/** Fill time for the bar of the option that wasn't chosen. */
export const OTHER_BAR_MS = 1000;

/** Where each celebration comes to rest; also shown to returning voters. */
export const FINAL_POSE: Record<CelebrationKind, Pose> = {
  siu: grounded(SIU_POSE),
  "knee-slide": grounded(KNEEL_POSE),
};

export type Frame = {
  /** Runner and bar-end position as a fraction of the track. */
  pos: number;
  pose: Pose;
  /** Landing debris progress, or null. */
  dust: number | null;
  /** Skid highlight on the bar behind a slide, as track fractions. */
  streak: { from: number; to: number; alpha: number } | null;
  done: boolean;
};

type Options = {
  /** Final result as a fraction of the track (0–1). */
  target: number;
  trackPx: number;
  figurePx: number;
};

/**
 * Run-in easing: from a standing start, peak speed at ~40% of the run, then
 * a longer, controlled deceleration into the plant.
 */
function runEase(u: number): number {
  return 0.5 - 0.5 * Math.cos(Math.PI * Math.pow(clamp01(u), 0.8));
}

/**
 * Integrates the stride so leg speed follows ground speed: legs slow down as
 * the runner does, and feet don't skate.
 */
class Stride {
  private phase = 0;
  private lastT = 0;
  private lastPos = 0;

  constructor(private readonly trackPx: number, private readonly figurePx: number) {}

  advance(t: number, pos: number): { phase: number; amount: number } {
    const dt = Math.max(1, t - this.lastT);
    const speedPxPerS = (Math.abs(pos - this.lastPos) * this.trackPx * 1000) / dt;
    // One full cycle (two steps) covers ~1.7 body heights at a sprint.
    const cadence = Math.min(2.6, speedPxPerS / (this.figurePx * 1.7));
    this.phase += 2 * Math.PI * cadence * (dt / 1000);
    this.lastT = t;
    this.lastPos = pos;
    return { phase: this.phase, amount: clamp01(speedPxPerS / (this.figurePx * 4.5)) };
  }
}

export type Timeline = { sample: (t: number) => Frame; arrive: number; end: number };

export function createTimeline(kind: CelebrationKind, options: Options): Timeline {
  return kind === "siu" ? siuTimeline(options) : kneeSlideTimeline(options);
}

/* ------------------------------------------------------------------------- */

const CROUCH: Pose = {
  ...STANDING,
  lean: 20,
  head: 4,
  hipN: 24,
  kneeN: 52,
  hipF: -8,
  kneeF: 48,
  shoulderN: -46,
  elbowN: 30,
  shoulderF: -34,
  elbowF: 30,
};

const TUCK: Pose = {
  ...STANDING,
  lean: 4,
  head: -4,
  hipN: 30,
  kneeN: 62,
  hipF: 12,
  kneeF: 56,
  shoulderN: 70,
  elbowN: 10,
  shoulderF: -60,
  elbowF: 10,
  turn: 0.5,
};

/** Ronaldo: run to the result, jump and turn to camera, land the Siu. */
function siuTimeline({ target, trackPx, figurePx }: Options): Timeline {
  const { arrive, end } = CELEBRATION_TIMING.siu;
  const stride = new Stride(trackPx, figurePx);
  let arrivalPose: Pose = STANDING;

  const position = (t: number) => target * runEase(t / arrive);

  return {
    arrive,
    end,
    sample(t) {
      if (t < arrive) {
        const pos = position(t);
        const { phase, amount } = stride.advance(t, pos);
        arrivalPose = runPose(phase, amount);
        return { pos, pose: arrivalPose, dust: null, streak: null, done: false };
      }

      const s = t - arrive;
      const PLANT = 110;
      const JUMP = 300;
      const AIR = 22;

      // 1. Plant and load up.
      if (s < PLANT) {
        const u = easeOutCubic(s / PLANT);
        return { pos: target, pose: grounded(mixPose(arrivalPose, CROUCH, u)), dust: null, streak: null, done: false };
      }

      // 2. Jump and turn to face the camera.
      if (s < PLANT + JUMP) {
        const u = (s - PLANT) / JUMP;
        const body = u < 0.5 ? mixPose(CROUCH, TUCK, easeOutCubic(u * 2)) : mixPose(TUCK, SIU_POSE, easeInOutCubic((u - 0.5) * 2));
        const turn = clamp01((u - 0.2) / 0.55);
        const lift = AIR * 4 * u * (1 - u);
        const pose = grounded({ ...body, turn });
        return { pos: target, pose: { ...pose, y: pose.y - lift }, dust: null, streak: null, done: false };
      }

      // 3. Land: a short compression, arms snapping down and out.
      const l = s - PLANT - JUMP;
      const impact = 1 - easeOutCubic(clamp01(l / 180));
      const arms = easeOutBack(clamp01(l / 260), 1.6);
      const pose = grounded({
        ...SIU_POSE,
        shoulderN: 60 + (SIU_POSE.shoulderN - 60) * arms,
        shoulderF: -60 + (SIU_POSE.shoulderF + 60) * arms,
        kneeN: SIU_POSE.kneeN + 14 * impact,
        kneeF: SIU_POSE.kneeF - 14 * impact,
      });
      return {
        pos: target,
        pose: { ...pose, squash: 1 - 0.09 * impact },
        dust: l < 420 ? l / 420 : null,
        streak: null,
        done: t >= end,
      };
    },
  };
}

/** Messi: run, drop to the knees, slide to the result, arms up. */
function kneeSlideTimeline({ target, trackPx, figurePx }: Options): Timeline {
  const { arrive, end } = CELEBRATION_TIMING["knee-slide"];
  const RUN = 800;
  const SLIDE = arrive - RUN;
  const ACCEL = 0.35; // share of the run spent accelerating
  const K = 2.4; // slide deceleration exponent

  // Pick the run speed so the slide starts at the speed the run ends at.
  const v = target / (RUN * (1 - ACCEL / 2) + SLIDE / K);
  const runEnd = v * RUN * (1 - ACCEL / 2);
  const slideLen = target - runEnd;
  const stride = new Stride(trackPx, figurePx);
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
        return { pos, pose: dropPose, dust: null, streak: null, done: false };
      }

      if (t < arrive) {
        const w = (t - RUN) / SLIDE;
        const pos = runEnd + slideLen * (1 - Math.pow(1 - w, K));
        // Drop onto the knees, lean back into the slide, arms opening as it slows.
        const drop = easeOutCubic(clamp01(w / 0.3));
        const open = easeInOutCubic(clamp01((w - 0.35) / 0.65));
        const base = mixPose(mixPose(dropPose, SLIDE_POSE, drop), KNEEL_POSE, open);
        return {
          pos,
          pose: grounded(base),
          dust: null,
          streak: { from: runEnd, to: pos, alpha: 0.55 },
          done: false,
        };
      }

      // Stopped: the upper body carries on for a moment, then settles.
      const h = t - arrive;
      const rock = Math.exp(-h / 150) * Math.sin(h / 70);
      const pose = grounded({
        ...KNEEL_POSE,
        lean: KNEEL_POSE.lean + 9 * rock,
        head: KNEEL_POSE.head + 5 * rock,
        shoulderN: KNEEL_POSE.shoulderN - 10 * rock,
        shoulderF: KNEEL_POSE.shoulderF + 10 * rock,
      });
      const fade = clamp01(1 - h / 380);
      return {
        pos: target,
        pose,
        dust: null,
        streak: fade > 0 ? { from: runEnd, to: target, alpha: 0.55 * fade } : null,
        done: t >= end,
      };
    },
  };
}
