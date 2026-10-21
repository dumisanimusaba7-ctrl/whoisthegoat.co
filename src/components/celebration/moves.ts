/**
 * Named poses for the celebrations, built on the standing pose. Side view
 * unless `turn: 1` (back to the camera). See pose.ts for the conventions.
 */

import { runPose, STANDING, type Pose } from "./pose";

const pose = (overrides: Partial<Pose>): Pose => ({ ...STANDING, ...overrides });

/** Feet planted after a run. */
export const PLANT = pose({ lean: 6, hipN: 10, kneeN: 14, hipF: -8, kneeF: 10, shoulderN: 12, elbowN: 24, shoulderF: -8, elbowF: 24 });

/** Mbappé: arms folded across the chest, chin up. */
export const ARMS_CROSSED = pose({ lean: -5, head: -10, hipN: 7, kneeN: 4, hipF: -7, kneeF: 4, shoulderN: 6, elbowN: 122, shoulderF: 2, elbowF: 128 });

/** Yamal: both hands up in front of the chest, fingers spelling out his postcode. */
export const FINGERS_304 = pose({ lean: -2, head: -8, hipN: 6, kneeN: 4, hipF: -6, kneeF: 4, shoulderN: 58, elbowN: 104, shoulderF: 48, elbowF: 112, pointN: 1, pointF: 1 });

/** Neymar, from behind: hands cupped to the ears. */
export const HANDS_EARS = pose({ turn: 1, lean: 0, hipN: 10, kneeN: 4, hipF: -10, kneeF: -4, shoulderN: 132, elbowN: 116, shoulderF: -132, elbowF: -116 });

/** Ronaldinho, from behind: loose and low for the samba. */
export const SAMBA = pose({ turn: 1, lean: 0, hipN: 12, kneeN: 14, hipF: -12, kneeF: -14, shoulderN: 26, elbowN: 64, shoulderF: -26, elbowF: -64 });

/** From behind, both index fingers to the sky. */
export const POINT_UP = pose({ turn: 1, lean: 0, hipN: 9, kneeN: 4, hipF: -9, kneeF: -4, shoulderN: 158, elbowN: 6, shoulderF: -158, elbowF: -6, pointN: 1, pointF: 1 });

/** Boxing guard: knees soft, gloves up by the chin. */
export const GUARD = pose({ lean: 10, head: 6, hipN: 14, kneeN: 22, hipF: -12, kneeF: 18, shoulderN: 34, elbowN: 132, shoulderF: 26, elbowF: 136 });

/** Ali standing over a fallen opponent: leaning in, fist cocked, shouting. */
export const STAND_OVER = pose({ lean: 22, head: 14, hipN: 20, kneeN: 18, hipF: -16, kneeF: 8, shoulderN: 26, elbowN: 124, shoulderF: -14, elbowF: 24 });

/** Ali's hands held low, the way he fought, for the shuffle. */
export const ALI_GUARD = pose({ lean: 4, head: 0, hipN: 6, kneeN: 14, hipF: -6, kneeF: 14, shoulderN: 14, elbowN: 72, shoulderF: 6, elbowF: 80 });

export const UPPERCUT = pose({ lean: -6, head: -8, hipN: 12, kneeN: 10, hipF: -10, kneeF: 8, shoulderN: 150, elbowN: 40, shoulderF: 30, elbowF: 130 });

export const GLOVES_UP = pose({ lean: -4, head: -12, hipN: 10, kneeN: 6, hipF: -10, kneeF: 6, shoulderN: 166, elbowN: 18, shoulderF: 150, elbowF: 26 });

/** LeBron: crouched, hands together at the waist, before the chalk goes up. */
export const CHALK_GATHER = pose({ lean: 20, head: 4, hipN: 16, kneeN: 32, hipF: -10, kneeF: 28, shoulderN: 30, elbowN: 70, shoulderF: 26, elbowF: 74 });

export const CHALK_TOSS = pose({ lean: -12, head: -22, hipN: 6, kneeN: 4, hipF: -6, kneeF: 4, ankleN: 14, ankleF: 14, shoulderN: 172, elbowN: 6, shoulderF: 148, elbowF: 10 });

export const JUMP_GATHER = pose({ lean: 22, hipN: 32, kneeN: 64, hipF: -12, kneeF: 42, shoulderN: -40, elbowN: 30, shoulderF: -30, elbowF: 30, hold: 1 });

/** Jordan's leap: ball held high, front knee up, back leg trailing. */
export const JUMPMAN = pose({ lean: 0, head: -6, hipN: 64, kneeN: 58, hipF: -40, kneeF: 26, ankleN: 20, ankleF: 30, shoulderN: 172, elbowN: 4, shoulderF: -46, elbowF: 10, hold: 1 });

export const TOUCHDOWN = pose({ lean: 16, hipN: 30, kneeN: 50, hipF: -6, kneeF: 44, shoulderN: 40, elbowN: 40, shoulderF: -10, elbowF: 30 });

