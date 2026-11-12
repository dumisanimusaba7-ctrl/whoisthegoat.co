import { describe, expect, it } from "vitest";

import { existsSync } from "node:fs";

import { DEBATES } from "@/lib/debates";
import { decodeOrder, encodeOrder, fullName, getPlayer, pickCardPlayer, PLAYERS } from "@/lib/play/players";
import { buildPool, gameReducer, roundNumber, shareText, shuffle, startGame, winnerOf } from "@/lib/play/who-is-better";

/** A repeatable "random": a small linear congruential generator. */
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

describe("who is better: the player pool", () => {
  it("keeps Messi and Ronaldo for last", () => {
    for (let seed = 1; seed <= 40; seed++) {
      const state = startGame(buildPool(), seeded(seed));
      expect([state.left.slug, state.right.slug]).not.toContain("messi");
      expect([state.left.slug, state.right.slug]).not.toContain("ronaldo");
      expect(state.queue.slice(-2).map((c) => c.slug).sort()).toEqual(["messi", "ronaldo"]);
    }
  });

  it("is the 15 most-debated players, once each, each with a portrait and a winner-card photo", () => {
    const pool = buildPool();
    expect(pool).toHaveLength(15);
    expect(PLAYERS).toHaveLength(15);
    expect(new Set(pool.map((p) => p.slug)).size).toBe(15);
    for (const player of pool) {
      expect(player.photo, player.slug).toBeTruthy();
      expect(player.name.length, player.slug).toBeGreaterThan(0);
    }
    for (const player of PLAYERS) {
      expect(player.slug).toMatch(/^[a-z0-9]+$/);
      expect(player.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(player.cardFile).toBe(`assets/play/${player.slug}.jpg`);
      expect(existsSync(player.cardFile), player.cardFile).toBe(true);
      expect(player.credits.portrait.length).toBeGreaterThan(0);
      expect(player.credits.card.length).toBeGreaterThan(0);
    }
  });

  it("links players who are in a debate on the site to that debate", () => {
    for (const player of PLAYERS) {
      if (!player.debateSlug) continue;
      const debate = DEBATES.find((d) => d.slug === player.debateSlug);
      expect(debate, player.slug).toBeDefined();
      expect(debate?.options.some((o) => o.slug === player.slug || o.slug === player.slug.replace("9", ""))).toBe(true);
      expect(debate?.title).toBe(player.debateTitle);
    }
  });

  it("describes the winner for the share card", () => {
    const messi = getPlayer("messi")!;
    expect(fullName(messi)).toBe("Lionel Messi");
    expect(fullName(getPlayer("pele")!)).toBe("Pelé");
    expect(pickCardPlayer(messi)).toMatchObject({ slug: "messi", name: "Messi", beaten: 14, photoFile: "assets/play/messi.jpg" });
    expect(getPlayer("nobody")).toBeUndefined();
  });
});

describe("who is better: the knock-out order in a share link", () => {
  const winner = "messi";
  const others = PLAYERS.filter((p) => p.slug !== winner).map((p) => p.slug);

  it("round-trips the order the others were knocked out", () => {
    const order = [...others].reverse();
    const code = encodeOrder(order, winner)!;
    expect(code).toHaveLength(14);
    expect(decodeOrder(code, winner)?.map((p) => p.slug)).toEqual(order);
  });

  it("gives the same code for the same order, and a different one for another", () => {
    expect(encodeOrder(others, winner)).toBe(encodeOrder([...others], winner));
    expect(encodeOrder(others, winner)).not.toBe(encodeOrder([...others].reverse(), winner));
  });

  it("only accepts exactly the other 14 players, each once", () => {
    expect(encodeOrder(others.slice(1), winner)).toBeNull();
    expect(encodeOrder([...others.slice(1), others[1]], winner)).toBeNull();
    expect(encodeOrder([...others.slice(1), winner], winner)).toBeNull();
    expect(encodeOrder([...others.slice(1), "nobody"], winner)).toBeNull();
    const code = encodeOrder(others, winner)!;
    expect(decodeOrder(code.slice(1), winner)).toBeNull();
    expect(decodeOrder(`${code.slice(1)}${code[1]}`, winner)).toBeNull();
    expect(decodeOrder(code, "ronaldo")).toBeNull();
    expect(decodeOrder("<script>alert(1)</script>", winner)).toBeNull();
    expect(decodeOrder("", winner)).toBeNull();
    expect(decodeOrder(null, winner)).toBeNull();
    expect(decodeOrder("z".repeat(14), winner)).toBeNull();
  });

  it("puts the beaten names on the card in that order", () => {
    const order = decodeOrder(encodeOrder(others, winner)!, winner)!;
    expect(pickCardPlayer(getPlayer(winner)!, order).beatenNames).toEqual(order.map((p) => p.name));
    expect(pickCardPlayer(getPlayer(winner)!).beatenNames).toBeUndefined();
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
  const pool = buildPool();

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

  it("plays 14 matches for 15 players", () => {
    expect(startGame(pool, seeded(8)).total).toBe(14);
  });

  it("words the share line with the number beaten", () => {
    const winner = pool[0];
    expect(shareText(winner, 14)).toBe(`I knocked out 14 footballers and my ultimate player is ${winner.name}. Who's yours?`);
  });
});
