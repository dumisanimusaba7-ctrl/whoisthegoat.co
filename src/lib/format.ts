const integer = new Intl.NumberFormat("en-US");
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

/** 12482391 → "12,482,391" */
export function formatCount(value: number): string {
  return integer.format(Math.round(value));
}

/** 12482391 → "12.5M" */
export function formatCompact(value: number): string {
  return value < 10_000 ? formatCount(value) : compact.format(value);
}

/** 54.7 → "54.7%" — always one decimal so the figure doesn't jump in width. */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return count === 1 ? singular : plural;
}

let regionNames: Intl.DisplayNames | null = null;

/** "AR" → "Argentina". Falls back to the code if the runtime lacks the data. */
export function countryName(code: string): string {
  try {
    regionNames ??= new Intl.DisplayNames(["en"], { type: "region" });
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

/** "AR" → "🇦🇷" using regional indicator symbols. */
export function countryFlag(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return "";
  return String.fromCodePoint(...[...code].map((c) => 0x1f1a5 + c.charCodeAt(0)));
}
