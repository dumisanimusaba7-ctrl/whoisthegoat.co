import { NextResponse, type NextRequest } from "next/server";

import { renderCard } from "@/lib/card/share-card";
import { getDebate } from "@/lib/debates";
import { loadCardResults } from "@/lib/server/card-results";
import { edgeCacheHeaders } from "@/lib/server/request";

/** Link-preview image for a debate: /api/og/messi-vs-ronaldo */
export async function GET(request: NextRequest, ctx: RouteContext<"/api/og/[debate]">) {
  const { debate: slug } = await ctx.params;
  const debate = getDebate(slug);
  if (!debate) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: edgeCacheHeaders(300, 3600) });
  }
  if (request.nextUrl.search) {
    return NextResponse.redirect(new URL(request.nextUrl.pathname, request.url), 308);
  }

  const results = await loadCardResults(debate.slug);
  return renderCard({
    debate,
    results,
    format: "og",
    headers: results ? edgeCacheHeaders(300, 3600) : edgeCacheHeaders(10, 60),
  });
}
