import type { Metadata } from "next";
import Link from "next/link";
import { ViewTransition } from "react";

import { WhoIsBetter } from "@/components/play/who-is-better";
import { fullName, type PlayPlayer, PLAYERS } from "@/lib/play/players";
import { SITE_NAME } from "@/lib/site";

/** Link-preview metadata for a shared winner; `code` is the knock-out order, when the link has one. */
export function pickMetadata(player: PlayPlayer, code?: string): Metadata {
  const title = `My ultimate player is ${fullName(player)}. Who is yours?`;
  const description = `I knocked out ${PLAYERS.length - 1} footballers to get to ${player.name}. Play Who is better? at ${SITE_NAME} and see who you end up with.`;
  const query = code ? `?o=${code}` : "";
  // Square for chat apps, shown big like an Instagram post; X crops to 2:1, so it gets the wide card.
  const image = { url: `/api/play/card/${player.slug}/square${query}`, width: 1080, height: 1080, type: "image/jpeg", alt: title };
  const wide = { ...image, url: `/api/play/card/${player.slug}/og${query}`, width: 1200, height: 630 };
  return {
    title: { absolute: `${title} | ${SITE_NAME}` },
    description,
    robots: { index: false, follow: true },
    alternates: { canonical: "/play/who-is-better" },
    openGraph: { type: "website", url: `/play/who-is-better/pick/${player.slug}${code ? `/${code}` : ""}`, title, description, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [wide] },
  };
}

/** The page behind a shared winner: a line about them, then the game. */
export function PickLanding({ player }: { player: PlayPlayer }) {
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
