import "server-only";

import { cacheLife } from "next/cache";

import { parseResults, type DebateResults } from "@/lib/results";

import { isDatabaseConfigured, serverConfig } from "./config";
import { getSupabase } from "./supabase";

/**
 * Reads live results straight from the database. Throws if the database is
 * unreachable; returns null if the debate doesn't exist there.
 */
export async function fetchDebateResults(slug: string): Promise<DebateResults | null> {
  const { data, error } = await getSupabase().rpc("get_debate_results", {
    p_debate_slug: slug,
    p_min_country_votes: serverConfig.minCountryVotes,
  });
  if (error) throw new Error(`get_debate_results failed: ${error.message}`);
  if (data === null) return null;

  const results = parseResults(data);
  if (!results) throw new Error("get_debate_results returned an unexpected payload");
  return results;
}

/**
 * Results for server-rendered pages. Cached briefly so pages can be
 * prerendered and served from the CDN; the browser then keeps the numbers
 * live by polling the results API. Returns null when unavailable so pages
 * still render (the client fetches as soon as it hydrates).
 */
export async function getPageResults(slug: string): Promise<DebateResults | null> {
  "use cache";
  // `stale` ≥ 5 min keeps the snapshot in the instant App Shell; the page polls
  // live numbers on load, so the client never relies on it for long.
  cacheLife({ stale: 300, revalidate: 30, expire: 3600 });

  if (!isDatabaseConfigured()) return null;
  try {
    return await fetchDebateResults(slug);
  } catch (error) {
    console.error(`[results] ${slug}:`, error);
    return null;
  }
}
