import { describe, expect, it } from "vitest";

import { DEBATES, FEATURED_DEBATE_SLUG } from "@/lib/debates";
import { categoryCounts, competitionCounts, findCategory, getCabinet, hasCabinet, headlineCounts, shortSeason, teamTotals } from "@/lib/trophies";

const cabinet = getCabinet("messi-vs-ronaldo")!;

describe("trophy cabinet", () => {
  it("exists for the featured debate, which the header and footer link to", () => {
    // Other debates link to a cabinet only when hasCabinet() says so.
    expect(hasCabinet(FEATURED_DEBATE_SLUG)).toBe(true);
    expect(getCabinet(FEATURED_DEBATE_SLUG)).toBeDefined();
  });

  it("counts senior team trophies from the lists", () => {
    // Messi 46 (48 with his two youth titles), Ronaldo 35, as of October 2026.
    expect(teamTotals(cabinet)).toEqual([46, 35]);
    expect(categoryCounts(cabinet.youth!)).toEqual([2, 0]);
  });

  it("matches the headline honours", () => {
    expect(categoryCounts(findCategory(cabinet, "ballon-dor")!)).toEqual([8, 5]);
    expect(categoryCounts(findCategory(cabinet, "champions-league")!)).toEqual([4, 5]);
    expect(competitionCounts(cabinet, "FIFA World Cup")).toEqual([1, 0]);
    expect(categoryCounts(findCategory(cabinet, "golden-shoe")!)).toEqual([6, 4]);
  });

  it("lists every season once, oldest first", () => {
    for (const category of [...cabinet.team, cabinet.youth!, ...cabinet.individual]) {
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

describe("every cabinet", () => {
  const all = DEBATES.flatMap((debate) => {
    const c = getCabinet(debate.slug);
    return c ? [[debate.slug, c] as const] : [];
  });

  it.each(all)("%s: headline rows point at real honours", (_slug, c) => {
    for (const row of c.headline) {
      const [x, y] = headlineCounts(c, row);
      expect(x + y, row.label).toBeGreaterThan(0);
    }
  });

  it.each(all)("%s: ids are unique and seasons listed once, oldest first", (_slug, c) => {
    const categories = [...c.team, ...(c.youth ? [c.youth] : []), ...c.individual];
    expect(new Set(categories.map((cat) => cat.id)).size).toBe(categories.length);
    for (const category of categories) {
      expect(category.honours).toHaveLength(2);
      for (const side of category.honours) {
        for (const honour of side) {
          expect(honour.seasons.length, `${category.id} ${honour.competition}`).toBeGreaterThan(0);
          expect(new Set(honour.seasons).size, `${category.id} ${honour.competition}`).toBe(honour.seasons.length);
          expect([...honour.seasons].sort(), `${category.id} ${honour.competition}`).toEqual(honour.seasons);
        }
      }
    }
    expect(c.records[0].length).toBeGreaterThan(0);
    expect(c.records[1].length).toBeGreaterThan(0);
  });
});
