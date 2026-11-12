import { NextResponse, type NextRequest } from "next/server";

import { isCardFormat } from "@/lib/card/share-card";
import { renderShadowCard } from "@/lib/card/shadow-card";
import { decodeRun, QUESTIONS_PER_GAME } from "@/lib/play/guess";
import { edgeCacheHeaders } from "@/lib/server/request";

/**
 * Score card for the silhouette game: /api/play/shadow/17/post (4:5), /square or /og (link previews).
 * The URL can set the score (a whole number from 0 to the number of questions) and, with ?r=, the
 * run: the 20 silhouettes played and which were right, which must add up to the score or it is
 * ignored. No text from the URL ever reaches the card.
 */
export async function GET(request: NextRequest, ctx: RouteContext<"/api/play/shadow/[score]/[format]">) {
  const { score: rawScore, format } = await ctx.params;
  const score = /^\d{1,2}$/.test(rawScore) ? Number(rawScore) : NaN;
  if (!(score >= 0 && score <= QUESTIONS_PER_GAME) || !isCardFormat(format) || format === "story") {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: edgeCacheHeaders(300, 3600) });
  }
  const code = request.nextUrl.searchParams.get("r");
  const played = decodeRun(code, score);
  // One URL per card: anything but a lone valid ?r= is sent to the clean one.
  if (request.nextUrl.search && (!played || request.nextUrl.searchParams.size > 1)) {
    return NextResponse.redirect(new URL(`${request.nextUrl.pathname}${played ? `?r=${code}` : ""}`, request.url), 308);
  }
  return renderShadowCard({ score, total: QUESTIONS_PER_GAME, played, format, headers: edgeCacheHeaders(86400, 604800) });
}
