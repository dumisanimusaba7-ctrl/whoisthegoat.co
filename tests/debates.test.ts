import { describe, expect, it } from "vitest";

import { createTimeline, restState, runnerTiming } from "@/components/celebration/timeline";
import { lowestPoint } from "@/components/celebration/pose";
import { DEBATES } from "@/lib/debates";

describe("debate registry", () => {
  it("has unique debate slugs, and unique option slugs within each debate", () => {
    expect(new Set(DEBATES.map((d) => d.slug)).size).toBe(DEBATES.length);
    for (const debate of DEBATES) {
      const [a, b] = debate.options;
      expect(a.slug).not.toBe(b.slug);
      expect(debate.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it("gives every option four reasons, a mark and two readable colours", () => {
    for (const debate of DEBATES) {
      for (const option of debate.options) {
        expect(option.caseFor, option.slug).toHaveLength(4);
        expect(option.mark.length, option.slug).toBeGreaterThan(0);
        expect(option.color, option.slug).toMatch(/^#[0-9A-Fa-f]{6}$/);
        expect(option.onColor, option.slug).toMatch(/^#[0-9A-Fa-f]{6}$/);
        if (option.kind === "person") expect(option.nationality, option.slug).toBeTruthy();
      }
      for (const row of debate.taleOfTheTape) expect(row.values).toHaveLength(2);
    }
  });

  it("keeps editorial copy to curly apostrophes", () => {
    const prose = DEBATES.flatMap((d) => [d.question, ...d.intro, d.seo.description, ...d.options.flatMap((o) => o.caseFor)]);
    for (const text of prose) expect(text, text).not.toMatch(/'/);
  });
});

describe("celebrations", () => {
  const runners = DEBATES.flatMap((d) => d.options.flatMap((o) => (o.runner ? [{ slug: o.slug, runner: o.runner }] : [])));

  it("gives every option on the site a runner", () => {
    expect(runners).toHaveLength(DEBATES.length * 2);
  });

  it.each(runners)("$slug arrives on its result and finishes", ({ runner }) => {
    const timing = runnerTiming(runner);
    expect(timing.end).toBeGreaterThan(timing.arrive);
    for (const target of [0.08, 0.5, 0.92]) {
      const timeline = createTimeline(runner, { target, trackPx: 360, unitPx: 0.6 });
      let last = -1;
      for (let t = 0; t <= timing.end; t += 16) {
        const frame = timeline.sample(t);
        // The bar never runs past the result, and only ever moves forward.
        expect(frame.pos).toBeLessThanOrEqual(target + 1e-9);
        expect(frame.pos).toBeGreaterThanOrEqual(last - 1e-9);
        last = frame.pos;
        if (frame.pose) {
          for (const value of Object.values(frame.pose)) expect(Number.isFinite(value)).toBe(true);
          // Nobody sinks into the bar.
          expect(lowestPoint(frame.pose)).toBeLessThan(0.01);
        }
      }
      const end = timeline.sample(timing.end);
      expect(end.pos).toBeCloseTo(target, 6);
      expect(end.done).toBe(true);
    }
  });

  it.each(runners)("$slug comes to rest standing on the bar", ({ runner }) => {
    const rest = restState(runner);
    if (rest.pose) expect(lowestPoint(rest.pose)).toBeCloseTo(0, 6);
    if (runner.kind === "car") expect(rest.car?.smoke).toBeNull();
  });
});
