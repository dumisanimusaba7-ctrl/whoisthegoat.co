/**
 * Pose maths for the vote celebration figures.
 *
 * Figures are drawn in "figure units": the ground is y = 0, a standing figure
 * is ~92 units tall (about seven heads), and x grows in the direction the
 * figure runs. Angles are degrees. In side view, limbs hang straight down at
 * 0 and positive swings forward; in back view the same angles swing a limb
 * out to the side (near limbs to screen-right). Everything here is pure, so
 * the same maths drives the live animation and the static end-state figure.
 */

export const SKELETON = {
  hipHeight: 49,
  thigh: 23,
  shin: 23,
  ankle: 3,
  torso: 27,
  neck: 3,
  /** Head half-width and half-height. */
  headRx: 5.5,
  headRy: 6.5,
  shoulderDrop: 4,
  upperArm: 14,
  forearm: 12.5,
} as const;

export type Pose = {
  /** Root (pelvis) offset in figure units; y grows downwards. */
  x: number;
  y: number;
  /** Torso lean, forward positive (side view only). */
  lean: number;
  /** Head pitch: positive tucks the chin, negative looks up. */
  head: number;
  /** Near leg (towards the viewer, or screen-right from behind) and far leg. */
  hipN: number;
  kneeN: number;
  hipF: number;
  kneeF: number;
  /** Shin length factor; < 1 foreshortens shins that point at the camera. */
  shinN: number;
  shinF: number;
  /** Boot pitch relative to the ground: positive points the toe down. */
  ankleN: number;
  ankleF: number;
  shoulderN: number;
  elbowN: number;
  shoulderF: number;
  elbowF: number;
  /** 0 = side view facing the run, 1 = back to the camera. */
  turn: number;
  /** Vertical squash at the feet, for landing impact. */
  squash: number;
  /** Index fingers extended, 0–1. */
  point: number;
};

export const STANDING: Pose = {
  x: 0,
  y: 0,
  lean: 2,
  head: 0,
  hipN: 3,
  kneeN: 5,
  hipF: -3,
  kneeF: 5,
  shinN: 1,
  shinF: 1,
  ankleN: 0,
  ankleF: 0,
  shoulderN: 6,
  elbowN: 12,
  shoulderF: -4,
  elbowF: 12,
  turn: 0,
  squash: 1,
  point: 0,
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
export const easeInCubic = (t: number) => t * t * t;
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOutBack = (t: number, s = 1.2) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);

/** Hip and shoulder offsets from the spine: spread in back view, stacked in side view. */
export function jointOffsets(back: boolean) {
  return back ? { hip: 5, shoulder: 9.5 } : { hip: 1, shoulder: 1.5 };
}

/** Boot outline relative to the ankle, before pitch: [x, y] corners. */
export const BOOT = {
  side: [
    [-3.4, -0.4],
    [7.4, -0.4],
    [7.4, 4.2],
    [-3.4, 4.2],
  ],
  back: [
    [-3, -0.4],
    [3, -0.4],
    [3, 4.2],
    [-3, 4.2],
  ],
} as const;

/**
 * Lowest point of the figure (boots or knees), in figure units; the ground
 * is 0, so a negative value means the figure is in the air.
 */
export function lowestPoint(pose: Pose): number {
  const hipY = -SKELETON.hipHeight + pose.y;
  const boot = pose.turn >= 0.5 ? BOOT.back : BOOT.side;
  let lowest = -Infinity;
  for (const [hipAngle, knee, shinScale, pitch] of [
    [pose.hipN, pose.kneeN, pose.shinN, pose.ankleN],
    [pose.hipF, pose.kneeF, pose.shinF, pose.ankleF],
  ] as const) {
    const kneeY = hipY + Math.cos(rad(hipAngle)) * SKELETON.thigh;
    const ankleY = kneeY + Math.cos(rad(hipAngle - knee)) * SKELETON.shin * shinScale;
    // Kneecap, then each corner of the boot at its pitch.
    lowest = Math.max(lowest, kneeY + 3.6);
    if (shinScale >= 0.5) {
      for (const [bx, by] of boot) {
        lowest = Math.max(lowest, ankleY + bx * Math.sin(rad(pitch)) + by * Math.cos(rad(pitch)));
      }
    }
  }
  return lowest;
}

/** Moves the pose vertically so its lowest point rests on the ground. */
export function grounded(pose: Pose): Pose {
  return { ...pose, y: pose.y - lowestPoint(pose) };
}

