import Link from "next/link";
import { Fragment } from "react";

import type { Debate } from "@/lib/debates";
import { hasCabinet } from "@/lib/trophies";

/** Editorial context for the debate: intro, tale of the tape, the case for each side. */
export function AboutDebate({ debate }: { debate: Debate }) {
  const [a, b] = debate.options;
  return (
    <section id="about" aria-labelledby="about-title" className="border-t border-rule bg-paper">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <h2 id="about-title" className="type-title">
          About the debate
        </h2>

        <div className="mt-8 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="space-y-5 text-lg leading-relaxed text-ink/80 lg:col-span-5">
            {debate.intro.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>

          <div className="lg:col-span-7">
            <table className="w-full border-collapse">
              <caption className="mb-4 text-left text-sm font-semibold text-mute">Major honours</caption>
              <thead>
                <tr className="border-b-2 border-ink">
                  <th scope="col" className="pb-3 text-left">
                    <PlayerHeading name={a.shortName} color={a.color} />
                  </th>
                  <th scope="col" className="pb-3">
                    <span className="sr-only">Honour</span>
                  </th>
                  <th scope="col" className="pb-3 text-right">
                    <PlayerHeading name={b.shortName} color={b.color} align="end" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {debate.taleOfTheTape.map((row) => {
                  const numeric = row.values.every((v) => /^\d+$/.test(v));
                  if (numeric) {
                    return (
                      <tr key={row.label} className="border-b border-rule">
                        <td className="type-display w-1/4 py-4 pr-3 text-left text-4xl sm:text-5xl">{row.values[0]}</td>
                        <th scope="row" className="type-label px-2 py-4 text-center font-medium text-mute">
                          {row.label}
                        </th>
                        <td className="type-display w-1/4 py-4 pl-3 text-right text-4xl sm:text-5xl">{row.values[1]}</td>
                      </tr>
                    );
                  }
                  // Text rows get the full width: label on top, each side's honours below.
                  return (
                    <Fragment key={row.label}>
                      <tr>
                        <th scope="colgroup" colSpan={3} className="type-label pt-5 text-center font-medium text-mute">
                          {row.label}
                        </th>
                      </tr>
                      <tr className="border-b border-rule">
                        <td className="pb-4 pr-3 pt-2 align-top text-sm font-semibold sm:text-base">{row.values[0]}</td>
                        <td aria-hidden="true" />
                        <td className="pb-4 pl-3 pt-2 text-right align-top text-sm font-semibold sm:text-base">{row.values[1]}</td>
                      </tr>
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
            <p className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 text-sm text-mute">
              As of {debate.factsAsOf}.
              {hasCabinet(debate.slug) ? (
                <Link href={`/${debate.slug}/trophies`} className="link inline-flex min-h-11 items-center font-semibold text-ink">
                  Every trophy, side by side
                </Link>
              ) : null}
            </p>
          </div>
        </div>

        <div className="mt-14 grid gap-px bg-rule sm:grid-cols-2">
          {debate.options.map((option) => (
            <article key={option.slug} className="bg-paper py-8 sm:px-8 sm:first:pl-0 sm:last:pr-0">
              <span aria-hidden="true" className="block h-1 w-10" style={{ background: option.color }} />
              <h3 className="mt-5 text-lg font-bold">The case for {option.shortName}</h3>
              <ul className="mt-4 space-y-3 leading-relaxed text-ink/80">
                {option.caseFor.map((point) => (
                  <li key={point} className="flex gap-3">
                    <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 bg-ink" />
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlayerHeading({ name, color, align = "start" }: { name: string; color: string; align?: "start" | "end" }) {
  return (
    <span className={`flex items-center gap-2 text-sm font-semibold text-ink ${align === "end" ? "justify-end" : ""}`}>
      <span aria-hidden="true" className="size-2.5" style={{ background: color }} />
      {name}
    </span>
  );
}
