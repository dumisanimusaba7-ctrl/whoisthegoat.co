import "server-only";

import type { DebateResults } from "@/lib/results";

import { isDatabaseConfigured } from "./config";
import { fetchDebateResults } from "./results";

/** Results for image cards. A card without numbers beats a broken image. */
export async function loadCardResults(slug: string): Promise<DebateResults | null> {
  if (!isDatabaseConfigured()) return null;
  try {
    return await fetchDebateResults(slug);
  } catch (error) {
    console.error(`[card] ${slug}:`, error);
    return null;
  }
}
