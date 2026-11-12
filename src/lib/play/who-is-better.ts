import type { StaticImageData } from "next/image";

import { PLAYERS, type PlayPlayer } from "./players";
import { PORTRAITS } from "./portraits";

/** One player in the elimination game. */
export type Contender = {
  slug: string;
  /** Shown big under the portrait: "Messi". */
  name: string;
  /** Shown small above it: "Lionel". Empty when the name says it all. */
  firstName: string;
  /** The face portrait (1200×1323). */
  photo: StaticImageData;
  color: string;
  /** The debate this player is in on the site, if any, to send the winner's fans to the real vote. */
  debateSlug?: string;
  debateTitle?: string;
};

/** The 15 most-debated players, each with a portrait. */
export function buildPool(players: PlayPlayer[] = PLAYERS): Contender[] {
  return players.flatMap((player) => {
    const photo = PORTRAITS[player.slug];
    if (!photo) return [];
    return [{ slug: player.slug, name: player.name, firstName: player.firstName, photo, color: player.color, debateSlug: player.debateSlug, debateTitle: player.debateTitle }];
  });
}

/** A random order for a new game. Pass `random` to make it repeatable. */
export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export type Side = "left" | "right";

export type Phase =
  /** Waiting for a tap. */
  | "choosing"
  /** A side was tapped: the other one is fading away. */
  | "resolving"
  /** A new challenger is arriving; taps are ignored for a moment. */
  | "entering"
  | "done";

export type GameState = {
  left: Contender;
  right: Contender;
  /** Still to come, in order. */
  queue: Contender[];
  /** Beaten players, first to last. */
  eliminated: Contender[];
  picked: Side | null;
  phase: Phase;
  /** How many matches there will be in all. */
  total: number;
};

export type GameAction = { type: "pick"; side: Side } | { type: "resolve" } | { type: "ready" };

/** The two players everyone expects to see first. They come in last, so the game doesn't open on the GOAT debate. */
export const SAVED_FOR_LAST = ["messi", "ronaldo"];

/** Puts the saved-for-last players at the end, keeping the order of everyone else. */
export function savedForLast<T extends { slug: string }>(items: readonly T[]): T[] {
  return [...items.filter((i) => !SAVED_FOR_LAST.includes(i.slug)), ...items.filter((i) => SAVED_FOR_LAST.includes(i.slug))];
}

/** Starts a game: the first two face off, everyone else waits in line, Messi and Ronaldo last. Needs at least two players. */
export function startGame(pool: Contender[], random: () => number = Math.random): GameState {
  if (pool.length < 2) throw new Error("The elimination game needs at least two players");
  const last = shuffle(pool.filter((c) => SAVED_FOR_LAST.includes(c.slug)), random);
  const rest = shuffle(pool.filter((c) => !SAVED_FOR_LAST.includes(c.slug)), random);
  const [left, right, ...queue] = [...rest, ...last];
  return { left, right, queue, eliminated: [], picked: null, phase: "choosing", total: pool.length - 1 };
}

/** The match being played, counting from 1. */
export function roundNumber(state: GameState): number {
  return Math.min(state.eliminated.length + (state.phase === "done" ? 0 : 1), state.total);
}

export function winnerOf(state: GameState): Contender | null {
  return state.phase === "done" ? (state.picked === "left" ? state.left : state.right) : null;
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "pick":
      return state.phase === "choosing" ? { ...state, picked: action.side, phase: "resolving" } : state;
    case "resolve": {
      if (state.phase !== "resolving" || !state.picked) return state;
      const loserSide: Side = state.picked === "left" ? "right" : "left";
      const eliminated = [...state.eliminated, state[loserSide]];
      if (state.queue.length === 0) return { ...state, eliminated, phase: "done" };
      const [next, ...queue] = state.queue;
      return { ...state, [loserSide]: next, queue, eliminated, picked: null, phase: "entering" };
    }
    case "ready":
      return state.phase === "entering" ? { ...state, phase: "choosing" } : state;
  }
}

/** The line people share, with the number they beat on the way. */
export function shareText(winner: Contender, beaten: number): string {
  return `I knocked out ${beaten} footballers and my ultimate player is ${winner.name}. Who's yours?`;
}
