import { NextResponse, type NextRequest } from "next/server";

import { isGame } from "@/lib/play/scores";
import { isDatabaseConfigured } from "@/lib/server/config";
import { edgeCacheHeaders, NO_STORE } from "@/lib/server/request";
import { fetchBoard } from "@/lib/server/scores";

/** A game's board for one country (a two-letter code), best first. */
export async function GET(request: NextRequest, ctx: RouteContext<"/api/play/scores/[game]/[country]">) {
  const { game, country } = await ctx.params;
  const code = country.toUpperCase();
  if (!isGame(game) || !/^[A-Z]{2}$/.test(country)) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: edgeCacheHeaders(300, 3600) });
  }
  // One URL per board: lower-case codes and query strings go to the clean one.
  if (request.nextUrl.search || country !== code) return NextResponse.redirect(new URL(`/api/play/scores/${game}/${code}`, request.url), 308);
  if (!isDatabaseConfigured()) return NextResponse.json({ error: "The leaderboard is unavailable" }, { status: 503, headers: NO_STORE });
  try {
    return NextResponse.json({ game, country: code, scores: await fetchBoard(game, 20, code) }, { headers: edgeCacheHeaders(60, 300) });
  } catch (error) {
    console.error(`[scores] ${game}/${code} board failed:`, error);
    return NextResponse.json({ error: "The leaderboard is unavailable" }, { status: 503, headers: NO_STORE });
  }
}
