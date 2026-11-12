import { describe, expect, it } from "vitest";

import { buildQuestions, OPTIONS_PER_QUESTION, ratingFor, SILHOUETTES, shareLine } from "@/lib/play/guess";

function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

describe("guess the player", () => {
  it("has 15 silhouettes, each with an outline, an answer and a fact", () => {
    expect(SILHOUETTES).toHaveLength(15);
    expect(new Set(SILHOUETTES.map((s) => s.id)).size).toBe(15);
    for (const s of SILHOUETTES) {
      expect(s.image).toBeTruthy();
      expect(s.player.length).toBeGreaterThan(2);
      expect(s.celebration.length).toBeGreaterThan(2);
      expect(s.fact.endsWith(".")).toBe(true);
      expect(s.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("asks every silhouette once, with the right name once among distinct wrong ones", () => {
    for (let seed = 1; seed <= 30; seed++) {
      const questions = buildQuestions(seeded(seed));
      expect(questions).toHaveLength(15);
      expect(new Set(questions.map((q) => q.silhouette.id)).size).toBe(15);
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

  it("rates and words the score", () => {
    expect(ratingFor(15, 15)).toMatch(/Perfect/);
    expect(ratingFor(0, 15)).toMatch(/watch more/);
    expect(shareLine(9, 15)).toContain("9/15");
  });
});

describe("silhouette files", () => {
  it("are on disk, one per silhouette, and no strays", async () => {
    const { existsSync, readdirSync } = await import("node:fs");
    const files = readdirSync("src/assets/play/silhouettes").sort();
    expect(files).toEqual(SILHOUETTES.map((s) => `${s.id}.png`).sort());
    for (const s of SILHOUETTES) expect(existsSync(`src/assets/play/silhouettes/${s.id}.png`)).toBe(true);
  });
});
