import { NextResponse, type NextRequest } from "next/server";

import { getDebate } from "@/lib/debates";
import { isDatabaseConfigured } from "@/lib/server/config";
import { edgeCacheHeaders, NO_STORE } from "@/lib/server/request";
import { fetchDebateResults } from "@/lib/server/results";

/**
 * Live results, polled by every open page. Responses are shared at the edge
 * for a few seconds, so database load stays flat however many people are
 * watching.
 */
export async function GET(request: NextRequest, ctx: RouteContext<"/api/results/[debate]">) {
  const { debate: slug } = await ctx.params;
  const debate = getDebate(slug);
  if (!debate) {
    return NextResponse.json({ error: "Unknown debate" }, { status: 404, headers: edgeCacheHeaders(300, 3600) });
  }

  // Query strings would fragment the edge cache, so only the bare URL is served.
  if (request.nextUrl.search) {
    return NextResponse.redirect(new URL(request.nextUrl.pathname, request.url), 308);
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Results are unavailable" }, { status: 503, headers: NO_STORE });
  }

  try {
    const results = await fetchDebateResults(debate.slug);
    if (!results) {
      return NextResponse.json({ error: "Unknown debate" }, { status: 404, headers: NO_STORE });
    }
    return NextResponse.json(results, { headers: edgeCacheHeaders(5, 30) });
  } catch (error) {
    console.error(`[results] ${debate.slug}:`, error);
    return NextResponse.json({ error: "Results are unavailable" }, { status: 503, headers: NO_STORE });
  }
}
