import Link from "next/link";

import { CATEGORY_LABELS, DEBATES } from "@/lib/debates";

/** The other open debates, one tap away. */
export function MoreDebates({ current }: { current: string }) {
  const others = DEBATES.filter((debate) => debate.slug !== current);
  return (
    <section aria-labelledby="more-debates-title" className="border-t border-rule bg-paper">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="more-debates-title" className="type-title">
            More debates
          </h2>
          <Link href="/debates" className="link text-sm font-semibold">
            All debates
          </Link>
        </div>
        <ul className="mt-6 grid gap-x-10 border-t-2 border-ink sm:grid-cols-2 lg:grid-cols-3">
          {others.map((debate) => (
            <li key={debate.slug} className="border-b border-rule">
              <Link
                href={`/${debate.slug}`}
                className="group flex min-h-14 items-baseline justify-between gap-4 py-3.5 transition-opacity duration-[var(--duration-micro)] hover:opacity-70"
              >
                <span className="font-semibold">{debate.title}</span>
                <span className="shrink-0 text-sm text-mute">{CATEGORY_LABELS[debate.category]}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
