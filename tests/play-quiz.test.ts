import { describe, expect, it } from "vitest";

import { buildRound, FIGURES, pointsFor, QUESTIONS, QUIZ_MAX_POINTS, quizRank, ROUND_MIX, ROUND_SIZE, TIME_LIMIT_SECONDS, questionsFor } from "@/lib/play/quiz";

function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

describe("the question bank", () => {
  it("has 102 questions: 17 for each of the six players, 6 easy, 7 medium and 4 hard", () => {
    expect(QUESTIONS).toHaveLength(102);
    expect(FIGURES).toHaveLength(6);
    for (const figure of FIGURES) {
      const own = questionsFor(figure.slug);
      expect(own, figure.name).toHaveLength(17);
      expect(own.filter((q) => q.level === 1)).toHaveLength(6);
      expect(own.filter((q) => q.level === 2)).toHaveLength(7);
      expect(own.filter((q) => q.level === 3)).toHaveLength(4);
    }
  });

  it("gives every question one right answer and three different wrong ones", () => {
    expect(new Set(QUESTIONS.map((q) => q.id)).size).toBe(102);
    expect(new Set(QUESTIONS.map((q) => q.question)).size).toBe(102);
    for (const q of QUESTIONS) {
      expect(new Set([q.answer, ...q.wrong]).size, q.id).toBe(4);
      expect(q.question.endsWith("?") || q.question.endsWith("."), q.id).toBe(true);
      expect(q.fact.endsWith("."), q.id).toBe(true);
    }
  });
});

describe("a round", () => {
  it("asks 10 questions: 3 easy, 4 medium, 3 hard, each right answer among 4 scrambled options", () => {
    for (const figure of FIGURES) {
      for (let seed = 1; seed <= 10; seed++) {
        const round = buildRound(figure.slug, seeded(seed));
        expect(round).toHaveLength(ROUND_SIZE);
        expect(new Set(round.map((a) => a.question.id)).size).toBe(ROUND_SIZE);
        for (const level of [1, 2, 3] as const) expect(round.filter((a) => a.question.level === level)).toHaveLength(ROUND_MIX[level]);
        for (const asked of round) {
          expect(asked.question.figure).toBe(figure.slug);
          expect(asked.options).toHaveLength(4);
          expect(asked.options.filter((o) => o === asked.question.answer)).toHaveLength(1);
        }
      }
    }
  });

  it("scrambles the questions and the options between rounds", () => {
    const a = buildRound("messi", seeded(1));
    const b = buildRound("messi", seeded(2));
    expect(a.map((x) => x.question.id)).not.toEqual(b.map((x) => x.question.id));
    // Options are not always in the order they were written (right answer first).
    const rounds = Array.from({ length: 20 }, (_, i) => buildRound("messi", seeded(i + 1))).flat();
    expect(rounds.some((x) => x.options[0] !== x.question.answer)).toBe(true);
    expect(rounds.some((x) => x.options[0] === x.question.answer)).toBe(true);
  });

  it("leads with questions not asked before", () => {
    const own = questionsFor("jordan");
    const seen = new Set(own.filter((q) => q.level === 2).slice(0, 3).map((q) => q.id));
    const round = buildRound("jordan", seeded(4), seen);
    // 7 medium questions, 3 seen: 4 unseen fill the 4 medium places.
    expect(round.filter((a) => a.question.level === 2 && seen.has(a.question.id))).toHaveLength(0);
  });
});

describe("scoring", () => {
  it("pays more for harder questions and for quicker answers, and nothing is ever above the cap", () => {
    expect(pointsFor(3, 1000)).toBeGreaterThan(pointsFor(1, 1000));
    expect(pointsFor(2, 1000)).toBeGreaterThan(pointsFor(2, 10000));
    expect(pointsFor(2, TIME_LIMIT_SECONDS * 1000)).toBe(150);
    expect(pointsFor(1, 0)).toBe(150);
  });

  it("has a maximum no real round can reach, even answering everything right in a second", () => {
    expect(QUIZ_MAX_POINTS).toBe(2250);
    let best = 0;
    for (let seed = 1; seed <= 20; seed++) best = Math.max(best, buildRound("ronaldo", seeded(seed)).reduce((sum, a) => sum + pointsFor(a.question.level, 1000), 0));
    expect(best).toBeLessThan(QUIZ_MAX_POINTS);
  });

  it("ranks by points", () => {
    expect(quizRank(0)).toBe("Rookie");
    expect(quizRank(900)).toBe("Superfan");
    expect(quizRank(1800)).toBe("GOAT Historian");
  });
});
