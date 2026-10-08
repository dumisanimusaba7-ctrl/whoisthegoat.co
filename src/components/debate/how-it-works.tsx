import Link from "next/link";

const POINTS = [
  {
    title: "One vote each",
    body: "No account or email. Your vote is tied to your browser, repeat votes are turned away, and a vote can’t be changed once it’s cast.",
  },
  {
    title: "Real counts",
    body: "Every figure on this site comes straight from the vote database and updates as votes arrive. Nothing is estimated or seeded.",
  },
  {
    title: "By country",
    body: "Your country is read from your connection when you vote. A country’s split is published once it has enough votes to be meaningful.",
  },
  {
    title: "Hard to rig",
    body: "Automated traffic is screened out, and bursts of votes from a single network are throttled.",
  },
];

/** How the vote works: the trust layer behind every number on the page. */
export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="border-t border-rule bg-paper">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
        <div>
          <h2 id="how-title" className="type-title">
            How the vote works
          </h2>
          <p className="mt-3 max-w-sm leading-relaxed text-mute">
            We don’t store IP addresses or ask for personal details.{" "}
            <Link href="/privacy" className="link font-semibold text-ink">
              Privacy
            </Link>
          </p>
        </div>
        <dl className="grid gap-x-10 gap-y-7 sm:grid-cols-2">
          {POINTS.map((point) => (
            <div key={point.title}>
              <dt className="font-semibold">{point.title}</dt>
              <dd className="mt-1.5 leading-relaxed text-ink/75">{point.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
