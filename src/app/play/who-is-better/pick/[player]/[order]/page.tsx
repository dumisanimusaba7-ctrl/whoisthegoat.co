import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PickLanding, pickMetadata } from "@/components/play/pick-landing";
import { decodeOrder, encodeOrder, getPlayer, PLAYERS } from "@/lib/play/players";

// There is one URL per knock-out order (billions of them), so most are rendered when first asked for.
// Params are read up front, so a bad code or player is a true 404.
export const instant = false;

/** One example order per player is built ahead of time; every other order is built when first asked for. */
export function generateStaticParams() {
  return PLAYERS.flatMap((player) => {
    const order = encodeOrder(PLAYERS.filter((other) => other !== player).map((other) => other.slug), player.slug);
    return order ? [{ player: player.slug, order }] : [];
  });
}

async function resolve(params: PageProps<"/play/who-is-better/pick/[player]/[order]">["params"]) {
  const { player: slug, order } = await params;
  const player = getPlayer(slug);
  return player && decodeOrder(order, player.slug) ? { player, code: order } : null;
}

export async function generateMetadata({ params }: PageProps<"/play/who-is-better/pick/[player]/[order]">): Promise<Metadata> {
  const found = await resolve(params);
  return found ? pickMetadata(found.player, found.code) : { title: "Page not found" };
}

export default async function SharedOrderedPickPage({ params }: PageProps<"/play/who-is-better/pick/[player]/[order]">) {
  const found = await resolve(params);
  if (!found) notFound();
  return <PickLanding player={found.player} />;
}
