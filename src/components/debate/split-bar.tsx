import type { DebateOption } from "@/lib/debates";
import { formatPercent } from "@/lib/format";

/**
 * Compact head-to-head bar for a country row: each side grows from its own
 * edge and they meet where that country splits. Animated with transforms
 * only, so live updates stay on the compositor.
 */
export function SplitBar({ options, percents }: { options: [DebateOption, DebateOption]; percents: [number, number] }) {
  const [a, b] = options;
  const [pa, pb] = percents;
  return (
    <div role="img" aria-label={`${a.shortName} ${formatPercent(pa)}, ${b.shortName} ${formatPercent(pb)}`} className="relative h-1.5 w-full overflow-hidden bg-ink/10">
      <div
        className="absolute inset-0 origin-left transition-transform duration-[var(--duration-large)] ease-out"
        style={{ background: a.color, transform: `scaleX(${pa / 100})` }}
      />
      <div
        className="absolute inset-0 origin-right transition-transform duration-[var(--duration-large)] ease-out"
        style={{ background: b.color, transform: `scaleX(${pb / 100})` }}
      />
    </div>
  );
}
