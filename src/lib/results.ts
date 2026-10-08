/**
 * Result types and maths shared by the server, the API and the browser.
 * Every number shown on the site comes from these structures, which are
 * built only from database responses.
 */

export type OptionTally = { option: string; votes: number };

export type CountryResult = {
  /** ISO 3166-1 alpha-2 */
  code: string;
  total: number;
  votes: Record<string, number>;
};

export type DebateStatus = "draft" | "live" | "closed";

export type DebateResults = {
  debate: string;
  status: DebateStatus;
  total: number;
  options: OptionTally[];
  countries: {
    /** Countries with at least one vote. */
    count: number;
    /** Countries above the publication threshold, most votes first. */
    rows: CountryResult[];
  };
  generatedAt: string;
};

/** Votes for an option, 0 when it has none yet. */
export function votesFor(options: OptionTally[], slug: string): number {
  return options.find((o) => o.option === slug)?.votes ?? 0;
}

/**
 * Percentages with one decimal place that always sum to exactly 100
 * (largest-remainder rounding). Returns zeros when nobody has voted.
 */
export function percentages(counts: number[]): number[] {
  const total = counts.reduce((sum, n) => sum + n, 0);
  if (total <= 0) return counts.map(() => 0);

  const scaled = counts.map((n) => (n / total) * 1000);
  const floored = scaled.map(Math.floor);
  let remainder = 1000 - floored.reduce((sum, n) => sum + n, 0);

  const order = scaled
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);

  for (const { index } of order) {
    if (remainder <= 0) break;
    floored[index] += 1;
    remainder -= 1;
  }
  return floored.map((n) => n / 10);
}

/** Percentages for the given options, in the order supplied. */
export function optionPercentages(options: OptionTally[], order: string[]): number[] {
  return percentages(order.map((slug) => votesFor(options, slug)));
}

function isFiniteCount(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

/**
 * Validates an untrusted results payload (from the database or the API) and
 * returns a normalised copy, or null if it doesn't look like results.
 */
export function parseResults(input: unknown): DebateResults | null {
  if (!input || typeof input !== "object") return null;
  const data = input as Record<string, unknown>;
  if (typeof data.debate !== "string" || !isFiniteCount(data.total)) return null;
  if (!Array.isArray(data.options)) return null;

  const options: OptionTally[] = [];
  for (const raw of data.options) {
    const o = raw as Record<string, unknown>;
    if (typeof o?.option !== "string" || !isFiniteCount(o.votes)) return null;
    options.push({ option: o.option, votes: o.votes });
  }

  const countriesRaw = (data.countries ?? {}) as Record<string, unknown>;
  const rows: CountryResult[] = [];
  if (Array.isArray(countriesRaw.rows)) {
    for (const raw of countriesRaw.rows) {
      const r = raw as Record<string, unknown>;
      if (typeof r?.code !== "string" || !/^[A-Z]{2}$/.test(r.code) || !isFiniteCount(r.total)) continue;
      const votes: Record<string, number> = {};
      for (const [slug, count] of Object.entries((r.votes ?? {}) as Record<string, unknown>)) {
        if (isFiniteCount(count)) votes[slug] = count;
      }
      rows.push({ code: r.code, total: r.total, votes });
    }
  }

  const status = data.status === "closed" || data.status === "draft" ? data.status : "live";

  return {
    debate: data.debate,
    status,
    total: data.total,
    options,
    countries: {
      count: isFiniteCount(countriesRaw.count) ? countriesRaw.count : rows.length,
      rows,
    },
    generatedAt: typeof data.generatedAt === "string" ? data.generatedAt : new Date(0).toISOString(),
  };
}

function timestamp(value: string): number {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * Picks the fresher of two snapshots. Vote counts only grow, so a snapshot
 * with fewer votes than the one on screen is a stale cache hit and is ignored.
 */
export function newerResults(current: DebateResults | null, next: DebateResults | null): DebateResults | null {
  if (!next) return current;
  if (!current) return next;
  if (next.debate !== current.debate) return next;
  if (next.total > current.total) return next;
  if (next.total === current.total && timestamp(next.generatedAt) >= timestamp(current.generatedAt)) return next;
  return current;
}

/**
 * Applies the global totals returned by a vote (fresher than any cached
 * snapshot) while keeping the country breakdown we already have.
 */
export function withTotals(current: DebateResults | null, debate: string, total: number, options: OptionTally[]): DebateResults {
  if (current && current.debate === debate && current.total > total) return current;
  return {
    debate,
    status: current?.status ?? "live",
    total,
    options,
    countries: current?.countries ?? { count: 0, rows: [] },
    // Keep the snapshot's own timestamp so the next poll (same totals, fresh
    // country breakdown) is still accepted.
    generatedAt: current?.generatedAt ?? new Date(0).toISOString(),
  };
}