/** Jordan's shrug, from behind: elbows in, forearms out, palms up. */
export const SHRUG = pose({ turn: 1, hipN: 9, kneeN: 4, hipF: -9, kneeF: -4, shoulderN: 24, elbowN: 66, shoulderF: -24, elbowF: -66 });

/** McGregor's strut, from behind: chest out, arms swinging wide. */
export const STRUT_BACK = pose({ turn: 1, hipN: 14, kneeN: 8, hipF: -10, kneeF: -6, shoulderN: 58, elbowN: 28, shoulderF: -58, elbowF: -28 });

/** Khabib's level change: a deep lunge at the legs. */
export const SHOT = pose({ lean: 48, head: 10, hipN: 70, kneeN: 92, hipF: -40, kneeF: 40, ankleF: 30, shoulderN: 70, elbowN: 30, shoulderF: 60, elbowF: 34 });

/** One finger to the sky. */
export const SKY_FINGER = pose({ lean: -2, head: -18, hipN: 6, kneeN: 4, hipF: -6, kneeF: 4, shoulderN: 172, elbowN: 4, pointN: 1, shoulderF: 4, elbowF: 14 });

/** Drake's Hotline Bling: a two-step with the forearm swinging, at beat `b` (−1…1). */
export function hotline(b: number): Pose {
  return pose({
    lean: 4 + 5 * b,
    head: 4 * b,
    hipN: 10 + 6 * b,
    kneeN: 16 + 10 * Math.abs(b),
    hipF: -8 - 6 * b,
    kneeF: 14 + 10 * Math.abs(b),
    shoulderN: 40 + 30 * b,
    elbowN: 96,
    shoulderF: 18 - 12 * b,
    elbowF: 112,
  });
}

/** Kendrick, mic held out at arm’s length. */
export const MIC_OUT = pose({ lean: -2, head: -6, hipN: 7, kneeN: 4, hipF: -7, kneeF: 4, shoulderN: 100, elbowN: 12, shoulderF: 4, elbowF: 14, hold: 1 });

export const MIC_DROPPED = pose({ lean: 0, head: 8, hipN: 7, kneeN: 4, hipF: -7, kneeF: 4, shoulderN: 84, elbowN: 8, shoulderF: 4, elbowF: 14, hold: 0 });

/** Flying: body level, near fist forward, cape streaming. */
export const FLYING = pose({ y: -26, lean: 82, head: -42, hipN: -78, kneeN: 4, hipF: -84, kneeF: 10, ankleN: 70, ankleF: 74, shoulderN: 176, elbowN: 2, shoulderF: -6, elbowF: 6, cape: 1 });

/** Armoured flight: arms back along the body, palms behind like thrusters. */
export const THRUSTING = pose({ y: -26, lean: 74, head: -36, hipN: -70, kneeN: 6, hipF: -76, kneeF: 12, ankleN: 70, ankleF: 74, shoulderN: -24, elbowN: 8, shoulderF: -34, elbowF: 10 });

/** From behind, hands on hips, cape settling. */
export const HANDS_ON_HIPS = pose({ turn: 1, hipN: 12, kneeN: 4, hipF: -12, kneeF: -4, shoulderN: 38, elbowN: -98, shoulderF: -38, elbowF: 98, cape: 0 });

/** The superhero landing: one knee down, one fist on the ground, head bowed. */
export const HERO_LANDING = pose({ lean: 44, head: 26, hipN: 72, kneeN: 96, hipF: -12, kneeF: 104, ankleF: 150, shoulderN: 32, elbowN: 4, shoulderF: -64, elbowF: 10 });

/** Hanging from a web line: knees tucked, far arm out for balance. */
export const SWINGING = pose({ lean: 0, head: -10, hipN: 58, kneeN: 82, hipF: 34, kneeF: 96, ankleN: 30, ankleF: 30, shoulderN: 170, elbowN: 0, shoulderF: -50, elbowF: 30 });

/** Spider-Man's landing: a deep squat, one hand down between the feet, the other back. */
export const SPIDER_CROUCH = pose({ lean: 38, head: -18, hipN: 84, kneeN: 128, hipF: 62, kneeF: 132, ankleN: -14, ankleF: -10, shoulderN: 36, elbowN: 4, shoulderF: -70, elbowF: 24 });

/** A swaggering walk: short steps, chest out, arms swinging wide. */
export function strutPose(phase: number, amount: number): Pose {
  const base = runPose(phase, Math.min(amount, 0.32));
  const s = Math.sin(phase);
  return { ...base, lean: -4, head: -6, shoulderN: 12 - 62 * s, elbowN: 34, shoulderF: 12 + 62 * s, elbowF: 34 };
}

/** Light boxer’s footwork with the guard up. */
export function boxerStep(phase: number): Pose {
  const s = Math.sin(phase);
  return { ...GUARD, hipN: GUARD.hipN + 9 * s, hipF: GUARD.hipF - 9 * s, kneeN: GUARD.kneeN + 4 * Math.abs(s), kneeF: GUARD.kneeF + 4 * Math.abs(s) };
}
