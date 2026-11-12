import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PickLanding, pickMetadata } from "@/components/play/pick-landing";
import { getPlayer, PLAYERS } from "@/lib/play/players";

// Every real URL here is fully prerendered, like the shared-vote pages.
export const instant = false;

/** A shared winner without a knock-out order (older links, and the fallback). */
export function generateStaticParams() {
  return PLAYERS.map((player) => ({ player: player.slug }));
}

async function resolve(params: PageProps<"/play/who-is-better/pick/[player]">["params"]) {
  const { player: slug } = await params;
  return getPlayer(slug) ?? null;
}

export async function generateMetadata({ params }: PageProps<"/play/who-is-better/pick/[player]">): Promise<Metadata> {
  const player = await resolve(params);
  return player ? pickMetadata(player) : { title: "Page not found" };
}

export default async function SharedPickPage({ params }: PageProps<"/play/who-is-better/pick/[player]">) {
  const player = await resolve(params);
  if (!player) notFound();
  return <PickLanding player={player} />;
}
