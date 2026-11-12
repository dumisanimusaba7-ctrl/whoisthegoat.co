import { NextResponse, type NextRequest } from "next/server";

import { isGame } from "@/lib/play/scores";
import { isDatabaseConfigured } from "@/lib/server/config";
import { edgeCacheHeaders, NO_STORE } from "@/lib/server/request";
import { fetchBoard } from "@/lib/server/scores";

/** A game's board, best first. Shared at the edge for a minute so the database sees little of it. */
export async function GET(request: NextRequest, ctx: RouteContext<"/api/play/scores/[game]">) {
  const { game } = await ctx.params;
  if (!isGame(game)) return NextResponse.json({ error: "Not found" }, { status: 404, headers: edgeCacheHeaders(300, 3600) });
  // Query strings would fragment the edge cache, so only the bare URL is served.
  if (request.nextUrl.search) return NextResponse.redirect(new URL(request.nextUrl.pathname, request.url), 308);
  if (!isDatabaseConfigured()) return NextResponse.json({ error: "The leaderboard is unavailable" }, { status: 503, headers: NO_STORE });
  try {
    return NextResponse.json({ game, scores: await fetchBoard(game) }, { headers: edgeCacheHeaders(60, 300) });
  } catch (error) {
    console.error(`[scores] ${game} board failed:`, error);
    return NextResponse.json({ error: "The leaderboard is unavailable" }, { status: 503, headers: NO_STORE });
  }
}
