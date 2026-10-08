/**
 * Pose maths for the vote celebration figures.
 *
 * Figures are drawn in "figure units": the ground is y = 0, a standing figure
 * is ~93 units tall, and x grows in the direction the figure runs. Angles are
 * degrees; for limbs, 0 hangs straight down and positive swings forward
 * (towards screen-right). Everything here is pure so the same maths drives
 * the live animation and the static end-state figure.
 */

export const SKELETON = {
  hipHeight: 49,
  thigh: 23,
  shin: 23,
  ankle: 3,
  torso: 27,
  neck: 2,
  headR: 7.6,
  shoulderDrop: 4,
  upperArm: 14,
  forearm: 13,
} as const;

export type Pose = {
  /** Root (pelvis) offset in figure units; y grows downwards. */
  x: number;
  y: number;
  /** Torso lean, forward positive. */
  lean: number;
  head: number;
  /** Near leg (screen-right in front view) and far leg. */
  hipN: number;
  kneeN: number;
  hipF: number;
  kneeF: number;
  /** Shin length factor; < 1 foreshortens shins that point at the camera. */
  shinN: number;
  shinF: number;
  shoulderN: number;
  elbowN: number;
  shoulderF: number;
  elbowF: number;
  /** 0 = side view facing right, 1 = facing the camera. */
  turn: number;
  /** Vertical squash at the feet, for landing impact. */
  squash: number;
};

export const STANDING: Pose = {
  x: 0,
  y: 0,
  lean: 0,
  head: 0,
  hipN: 2,
  kneeN: 4,
  hipF: -2,
  kneeF: 4,
  shinN: 1,
  shinF: 1,
  shoulderN: 6,
  elbowN: 10,
  shoulderF: -4,
  elbowF: 10,
  turn: 0,
  squash: 1,
};

const rad = (deg: number) => (deg * Math.PI) / 180;

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function mixPose(a: Pose, b: Pose, t: number): Pose {
  const out = { ...a };
  for (const key of Object.keys(a) as (keyof Pose)[]) out[key] = lerp(a[key], b[key], t);
  return out;
}

export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOutBack = (t: number, s = 1.2) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);

/** Front-view hip and shoulder offsets; side view stacks them on the spine. */
export function jointOffsets(front: boolean) {
  return front ? { hip: 5.5, shoulder: 9.5 } : { hip: 1, shoulder: 1.5 };
}

/**
 * Lowest point of the figure (boots or knees), in figure units; the ground
 * is 0, so a negative value means the figure is in the air.
 */
export function lowestPoint(pose: Pose): number {
  const hipY = -SKELETON.hipHeight + pose.y;
  let lowest = -Infinity;
  for (const [hipAngle, knee, shinScale] of [
    [pose.hipN, pose.kneeN, pose.shinN],
    [pose.hipF, pose.kneeF, pose.shinF],
  ] as const) {
    const kneeY = hipY + Math.cos(rad(hipAngle)) * SKELETON.thigh;
    const ankleY = kneeY + Math.cos(rad(hipAngle - knee)) * SKELETON.shin * shinScale;
    lowest = Math.max(lowest, kneeY + 4, ankleY + SKELETON.ankle + 1);
  }
  return lowest;
}

/** Moves the pose vertically so its lowest point rests on the ground. */
export function grounded(pose: Pose): Pose {
  return { ...pose, y: pose.y - lowestPoint(pose) };
}

/**
 * Running pose for cycle phase `phase` (radians) at `amount` (0 = standing,
 * 1 = full sprint). The pelvis is lowered or raised so a foot is always on
 * the ground.
 */
export function runPose(phase: number, amount: number): Pose {
  const a = clamp01(amount);
  const sN = Math.sin(phase);
  const cN = Math.cos(phase);
  const sF = Math.sin(phase + Math.PI);
  const cF = Math.cos(phase + Math.PI);
  // Knee folds hard while the leg swings through, stays long while pushing.
  const knee = (c: number) => 14 + a * (96 * Math.pow(Math.max(0, c), 1.3) + 10 * Math.max(0, -c));
  const pose: Pose = {
    ...STANDING,
    lean: 6 + 10 * a,
    head: -4 * a,
    hipN: 5 + 40 * a * sN,
    kneeN: knee(cN),
    hipF: 5 + 40 * a * sF,
    kneeF: knee(cF),
    shoulderN: 4 - 44 * a * sN,
    elbowN: 40 + 50 * a,
    shoulderF: 4 - 44 * a * sF,
    elbowF: 40 + 50 * a,
  };
  // Keep the lowest boot on the ground, with a little lift at full stride.
  const flight = 2.2 * a * Math.abs(Math.sin(phase));
  return { ...grounded(pose), y: grounded(pose).y - flight };
}

/** Ronaldo's "Siu": feet wide, facing the camera, arms driven down and out. */
export const SIU_POSE: Pose = {
  ...STANDING,
  lean: -6,
  head: -10,
  hipN: 29,
  kneeN: 15,
  hipF: -29,
  kneeF: -15,
  shoulderN: 34,
  elbowN: -8,
  shoulderF: -34,
  elbowF: 8,
  turn: 1,
};

/** Messi on his knees after the slide: side-on, arms flung wide, head back. */
export const KNEEL_POSE: Pose = {
  ...STANDING,
  lean: -12,
  head: -16,
  hipN: -4,
  kneeN: 96,
  hipF: 0,
  kneeF: 100,
  shoulderN: 138,
  elbowN: -10,
  shoulderF: -148,
  elbowF: 12,
  turn: 0,
};

/** Mid-slide, leaning back against the momentum as the arms come up. */
export const SLIDE_POSE: Pose = {
  ...STANDING,
  lean: -22,
  head: -10,
  hipN: -8,
  kneeN: 98,
  hipF: -2,
  kneeF: 102,
  shoulderN: 100,
  elbowN: 20,
  shoulderF: -110,
  elbowF: 20,
  turn: 0,
};
