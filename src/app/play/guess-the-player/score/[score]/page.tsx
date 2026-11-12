import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";

import { QUESTIONS_PER_GAME, rankFor } from "@/lib/play/guess";
import { SITE_NAME } from "@/lib/site";

export function generateStaticParams() {
  return Array.from({ length: QUESTIONS_PER_GAME + 1 }, (_, score) => ({ score: String(score) }));
}

function parse(raw: string): number | null {
  const score = /^\d{1,2}$/.test(raw) ? Number(raw) : NaN;
  return score >= 0 && score <= QUESTIONS_PER_GAME ? score : null;
}

export async function generateMetadata({ params }: PageProps<"/play/guess-the-player/score/[score]">): Promise<Metadata> {
  const score = parse((await params).score);
  if (score === null) return {};
  const title = `${rankFor(score, QUESTIONS_PER_GAME)}: ${score}/${QUESTIONS_PER_GAME} on Who is that?`;
  const description = `Name the footballer from the celebration silhouette. Can you beat ${score}/${QUESTIONS_PER_GAME}? Play at ${SITE_NAME}.`;
  const image = { url: `/api/play/shadow/${score}/square`, width: 1080, height: 1080, type: "image/jpeg", alt: title };
  const wide = { ...image, url: `/api/play/shadow/${score}/og`, width: 1200, height: 630 };
  return {
    title: { absolute: `${title} | ${SITE_NAME}` },
    description,
    robots: { index: false, follow: true },
    alternates: { canonical: "/play/guess-the-player" },
    openGraph: { type: "website", url: `/play/guess-the-player/score/${score}`, title, description, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [wide] },
  };
}

/** The page behind a shared score: the score, and a way to try to beat it. */
export default async function ScoreLanding({ params }: PageProps<"/play/guess-the-player/score/[score]">) {
  const score = parse((await params).score);
  if (score === null) notFound();
  return (
    <ViewTransition enter="page" exit="page" default="none">
      <section className="bg-ink px-4 py-14 text-center text-white sm:py-20" aria-label="A shared score">
        <p className="type-overline text-mute-dark">Who is that?</p>
        <h1 className="type-headline mt-3 text-[min(3rem,11vw)] text-warning">{rankFor(score, QUESTIONS_PER_GAME)}</h1>
        <p className="type-display tabular mt-2 text-8xl">
          {score}
          <span className="text-mute-dark">/{QUESTIONS_PER_GAME}</span>
        </p>
        <p className="mx-auto mt-4 max-w-sm text-lg leading-relaxed text-mute-dark">Someone named {score} footballers from nothing but the outline of their celebration. Can you beat that?</p>
        <Link href="/play/guess-the-player" className="btn btn-light mt-8 inline-flex w-full max-w-xs justify-center">
          Beat this score
        </Link>
      </section>
    </ViewTransition>
  );
}
