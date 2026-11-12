/** High scores for the games: what a name may be, and the shapes shared by the page and the server. */

import { QUESTIONS_PER_GAME } from "@/lib/play/guess";
import { QUIZ_MAX_POINTS } from "@/lib/play/quiz";

/** The games with a board. The slug matches the `game` column in the database. */
export const GUESS_GAME = "guess-the-player";
export const QUIZ_GAME = "know-your-goats";

export type GameSlug = typeof GUESS_GAME | typeof QUIZ_GAME;

export const GAMES: Record<GameSlug, { label: string; href: string; max: number; unit: string }> = {
  [GUESS_GAME]: { label: "Who is that?", href: "/play/guess-the-player", max: QUESTIONS_PER_GAME, unit: `/${QUESTIONS_PER_GAME}` },
  [QUIZ_GAME]: { label: "Know your GOATs", href: "/play/know-your-goats", max: QUIZ_MAX_POINTS, unit: " pts" },
};

export function isGame(value: string): value is GameSlug {
  return Object.hasOwn(GAMES, value);
}

/** A score as shown on a board: "17/20" or "1,430 pts". */
export function formatScore(game: GameSlug, score: number): string {
  return `${score.toLocaleString("en")}${GAMES[game].unit}`;
}

export const NAME_MIN = 2;
export const NAME_MAX = 16;

/** How many players the boards show. */
export const BOARD_SIZE = 20;

export type ScoreRow = { name: string; score: number };

/** Words a name may not contain, checked on the name with look-alike characters and spacing removed. */
const BLOCKED = [
  "fuck", "shit", "cunt", "bitch", "dick", "cock", "pussy", "whore", "slut", "bastard", "wank", "twat", "piss",
  "nigg", "fagg", "retard", "paki", "chink", "kike", "spic", "coon", "tranny", "rape", "rapist", "nazi", "hitler", "isis",
  "kkk", "pedo", "porn", "sex", "anal", "penis", "vagina", "boob", "admin", "moderator", "whoisthegoat",
];

const LOOK_ALIKES: Record<string, string> = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "8": "b", "@": "a", $: "s", "!": "i" };

/** The name in the form it is checked in: lower case, look-alike digits and symbols turned to letters, nothing but letters. */
function normalised(name: string): string {
  return [...name.toLowerCase()].map((c) => LOOK_ALIKES[c] ?? c).join("").replace(/[^\p{L}]/gu, "");
}

/**
 * A name fit to show on the board, or null. Letters and numbers (any language), spaces and . _ - '
 * are allowed; it is trimmed, runs of spaces become one, and it must be 2–16 characters and pass the word list.
 * The list is a first line of defence, not a promise: names can be removed from the database.
 */
export function cleanName(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const name = raw.normalize("NFKC").replace(/\s+/g, " ").trim();
  const length = [...name].length;
  if (length < NAME_MIN || length > NAME_MAX) return null;
  if (!/^[\p{L}\p{N} ._'-]+$/u.test(name)) return null;
  if (!/\p{L}/u.test(name)) return null;
  const check = normalised(name);
  if (BLOCKED.some((word) => check.includes(word))) return null;
  return name;
}

/** Reads the board a server sends, dropping anything that isn't a name and a score. */
export function parseBoard(data: unknown): ScoreRow[] {
  if (!Array.isArray(data)) return [];
  return data.flatMap((row): ScoreRow[] => {
    const name = row && typeof row === "object" ? (row as Record<string, unknown>).name : null;
    const score = row && typeof row === "object" ? (row as Record<string, unknown>).score : null;
    return typeof name === "string" && typeof score === "number" && Number.isInteger(score) && score >= 0 ? [{ name, score }] : [];
  });
}

/** `country` and `countryRank` are the player's two-letter country and their place among players from there, when known. */
export type ScoreResponse =
  | { status: "new_best" | "not_higher"; score: number; rank: number; country: string | null; countryRank: number | null }
  | { status: "invalid" | "forbidden" | "rate_limited" | "unavailable"; message: string };

/** Countries whose name takes "the": "in the United Kingdom". */
const TAKES_THE = new Set(["GB", "US", "NL", "AE", "PH", "BS", "GM", "KM", "MV", "MH", "SB", "SC", "CG", "CD", "CF", "DO"]);

/** "in the United Kingdom", "in Ireland": a country as it reads after "in". */
export function inCountry(code: string): string {
  const name = countryName(code);
  return `in ${TAKES_THE.has(code) && !name.startsWith("The ") ? "the " : ""}${name}`;
}

/** "United Kingdom" for "GB", or the code itself where the browser can't say. */
export function countryName(code: string): string {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}
