import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";

import { WhoIsBetter } from "@/components/play/who-is-better";
import { fullName, getPlayer, PLAYERS } from "@/lib/play/players";
import { SITE_NAME } from "@/lib/site";

// Every real URL here is fully prerendered, like the shared-vote pages.
export const instant = false;

/**
 * Landing page for a shared winner. The link preview shows the sharer's card;
 * the page is the game, so whoever taps it can play straight away.
 */
export function generateStaticParams() {
  return PLAYERS.map((player) => ({ player: player.slug }));
}

async function resolve(params: PageProps<"/play/who-is-better/pick/[player]">["params"]) {
  const { player: slug } = await params;
  return getPlayer(slug) ?? null;
}

export async function generateMetadata({ params }: PageProps<"/play/who-is-better/pick/[player]">): Promise<Metadata> {
  const player = await resolve(params);
  if (!player) return { title: "Page not found" };
  const title = `My ultimate player is ${fullName(player)}. Who is yours?`;
  const description = `I knocked out ${PLAYERS.length - 1} footballers to get to ${player.name}. Play Who is better? at ${SITE_NAME} and see who you end up with.`;
  const image = { url: `/api/play/card/${player.slug}/square`, width: 1080, height: 1080, type: "image/jpeg", alt: title };
  const wide = { ...image, url: `/api/play/card/${player.slug}/og`, width: 1200, height: 630 };
  return {
    title: { absolute: `${title} | ${SITE_NAME}` },
    description,
    robots: { index: false, follow: true },
    alternates: { canonical: "/play/who-is-better" },
    openGraph: { type: "website", url: `/play/who-is-better/pick/${player.slug}`, title, description, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [wide] },
  };
}

export default async function SharedPickPage({ params }: PageProps<"/play/who-is-better/pick/[player]">) {
  const player = await resolve(params);
  if (!player) notFound();

  return (
    <ViewTransition enter="page" exit="page" default="none">
      <div>
        <p className="bg-ink px-4 pt-6 text-center text-sm text-white/80">
          Someone picked <strong>{fullName(player)}</strong> as their ultimate player.{" "}
          <Link href="/play/who-is-better" className="link">
            Play your own
          </Link>
        </p>
        <section className="bg-ink text-white" aria-label="The game">
          <WhoIsBetter />
        </section>
      </div>
    </ViewTransition>
  );
}
