import Link from "next/link";

const POINTS = [
  {
    title: "One person, one vote",
    body: "No account, no email. Your vote is tied to your browser, and repeat votes are turned away. You can’t change it once it’s cast.",
  },
  {
    title: "Real counts, live",
    body: "Every figure on this site comes straight from the vote database and updates as votes arrive. Nothing is estimated, seeded or rounded up.",
  },
  {
    title: "Country by country",
    body: "Your country is read from your connection at the moment you vote. A country’s split is published once it has enough votes to be meaningful.",
  },
  {
    title: "Protected from manipulation",
    body: "Automated traffic is screened out and bursts of votes from a single network are throttled, so no one can stuff the ballot.",
  },
];

/** How the vote works: the trust layer behind every number on the page. */
export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="border-t border-rule bg-paper-2">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="type-label text-mute">How the vote works</p>
        <h2 id="how-title" className="type-headline mt-3 text-4xl sm:text-5xl">
          A real vote. Nothing else.
        </h2>
        <ol className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {POINTS.map((point, i) => (
            <li key={point.title} className="border-t-2 border-ink pt-5">
              <span className="type-label tabular text-mute">0{i + 1}</span>
              <h3 className="mt-2 text-lg font-bold leading-snug">{point.title}</h3>
              <p className="mt-2 leading-relaxed text-ink/75">{point.body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-10 text-sm text-mute">
          We don’t store IP addresses or ask for personal details.{" "}
          <Link href="/privacy" className="font-semibold text-ink underline underline-offset-4">
            Read the privacy policy
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
