import type { StaticImageData } from "next/image";

import pogba from "@/assets/play/silhouettes/pogba-dab.png";
import dybala from "@/assets/play/silhouettes/dybala-mask.png";
import ronaldoCalma from "@/assets/play/silhouettes/ronaldo-calma.png";
import vardy from "@/assets/play/silhouettes/vardy-slide.png";
import saka from "@/assets/play/silhouettes/saka-flag.png";
import belling from "@/assets/play/silhouettes/bellingham-wide.png";
import griezmann from "@/assets/play/silhouettes/griezmann-l.png";
import haaland from "@/assets/play/silhouettes/haaland-zen.png";
import lewandowski from "@/assets/play/silhouettes/lewandowski-cross.png";
import mbappeArms from "@/assets/play/silhouettes/mbappe-arms.png";
import mbappeSalute from "@/assets/play/silhouettes/mbappe-salute.png";
import messiEars from "@/assets/play/silhouettes/messi-ears.png";
import messiShirt from "@/assets/play/silhouettes/messi-shirt.png";
import neymar from "@/assets/play/silhouettes/neymar-bow.png";
import palmer from "@/assets/play/silhouettes/palmer-shrug.png";
import rashford from "@/assets/play/silhouettes/rashford-temple.png";
import ronaldo from "@/assets/play/silhouettes/ronaldo-siu.png";
import salah from "@/assets/play/silhouettes/salah-sky.png";
import vini from "@/assets/play/silhouettes/vini-dance.png";
import yamal from "@/assets/play/silhouettes/yamal-roar.png";

/** One celebration, cut down to its outline. The answer is revealed in the player's colour. */
export type Silhouette = {
  id: string;
  /** The player's full name, as shown on the answer buttons. */
  player: string;
  /** What the celebration is called. */
  celebration: string;
  /** One line shown after the answer. */
  fact: string;
  /** The outline, black on transparent (used as a mask). */
  image: StaticImageData;
  /** The colour the outline turns when the answer is shown. */
  color: string;
  /** Where the original photo is, so the answer can link to it instead of the site hosting it. */
  source: { name: string; url: string };
};

/** How close two hair types look in outline: the same, near each other, or nothing alike. */
const HAIR_LOOK: Record<Hair, Partial<Record<Hair, number>>> = {
  curly: { curly: 4, long: 1, short: 1 },
  long: { long: 4, curly: 1, styled: 1 },
  buzz: { buzz: 4, bald: 2, short: 2 },
  short: { short: 4, styled: 2, buzz: 2, curly: 1 },
  styled: { styled: 4, short: 2, long: 1 },
  bald: { bald: 4, buzz: 2 },
};

/** How believable `candidate` is as a wrong answer for `answer`: higher is harder to rule out. */
export function resemblance(answer: Looks, candidate: Looks): number {
  const hair = HAIR_LOOK[answer.hair][candidate.hair] ?? -3;
  const gap = Math.abs(answer.height - candidate.height);
  const height = gap <= 4 ? 2 : gap <= 8 ? 1 : gap <= 14 ? 0 : -1;
  return hair + height;
}

export const OPTIONS_PER_QUESTION = 4;

/** How many of the closest look-alikes the wrong answers are drawn from. */
const LOOKALIKES = 10;

export type Question = { silhouette: Silhouette; options: string[] };

/** A random order for a new game. Pass `random` to make it repeatable. */
export function shuffled<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Three wrong names that look like the answer in outline, so the pose has to do the work. */
export function lookalikes(answer: string, random: () => number = Math.random): string[] {
  const target = LOOKS[answer];
  const ranked = Object.keys(LOOKS)
    .filter((name) => name !== answer)
    .map((name) => ({ name, score: resemblance(target, LOOKS[name]) }))
    // Random order first, so equally good look-alikes change from game to game.
    .sort(() => random() - 0.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, LOOKALIKES);
  return shuffled(ranked, random)
    .slice(0, OPTIONS_PER_QUESTION - 1)
    .map((entry) => entry.name);
}

/** How many silhouettes one game asks. The bank can be bigger: each game draws from it. */
export const QUESTIONS_PER_GAME = 20;

/**
 * A new game: `count` silhouettes from the bank, each with the right name among believable wrong
 * ones. Silhouettes in `seen` (from earlier games) come last, so a rematch is mostly new poses.
 */
export function buildQuestions(
  random: () => number = Math.random,
  source: Silhouette[] = SILHOUETTES,
  seen: ReadonlySet<string> = new Set(),
  count: number = QUESTIONS_PER_GAME,
): Question[] {
  const fresh = shuffled(source.filter((s) => !seen.has(s.id)), random);
  const old = shuffled(source.filter((s) => seen.has(s.id)), random);
  const picked = shuffled([...fresh, ...old].slice(0, count), random);
  return picked.map((silhouette) => ({
    silhouette,
    options: shuffled([silhouette.player, ...lookalikes(silhouette.player, random)], random),
  }));
}

/** The ranks, from the top. A rank needs at least this share of the answers. */
const RANKS = [
  { min: 0.85, title: "Shadow Master" },
  { min: 0.65, title: "Shadow Hunter" },
  { min: 0.45, title: "Shadow Spotter" },
  { min: 0.25, title: "Shadow Student" },
  { min: 0, title: "Still in the Dark" },
] as const;

export function rankFor(score: number, total: number): string {
  const share = total === 0 ? 0 : score / total;
  return (RANKS.find((rank) => share >= rank.min) ?? RANKS[RANKS.length - 1]).title;
}

/** One played question, for the score card. */
export type Played = { id: string; right: boolean };

const CODE_BASE = 36;

/**
 * A game as a short code for the score card: for each question, two base-36 characters holding the
 * silhouette's place in the bank (so the bank only ever grows at the end) and whether it was right.
 */
export function encodeRun(played: readonly Played[], source: Silhouette[] = SILHOUETTES): string | null {
  const parts: string[] = [];
  for (const { id, right } of played) {
    const index = source.findIndex((s) => s.id === id);
    if (index < 0) return null;
    parts.push((index * 2 + (right ? 1 : 0)).toString(CODE_BASE).padStart(2, "0"));
  }
  return parts.join("");
}

/** The questions a code describes, or null unless it is `count` different silhouettes whose right answers add up to `score`. */
export function decodeRun(code: string | null | undefined, score: number, source: Silhouette[] = SILHOUETTES, count: number = QUESTIONS_PER_GAME): Played[] | null {
  if (!code || code.length !== count * 2 || !/^[0-9a-z]+$/.test(code)) return null;
  const played: Played[] = [];
  for (let i = 0; i < code.length; i += 2) {
    const value = parseInt(code.slice(i, i + 2), CODE_BASE);
    const silhouette = source[Math.floor(value / 2)];
    if (!silhouette) return null;
    played.push({ id: silhouette.id, right: value % 2 === 1 });
  }
  if (new Set(played.map((p) => p.id)).size !== count) return null;
  return played.filter((p) => p.right).length === score ? played : null;
}

export function ratingFor(score: number, total: number): string {
  const share = total === 0 ? 0 : score / total;
  if (share === 1) return "Perfect. You know every celebration.";
  if (share >= 0.8) return "Superfan. Hardly anything gets past you.";
  if (share >= 0.6) return "You know your football.";
  if (share >= 0.4) return "Not bad. Some of those were tricky.";
  return "Time to watch more goals.";
}

export function shareLine(score: number, total: number): string {
  return `${rankFor(score, total)}: I got ${score}/${total} guessing footballers from their celebration silhouettes. Can you beat me?`;
}
