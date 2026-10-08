import { describe, expect, it } from "vitest";

import { newerResults, optionPercentages, parseResults, percentages, withTotals, type DebateResults } from "@/lib/results";

function snapshot(total: number, generatedAt: string, messi = total, countries = 0): DebateResults {
  return {
    debate: "messi-vs-ronaldo",
    status: "live",
    total,
    options: [
      { option: "messi", votes: messi },
      { option: "ronaldo", votes: total - messi },
    ],
    countries: { count: countries, rows: [] },
    generatedAt,
  };
}

describe("percentages", () => {
  it("always sums to exactly 100 with one decimal", () => {
    for (const counts of [[1, 2], [1, 1, 1], [6827868, 5654523], [2, 3, 5], [999, 1]]) {
      const result = percentages(counts);
      expect(Math.round(result.reduce((a, b) => a + b, 0) * 10)).toBe(1000);
      for (const p of result) expect(Math.round(p * 10)).toBe(p * 10);
    }
  });

  it("rounds to the nearest tenth", () => {
    expect(percentages([6827868, 5654523])).toEqual([54.7, 45.3]);
    expect(percentages([1, 2])).toEqual([33.3, 66.7]);
  });

  it("returns zeros when nobody has voted", () => {
    expect(percentages([0, 0])).toEqual([0, 0]);
  });

  it("orders by the requested option slugs", () => {
    const options = [
      { option: "ronaldo", votes: 3 },
      { option: "messi", votes: 1 },
    ];
    expect(optionPercentages(options, ["messi", "ronaldo"])).toEqual([25, 75]);
    expect(optionPercentages(options, ["messi", "pele"])).toEqual([100, 0]);
  });
});

describe("parseResults", () => {
  const valid = {
    debate: "messi-vs-ronaldo",
    status: "live",
    total: 3,
    options: [
      { option: "messi", votes: 2 },
      { option: "ronaldo", votes: 1 },
    ],
    countries: { count: 2, rows: [{ code: "AR", total: 2, votes: { messi: 2, ronaldo: 0 } }] },
    generatedAt: "2026-10-08T12:00:00.123+00:00",
  };

  it("accepts a well-formed payload", () => {
    expect(parseResults(valid)).toEqual(valid);
  });

  it("rejects payloads with missing or invalid counts", () => {
    expect(parseResults(null)).toBeNull();
    expect(parseResults({ ...valid, total: -1 })).toBeNull();
    expect(parseResults({ ...valid, total: "3" })).toBeNull();
    expect(parseResults({ ...valid, options: [{ option: "messi", votes: Number.NaN }] })).toBeNull();
  });

  it("drops malformed country rows instead of failing", () => {
    const parsed = parseResults({
      ...valid,
      countries: { count: 2, rows: [{ code: "argentina", total: 2, votes: {} }, valid.countries.rows[0]] },
    });
    expect(parsed?.countries.rows).toHaveLength(1);
  });
});

describe("newerResults", () => {
  it("never lets a stale cache hit move the count backwards", () => {
    const current = snapshot(100, "2026-10-08T12:00:10Z");
    expect(newerResults(current, snapshot(99, "2026-10-08T12:00:20Z"))).toBe(current);
  });

  it("takes snapshots with more votes", () => {
    const next = snapshot(101, "2026-10-08T12:00:00Z");
    expect(newerResults(snapshot(100, "2026-10-08T12:00:10Z"), next)).toBe(next);
  });

  it("compares timestamps across Postgres and JavaScript formats", () => {
    const current = snapshot(100, "2026-10-08T12:00:10.000Z");
    const next = snapshot(100, "2026-10-08T12:00:11.5+00:00");
    expect(newerResults(current, next)).toBe(next);
  });
});

describe("withTotals", () => {
  it("applies the totals returned with a vote but keeps the country breakdown", () => {
    const current = { ...snapshot(10, "2026-10-08T12:00:00Z", 5, 4) };
    const merged = withTotals(current, "messi-vs-ronaldo", 11, [
      { option: "messi", votes: 6 },
      { option: "ronaldo", votes: 5 },
    ]);
    expect(merged.total).toBe(11);
    expect(merged.countries.count).toBe(4);
    // The next poll with the same totals (and fresh countries) must still be accepted.
    const poll = snapshot(11, "2026-10-08T12:00:05Z", 6, 5);
    expect(newerResults(merged, poll)).toBe(poll);
  });

  it("ignores totals older than what is already shown", () => {
    const current = snapshot(50, "2026-10-08T12:00:00Z");
    expect(withTotals(current, "messi-vs-ronaldo", 40, current.options)).toBe(current);
  });
});
