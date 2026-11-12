import { NextResponse, type NextRequest } from "next/server";

import { GUESS_GAME } from "@/lib/play/scores";
import { isDatabaseConfigured } from "@/lib/server/config";
import { edgeCacheHeaders, NO_STORE } from "@/lib/server/request";
import { fetchBoard } from "@/lib/server/scores";

/** The Who is that? board, best first. Shared at the edge for a minute so the database sees little of it. */
export async function GET(request: NextRequest) {
  // Query strings would fragment the edge cache, so only the bare URL is served.
  if (request.nextUrl.search) return NextResponse.redirect(new URL(request.nextUrl.pathname, request.url), 308);
  if (!isDatabaseConfigured()) return NextResponse.json({ error: "The leaderboard is unavailable" }, { status: 503, headers: NO_STORE });
  try {
    return NextResponse.json({ game: GUESS_GAME, scores: await fetchBoard(GUESS_GAME) }, { headers: edgeCacheHeaders(60, 300) });
  } catch (error) {
    console.error("[scores] board failed:", error);
    return NextResponse.json({ error: "The leaderboard is unavailable" }, { status: 503, headers: NO_STORE });
  }
}
