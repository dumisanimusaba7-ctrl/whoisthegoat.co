import { describe, expect, it } from "vitest";

import { countryFlag, countryName, formatCompact, formatCount, formatPercent, pluralize } from "@/lib/format";

describe("format", () => {
  it("formats counts with thousands separators", () => {
    expect(formatCount(12482391)).toBe("12,482,391");
    expect(formatCount(0)).toBe("0");
  });

  it("keeps small numbers exact in compact form", () => {
    expect(formatCompact(9999)).toBe("9,999");
    expect(formatCompact(12482391)).toBe("12.5M");
  });

  it("always shows one decimal for percentages", () => {
    expect(formatPercent(54.7)).toBe("54.7%");
    expect(formatPercent(100)).toBe("100.0%");
  });

  it("pluralizes", () => {
    expect(pluralize(1, "vote")).toBe("vote");
    expect(pluralize(2, "vote")).toBe("votes");
    expect(pluralize(2, "country", "countries")).toBe("countries");
  });

  it("builds flags and names from ISO codes", () => {
    expect(countryFlag("AR")).toBe("🇦🇷");
    expect(countryFlag("ar")).toBe("");
    expect(countryName("PT")).toBe("Portugal");
  });
});
