import { NextResponse, type NextRequest } from "next/server";

import { isCardFormat, renderPickCard } from "@/lib/card/share-card";
import { decodeOrder, getPlayer, pickCardPlayer } from "@/lib/play/players";
import { edgeCacheHeaders } from "@/lib/server/request";

/**
 * Winner card for the elimination game: /api/play/card/yamal/post (4:5),
 * /square, /story or /og (the link preview for the sharer's link). The only
 * things the URL can set are which player it is and, with ?o=, the order they
 * knocked the others out: a code that must be exactly the other 14 players,
 * each once, or it is ignored. No text from the URL ever reaches the card.
 */
export async function GET(request: NextRequest, ctx: RouteContext<"/api/play/card/[player]/[format]">) {
  const { player: slug, format } = await ctx.params;
  const player = getPlayer(slug);
  if (!player || !isCardFormat(format)) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: edgeCacheHeaders(300, 3600) });
  }
  const code = request.nextUrl.searchParams.get("o");
  const order = decodeOrder(code, player.slug);
  // One URL per card: anything but a lone valid ?o= is sent to the clean one.
  if (request.nextUrl.search && (!order || request.nextUrl.searchParams.size > 1)) {
    return NextResponse.redirect(new URL(`${request.nextUrl.pathname}${order ? `?o=${code}` : ""}`, request.url), 308);
  }
  // The card never changes, so it can sit in the edge cache for a long time.
  return renderPickCard({ player: pickCardPlayer(player, order), format, headers: edgeCacheHeaders(86400, 604800) });
}
