import { NextResponse, type NextRequest } from "next/server";

import { isCardFormat, renderPickCard } from "@/lib/card/share-card";
import { getPlayer, pickCardPlayer } from "@/lib/play/players";
import { edgeCacheHeaders } from "@/lib/server/request";

/**
 * Winner card for the elimination game: /api/play/card/yamal/post (4:5),
 * /square, /story or /og (the link preview for the sharer's link). Nothing
 * on the card comes from the URL except which player it is.
 */
export async function GET(request: NextRequest, ctx: RouteContext<"/api/play/card/[player]/[format]">) {
  const { player: slug, format } = await ctx.params;
  const player = getPlayer(slug);
  if (!player || !isCardFormat(format)) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: edgeCacheHeaders(300, 3600) });
  }
  if (request.nextUrl.search) {
    return NextResponse.redirect(new URL(request.nextUrl.pathname, request.url), 308);
  }
  // The card never changes, so it can sit in the edge cache for a long time.
  return renderPickCard({ player: pickCardPlayer(player), format, headers: edgeCacheHeaders(86400, 604800) });
}
