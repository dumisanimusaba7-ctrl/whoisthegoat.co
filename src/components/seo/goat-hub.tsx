import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { CATEGORY_LABELS, DEBATES, type Debate } from "@/lib/debates";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
import { hasCabinet } from "@/lib/trophies";

/**
 * The home page's answer to "who is the GOAT?": what the word means, and
 * every debate the world is settling, sport by sport.
 */
export function GoatHub() {
  const bySport = new Map<Debate["category"], Debate[]>();
  for (const debate of DEBATES) bySport.set(debate.category, [...(bySport.get(debate.category) ?? []), debate]);

  return (
    <section aria-labelledby="goat-hub-title" className="border-t border-rule bg-paper">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <h2 id="goat-hub-title" className="type-title">
          Who is the GOAT? The world decides
        </h2>
        <div className="mt-4 max-w-3xl space-y-4 text-lg leading-relaxed text-ink/80">
          <p>
            GOAT means <strong>Greatest Of All Time</strong>. Messi or Ronaldo, LeBron or Jordan, Ali or Tyson: every fan
            has an answer, and nobody agrees. {SITE_NAME} puts each argument to one worldwide vote, with no sign-up, and
            shows the result live, country by country.
          </p>
          <p>
            Pick a debate, cast your vote, and see whether the world agrees with you. The{" "}
            <Link prefetch={false} href="/leaderboard" className="link font-semibold text-ink">
              leaderboard
            </Link>{" "}
            shows who is ahead in each one.
          </p>
        </div>

        <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {[...bySport].map(([category, debates]) => (
            <div key={category}>
              <h3 className="type-label text-mute">The {CATEGORY_LABELS[category]} GOAT</h3>
              <ul className="mt-2 border-t-2 border-ink">
                {debates.map((debate) => (
                  <li key={debate.slug} className="border-b border-rule py-3">
                    <Link prefetch={false} href={`/${debate.slug}`} className="font-semibold transition-opacity duration-[var(--duration-micro)] hover:opacity-70">
                      {debate.title}: {debate.question}
                    </Link>
                    <p className="mt-1 text-sm text-mute">
                      {debate.options.map((o) => o.name).join(" or ")}
                      {hasCabinet(debate.slug) ? (
                        <>
                          {" · "}
                          <Link prefetch={false} href={`/${debate.slug}/trophies`} className="link">
                            Trophies compared
                          </Link>
                        </>
                      ) : null}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "GOAT debates: who is the greatest of all time?",
          itemListElement: DEBATES.map((debate, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: `${debate.title}: ${debate.question}`,
            url: absoluteUrl(`/${debate.slug}`),
          })),
        }}
      />
    </section>
  );
}
