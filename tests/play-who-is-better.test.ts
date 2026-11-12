import { describe, expect, it } from "vitest";

import { DEBATES } from "@/lib/debates";
import { buildPool, gameReducer, getMode, MODES, roundNumber, shareText, shuffle, startGame, winnerOf } from "@/lib/play/who-is-better";

/** A repeatable "random": a small linear congruential generator. */
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

describe("who is better: the player pool", () => {
  it("is built from people on the debates, once each, all with a portrait", () => {
    for (const mode of MODES) {
      const pool = buildPool(mode.categories);
      expect(pool.length, mode.id).toBeGreaterThanOrEqual(8);
      expect(new Set(pool.map((p) => p.slug)).size).toBe(pool.length);
      for (const player of pool) {
        // In Node, Vite turns an image import into a path; Next gives an object with a src.
        expect(player.photo, player.slug).toBeTruthy();
        expect(player.focus, player.slug).toMatch(/%/);
        expect(DEBATES.some((d) => d.slug === player.debateSlug)).toBe(true);
      }
    }
  });

  it("keeps companies and musicians out of the sports modes", () => {
    const slugs = buildPool(getMode("athletes").categories).map((p) => p.slug);
    for (const out of ["nike", "adidas", "apple", "samsung", "drake", "kendrick", "marvel", "dc"]) expect(slugs).not.toContain(out);
    expect(slugs).toEqual(expect.arrayContaining(["messi", "ronaldo", "lebron", "jordan", "ali"]));
  });

  it("has football as a subset of all sports", () => {
    const football = buildPool(getMode("football").categories).map((p) => p.slug);
    const all = buildPool(getMode("athletes").categories).map((p) => p.slug);
    expect(football.every((slug) => all.includes(slug))).toBe(true);
    expect(football).not.toContain("lebron");
  });

  it("falls back to football for an unknown mode", () => {
    expect(getMode("nonsense").id).toBe("football");
    expect(getMode(null).id).toBe("football");
  });
});

describe("who is better: shuffling", () => {
  it("keeps everyone, and gives a different order for a different seed", () => {
    const list = Array.from({ length: 12 }, (_, i) => i);
    const a = shuffle(list, seeded(1));
    const b = shuffle(list, seeded(2));
    expect([...a].sort((x, y) => x - y)).toEqual(list);
    expect(a).not.toEqual(b);
    expect(list).toEqual(Array.from({ length: 12 }, (_, i) => i));
  });
});

describe("who is better: a game", () => {
  const pool = buildPool(getMode("football").categories);

  it("starts with two players facing off and the rest in line", () => {
    const state = startGame(pool, seeded(3));
    expect(state.phase).toBe("choosing");
    expect(state.queue).toHaveLength(pool.length - 2);
    expect(state.total).toBe(pool.length - 1);
    expect(roundNumber(state)).toBe(1);
    expect(() => startGame(pool.slice(0, 1))).toThrow();
  });

  it("keeps the winner, brings in the next player, and ignores taps while a round resolves", () => {
    let state = startGame(pool, seeded(4));
    const [first, second] = [state.left, state.right];
    const next = state.queue[0];
    state = gameReducer(state, { type: "pick", side: "left" });
    expect(state.phase).toBe("resolving");
    const tappedAgain = gameReducer(state, { type: "pick", side: "right" });
    expect(tappedAgain).toBe(state);
    state = gameReducer(state, { type: "resolve" });
    expect(state.phase).toBe("entering");
    expect(state.left).toBe(first);
    expect(state.right).toBe(next);
    expect(state.eliminated).toEqual([second]);
    expect(gameReducer(state, { type: "pick", side: "right" })).toBe(state);
    state = gameReducer(state, { type: "ready" });
    expect(state.phase).toBe("choosing");
    expect(roundNumber(state)).toBe(2);
  });

  it("plays to one winner after exactly total matches, whichever side is tapped", () => {
    for (const side of ["left", "right"] as const) {
      let state = startGame(pool, seeded(5));
      let matches = 0;
      while (state.phase !== "done") {
        state = gameReducer(state, { type: "pick", side });
        state = gameReducer(state, { type: "resolve" });
        matches++;
        state = gameReducer(state, { type: "ready" });
      }
      expect(matches).toBe(pool.length - 1);
      expect(state.eliminated).toHaveLength(pool.length - 1);
      const winner = winnerOf(state);
      expect(winner).not.toBeNull();
      expect(state.eliminated).not.toContain(winner);
      expect(new Set([...state.eliminated, winner].map((p) => p?.slug)).size).toBe(pool.length);
      expect(roundNumber(state)).toBe(state.total);
    }
  });

  it("ignores resolve and ready when they come at the wrong time", () => {
    const state = startGame(pool, seeded(6));
    expect(gameReducer(state, { type: "resolve" })).toBe(state);
    expect(gameReducer(state, { type: "ready" })).toBe(state);
  });

  it("words the share line with the number beaten", () => {
    const winner = pool[0];
    expect(shareText(winner, 7, "Football")).toBe(`I knocked out 7 footballers and my ultimate pick is ${winner.name}. Who's yours?`);
    expect(shareText(winner, 15, "All sports")).toContain("15 athletes");
  });
});
