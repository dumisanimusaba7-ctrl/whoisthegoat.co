import { describe, expect, it } from "vitest";

import { readdirSync } from "node:fs";

import { buildQuestions, decodeRun, encodeRun, LOOKS, lookalikes, OPTIONS_PER_QUESTION, QUESTIONS_PER_GAME, rankFor, ratingFor, resemblance, SILHOUETTES, shareLine } from "@/lib/play/guess";

function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

describe("the silhouette bank", () => {
  it("has unique silhouettes, each with an outline, an answer, a fact and a source", () => {
    expect(SILHOUETTES.length).toBeGreaterThanOrEqual(QUESTIONS_PER_GAME);
    expect(new Set(SILHOUETTES.map((s) => s.id)).size).toBe(SILHOUETTES.length);
    for (const s of SILHOUETTES) {
      expect(s.image).toBeTruthy();
      expect(s.celebration.length).toBeGreaterThan(2);
      expect(s.fact.endsWith(".")).toBe(true);
      expect(s.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(s.source.url).toMatch(/^https:\/\//);
      expect(LOOKS[s.player], `${s.player} needs hair and height`).toBeTruthy();
    }
  });

  it("has a file for every silhouette and none left over", () => {
    const files = readdirSync("src/assets/play/silhouettes").filter((f) => f.endsWith(".png")).sort();
    expect(files).toEqual(SILHOUETTES.map((s) => `${s.id}.png`).sort());
  });
});

describe("a game", () => {
  it("asks 20 different silhouettes, each with the right name once among distinct wrong ones", () => {
    for (let seed = 1; seed <= 30; seed++) {
      const questions = buildQuestions(seeded(seed));
      expect(questions).toHaveLength(QUESTIONS_PER_GAME);
      expect(new Set(questions.map((q) => q.silhouette.id)).size).toBe(QUESTIONS_PER_GAME);
      for (const q of questions) {
        expect(q.options).toHaveLength(OPTIONS_PER_QUESTION);
        expect(new Set(q.options).size).toBe(OPTIONS_PER_QUESTION);
        expect(q.options.filter((name) => name === q.silhouette.player)).toHaveLength(1);
      }
    }
  });

  it("shuffles the order between games", () => {
    expect(buildQuestions(seeded(1)).map((q) => q.silhouette.id)).not.toEqual(buildQuestions(seeded(2)).map((q) => q.silhouette.id));
  });

  it("leads a rematch with silhouettes that have not been asked yet", () => {
    const seen = new Set(SILHOUETTES.slice(0, 5).map((s) => s.id));
    const unseen = SILHOUETTES.length - seen.size;
    const ids = buildQuestions(seeded(3), SILHOUETTES, seen, 6).map((q) => q.silhouette.id);
    expect(ids).toHaveLength(6);
    // As many new ones as there are, up to the game size.
    expect(ids.filter((id) => !seen.has(id)).length).toBe(Math.min(6, unseen));
  });
});

describe("wrong answers that look right", () => {
  it("never offers a bald player for a curly-haired one, or the reverse", () => {
    for (const s of SILHOUETTES) {
      const answer = LOOKS[s.player];
      for (let seed = 1; seed <= 20; seed++) {
        for (const name of lookalikes(s.player, seeded(seed))) {
          const wrong = LOOKS[name];
          const hairs = new Set([answer.hair, wrong.hair]);
          expect(hairs.has("bald") && hairs.has("curly"), `${name} for ${s.player}`).toBe(false);
          expect(hairs.has("bald") && hairs.has("long"), `${name} for ${s.player}`).toBe(false);
        }
      }
    }
  });

  it("gives Salah curly-haired look-alikes like Maradona, never Zidane", () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 200; seed++) lookalikes("Mohamed Salah", seeded(seed)).forEach((n) => seen.add(n));
    expect(seen.has("Diego Maradona")).toBe(true);
    expect(seen.has("Zinedine Zidane")).toBe(false);
    for (const name of seen) expect(LOOKS[name].hair, name).toMatch(/curly|long|short/);
  });

  it("never offers the answer as a wrong answer", () => {
    for (const s of SILHOUETTES) for (let seed = 1; seed <= 20; seed++) expect(lookalikes(s.player, seeded(seed))).not.toContain(s.player);
  });

  it("scores the same hair and height highest", () => {
    const base = { hair: "curly" as const, height: 175 };
    expect(resemblance(base, { hair: "curly", height: 176 })).toBeGreaterThan(resemblance(base, { hair: "curly", height: 195 }));
    expect(resemblance(base, { hair: "curly", height: 176 })).toBeGreaterThan(resemblance(base, { hair: "bald", height: 176 }));
  });
});

describe("ranks, share line and the score card code", () => {
  it("ranks from Shadow Master down", () => {
    expect(rankFor(20, 20)).toBe("Shadow Master");
    expect(rankFor(17, 20)).toBe("Shadow Master");
    expect(rankFor(13, 20)).toBe("Shadow Hunter");
    expect(rankFor(0, 20)).toBe("Still in the Dark");
    expect(ratingFor(20, 20)).toMatch(/Perfect/);
    expect(shareLine(17, 20)).toContain("17/20");
  });

  it("round-trips a run through its code, and rejects a code that does not match the score", () => {
    const played = buildQuestions(seeded(9)).map((q, i) => ({ id: q.silhouette.id, right: i % 3 === 0 }));
    const score = played.filter((p) => p.right).length;
    const code = encodeRun(played);
    expect(code).toHaveLength(QUESTIONS_PER_GAME * 2);
    expect(decodeRun(code, score)).toEqual(played);
    expect(decodeRun(code, score + 1)).toBeNull();
    expect(decodeRun("zz", score)).toBeNull();
    expect(decodeRun(null, score)).toBeNull();
    expect(decodeRun("!".repeat(QUESTIONS_PER_GAME * 2), score)).toBeNull();
  });
});
