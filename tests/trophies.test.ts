import { describe, expect, it } from "vitest";

import { DEBATES } from "@/lib/debates";
import { categoryCounts, competitionCounts, findCategory, getCabinet, shortSeason, teamTotals } from "@/lib/trophies";

const cabinet = getCabinet("messi-vs-ronaldo")!;

describe("trophy cabinet", () => {
  it("exists for every debate that links to it", () => {
    expect(DEBATES.every((debate) => getCabinet(debate.slug))).toBe(true);
  });

  it("counts senior team trophies from the lists", () => {
    // Messi 46 (48 with his two youth titles), Ronaldo 35, as of October 2026.
    expect(teamTotals(cabinet)).toEqual([46, 35]);
    expect(categoryCounts(cabinet.youth)).toEqual([2, 0]);
  });

  it("matches the headline honours", () => {
    expect(categoryCounts(findCategory(cabinet, "ballon-dor")!)).toEqual([8, 5]);
    expect(categoryCounts(findCategory(cabinet, "champions-league")!)).toEqual([4, 5]);
    expect(competitionCounts(cabinet, "FIFA World Cup")).toEqual([1, 0]);
    expect(categoryCounts(findCategory(cabinet, "golden-shoe")!)).toEqual([6, 4]);
  });

  it("lists every season once, oldest first", () => {
    for (const category of [...cabinet.team, cabinet.youth, ...cabinet.individual]) {
      for (const side of category.honours) {
        for (const honour of side) {
          expect(new Set(honour.seasons).size).toBe(honour.seasons.length);
          expect([...honour.seasons].sort()).toEqual(honour.seasons);
        }
      }
    }
  });

  it("shortens seasons for labels", () => {
    expect(shortSeason("2008–09")).toBe("’09");
    expect(shortSeason("2022")).toBe("’22");
  });
});