/**
 * Sprinting pose for cycle phase `phase` (radians; the near leg strikes the
 * ground at π/2) at `amount` (0 = standing, 1 = full sprint).
 *
 * Modelled on sprint mechanics: a high knee drive in front, a full hip
 * extension behind, the heel folding up under the hips through the swing,
 * a heel-first strike and a toe-down push-off, with the arms driving from
 * the shoulder, elbows near 90°, opposite to the legs.
 */
export function runPose(phase: number, amount: number): Pose {
  const a = clamp01(amount);
  const leg = (p: number) => {
    const s = Math.sin(p);
    const c = Math.cos(p);
    const hip = 16 + 42 * a * s;
    // Folds hardest just after toe-off as the thigh swings through; a
    // little give in mid-stance to absorb the landing.
    const knee = 10 + a * (104 * Math.pow(Math.max(0, Math.cos(p + 0.35)), 1.4) + 18 * Math.pow(Math.max(0, -c), 2));
    // The boot trails the shin in the swing, lands heel first, pushes off toes down.
    const pitch = 0.38 * (knee - hip) + a * 16 * Math.pow(Math.max(0, -s), 3);
    return { hip, knee, pitch };
  };
  const near = leg(phase);
  const far = leg(phase + Math.PI);
  const arm = (p: number) => {
    const s = Math.sin(p);
    // Opposite to the leg on the same side; the elbow closes as the hand comes forward.
    return { shoulder: 8 - 52 * a * s, elbow: 62 + 26 * a + 18 * a * Math.max(0, -s) };
  };
  const armN = arm(phase);
  const armF = arm(phase + Math.PI);
  const lean = 6 + 11 * a + 2 * a * Math.cos(2 * phase);
  const pose: Pose = {
    ...STANDING,
    lean,
    // The head stays level while the body leans.
    head: -0.55 * lean,
    hipN: near.hip,
    kneeN: near.knee,
    ankleN: near.pitch,
    hipF: far.hip,
    kneeF: far.knee,
    ankleF: far.pitch,
    shoulderN: armN.shoulder,
    elbowN: armN.elbow,
    shoulderF: armF.shoulder,
    elbowF: armF.elbow,
  };
  // Keep the lowest boot on the ground, with a moment of flight around each
  // toe-off and strike at speed.
  const base = grounded(pose);
  const flight = 2.4 * a * Math.pow(Math.abs(Math.sin(phase)), 4);
  return { ...base, y: base.y - flight };
}

/**
 * Ronaldo's "Siu", from behind: feet planted well beyond shoulder width,
 * knees soft, arms driven straight down and out with the palms forward.
 */
export const SIU_POSE: Pose = {
  ...STANDING,
  lean: 0,
  head: 0,
  hipN: 23,
  kneeN: 5,
  hipF: -23,
  kneeF: -5,
  ankleN: 0,
  ankleF: 0,
  shoulderN: 33,
  elbowN: -4,
  shoulderF: -33,
  elbowF: 4,
  turn: 1,
};

/** Gathering for the jump: last step planted, knees loaded, arms back. */
export const SIU_GATHER: Pose = {
  ...STANDING,
  lean: 22,
  head: -8,
  hipN: 30,
  kneeN: 62,
  hipF: -14,
  kneeF: 46,
  ankleN: -6,
  ankleF: 22,
  shoulderN: -52,
  elbowN: 24,
  shoulderF: -40,
  elbowF: 24,
};

/** Top of the jump, turned away from the camera: legs opening, arms up and wide. */
export const SIU_AIR: Pose = {
  ...STANDING,
  lean: 0,
  head: 0,
  hipN: 17,
  kneeN: 26,
  hipF: -17,
  kneeF: -26,
  ankleN: 18,
  ankleF: 18,
  shoulderN: 128,
  elbowN: -10,
  shoulderF: -128,
  elbowF: 10,
  turn: 1,
};

/** Messi mid-slide on his knees, leaning back into it, arms flung wide. */
export const SLIDE_POSE: Pose = {
  ...STANDING,
  lean: -24,
  head: -12,
  hipN: -6,
  kneeN: 100,
  hipF: 4,
  kneeF: 104,
  ankleN: 168,
  ankleF: 170,
  shoulderN: 92,
  elbowN: 18,
  shoulderF: -112,
  elbowF: 22,
};

/** Where Messi comes to rest: upright on his knees, both index fingers to the sky. */
export const SKY_POSE: Pose = {
  ...STANDING,
  lean: -5,
  head: -24,
  hipN: -2,
  kneeN: 97,
  hipF: 3,
  kneeF: 100,
  ankleN: 168,
  ankleF: 170,
  // Raised in a V: near arm up and a little forward, far arm up and back.
  shoulderN: 154,
  elbowN: 8,
  shoulderF: 198,
  elbowF: -6,
  point: 1,
};
