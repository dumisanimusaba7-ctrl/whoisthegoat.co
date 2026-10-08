import type { Metadata } from "next";
import { ViewTransition, type ReactNode } from "react";

import { PageHero } from "@/components/layout/page-hero";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: `What ${SITE_NAME} collects when you vote, why, and for how long. No accounts, no names, no emails.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <ViewTransition enter="page" exit="page" default="none">
      <div>
        <PageHero title="Privacy">
          Voting takes one tap and no personal details. This is exactly what we keep, and why.
        </PageHero>
        <article className="bg-paper">
          <div className="mx-auto max-w-3xl px-4 py-14 text-lg leading-relaxed text-ink/85 sm:px-6 sm:py-20">
            <p className="text-sm text-mute">Last updated 8 October 2026</p>

            <Section title="What we collect when you vote">
              <ul className="list-disc space-y-3 pl-5">
                <li>
                  <strong>Your vote</strong>: the debate, the option you chose and the time.
                </li>
                <li>
                  <strong>Your country</strong>: a two-letter country code worked out from your connection by our
                  hosting provider at the moment you vote. We don’t record your city or location.
                </li>
                <li>
                  <strong>A random voter ID</strong>, kept in a first-party cookie (<code>wigoat_vid</code>) for up to
                  400 days. It stops the same browser voting twice. We store only a scrambled, one-way version of it.
                </li>
                <li>
                  <strong>A scrambled network code</strong>: a one-way, keyed hash of your IP address (for IPv6, of its
                  network prefix) used to throttle mass voting from one network. We never store the IP address itself,
                  and the code is erased from each vote after 30 days.
                </li>
              </ul>
              <p>
                We don’t ask for, and don’t want, your name, email address, phone number or any account. Your browser’s
                local storage also remembers your choice so the result is waiting for you when you come back; that stays
                on your device.
              </p>
            </Section>

            <Section title="How it’s used">
              <p>
                Only to count votes, publish the results (overall and by country) and keep the vote fair. A country’s
                split is published only once it has enough votes that no individual vote can be singled out. We don’t
                sell data, and we don’t build profiles.
              </p>
              <p>
                Our lawful basis is legitimate interest: running an accurate, tamper-resistant public vote. The voter
                cookie is strictly necessary for that, so it doesn’t require consent.
              </p>
            </Section>

            <Section title="Service providers">
              <ul className="list-disc space-y-3 pl-5">
                <li>
                  <strong>Vercel</strong> hosts the site. Like any web host it processes IP addresses to deliver pages
                  and to screen out automated traffic (Vercel BotID).
                </li>
                <li>
                  <strong>Supabase</strong> hosts the vote database described above.
                </li>
                <li>
                  <strong>Google AdSense</strong> may show ads on some pages. Google and its partners can use cookies to
                  serve and measure ads. Where the law requires it, you’ll be asked for consent first, and you can
                  manage personalised ads at{" "}
                  <a
                    className="link font-semibold"
                    href="https://adssettings.google.com"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    adssettings.google.com
                  </a>
                  .
                </li>
              </ul>
            </Section>

            <Section title="Your choices">
              <p>
                You can clear the cookie and local storage in your browser at any time. Because we can’t link a vote
                back to a person, we usually can’t find “your” vote on request, but we’ll help where we can.
              </p>
              <p>
                Questions or requests:{" "}
                <a className="link font-semibold" href={`mailto:${CONTACT_EMAIL}`}>
                  {CONTACT_EMAIL}
                </a>
                .
              </p>
            </Section>
          </div>
        </article>
      </div>
    </ViewTransition>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-12 space-y-4">
      <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
      {children}
    </section>
  );
}
