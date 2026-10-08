import { NextResponse, type NextRequest } from "next/server";

import { isCardFormat, renderCard } from "@/lib/card/share-card";
import { getDebate, getOption } from "@/lib/debates";
import { edgeCacheHeaders } from "@/lib/server/request";
import { loadCardResults } from "@/lib/server/card-results";

/**
 * Personal share card: /api/card/messi-vs-ronaldo/messi/story
 *
 * The figures on the card are always read from the database here; nothing
 * in the URL can change them.
 */
export async function GET(request: NextRequest, ctx: RouteContext<"/api/card/[debate]/[choice]/[format]">) {
  const { debate: slug, choice, format } = await ctx.params;
  const debate = getDebate(slug);
  const option = debate ? getOption(debate, choice) : undefined;
  if (!debate || !option || !isCardFormat(format)) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: edgeCacheHeaders(300, 3600) });
  }
  if (request.nextUrl.search) {
    return NextResponse.redirect(new URL(request.nextUrl.pathname, request.url), 308);
  }

  const results = await loadCardResults(debate.slug);
  return renderCard({
    debate,
    option,
    results,
    format,
    // Cards with live numbers refresh every minute; if the database was
    // unreachable, the number-free fallback is only cached briefly.
    headers: results ? edgeCacheHeaders(60, 600) : edgeCacheHeaders(10, 60),
  });
}
