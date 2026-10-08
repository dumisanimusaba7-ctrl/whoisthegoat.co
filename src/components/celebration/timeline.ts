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

export type CelebrationKind = "siu" | "knee-slide";

/** When the runner reaches the result, and when the whole moment is over (ms). */
export const CELEBRATION_TIMING: Record<CelebrationKind, { arrive: number; end: number }> = {
  siu: { arrive: 1000, end: 1950 },
  "knee-slide": { arrive: 1250, end: 2000 },
};

/** Fill time for the bar of the option that wasn't chosen. */
export const OTHER_BAR_MS = 1000;

/** Where each celebration comes to rest; also shown to returning voters. */
export const FINAL_POSE: Record<CelebrationKind, Pose> = {
  siu: grounded(SIU_POSE),
  "knee-slide": grounded(SKY_POSE),
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

/**
 * Ronaldo: run to the result, plant, jump and turn his back to the camera
 * in the air, then land the Siu: feet wide, arms thrust down and out.
 */
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
      const GATHER = 130;
      const JUMP = 360;
      const AIR = 24;

      // 1. Last step planted: knees load, arms swing back.
      if (s < GATHER) {
        const u = easeOutCubic(s / GATHER);
        return { pos: target, pose: grounded(mixPose(arrivalPose, SIU_GATHER, u)), dust: null, streak: null, done: false };
      }

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
        return { pos: target, pose: { ...pose, y: pose.y - lift }, dust: null, streak: null, done: false };
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
      return {
        pos: target,
        pose: { ...pose, squash: 1 - 0.08 * impact },
        dust: l < 440 ? l / 440 : null,
        streak: null,
        done: t >= end,
      };
    },
  };
}

/**
 * Messi: run, drop onto the knees and slide to the result, then rise up on
 * the knees with both index fingers pointing to the sky.
 */
function kneeSlideTimeline({ target, trackPx, figurePx }: Options): Timeline {
  const { arrive, end } = CELEBRATION_TIMING["knee-slide"];
  const RUN = 800;
  const SLIDE = arrive - RUN;
  const ACCEL = 0.35; // share of the run spent accelerating
  const K = 2.4; // slide deceleration exponent
  const RISE = 480;

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
        // Drop onto the knees and lean back into the slide as the arms open.
        const drop = easeOutCubic(clamp01(w / 0.32));
        return {
          pos,
          pose: grounded(mixPose(dropPose, SLIDE_POSE, drop)),
          dust: null,
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
        point: clamp01((h - RISE * 0.45) / (RISE * 0.4)),
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
