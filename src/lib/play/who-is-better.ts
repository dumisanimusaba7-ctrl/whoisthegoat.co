import type { StaticImageData } from "next/image";

import { type Category, DEBATES, type Debate } from "@/lib/debates";

/** One player in the elimination game, built from a person on the debates. */
export type Contender = {
  slug: string;
  /** Shown big under the portrait: "Messi". */
  name: string;
  /** Shown small above it: "Lionel". Empty when the name says it all. */
  firstName: string;
  /** The face-centred vote-board photo (1200×1323). */
  photo: StaticImageData;
  /** CSS object-position that keeps the face whole however the tile crops. */
  focus: string;
  color: string;
  /** The debate this player is in, to send the winner's fans to the real vote. */
  debateSlug: string;
  debateTitle: string;
};

export type ModeId = "football" | "athletes";

export type Mode = { id: ModeId; label: string; blurb: string; categories: Category[] };

export const MODES: Mode[] = [
  { id: "football", label: "Football", blurb: "Footballers, old and new", categories: ["football"] },
  { id: "athletes", label: "All sports", blurb: "Football, basketball, boxing, MMA and F1", categories: ["football", "basketball", "boxing", "mma", "formula-1"] },
];

export function getMode(id: string | null | undefined): Mode {
  return MODES.find((mode) => mode.id === id) ?? MODES[0];
}

/** Everyone in the debates of these categories whose debate has board artwork, once each. */
export function buildPool(categories: Category[], debates: Debate[] = DEBATES): Contender[] {
  const seen = new Set<string>();
  const pool: Contender[] = [];
  for (const debate of debates) {
    if (!categories.includes(debate.category)) continue;
    if (!debate.artwork) continue;
    debate.options.forEach((option, index) => {
      if (option.kind !== "person" || seen.has(option.slug)) return;
      seen.add(option.slug);
      pool.push({
        slug: option.slug,
        name: option.shortName,
        firstName: option.firstName && option.firstName !== option.shortName ? option.firstName : "",
        photo: debate.artwork!.sides[index],
        focus: debate.artwork!.focus[index],
        color: option.color,
        debateSlug: debate.slug,
        debateTitle: debate.title,
      });
    });
  }
  return pool;
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

/** Starts a game: the first two face off, everyone else waits in line. Needs at least two players. */
export function startGame(pool: Contender[], random: () => number = Math.random): GameState {
  if (pool.length < 2) throw new Error("The elimination game needs at least two players");
  const [left, right, ...queue] = shuffle(pool, random);
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
export function shareText(winner: Contender, beaten: number, modeLabel: string): string {
  const players = modeLabel === "Football" ? "footballers" : "athletes";
  return `I knocked out ${beaten} ${players} and my ultimate pick is ${winner.name}. Who's yours?`;
}
