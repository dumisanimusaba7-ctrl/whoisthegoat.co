import "server-only";

import { cacheLife } from "next/cache";

import { BOARD_SIZE, parseBoard, type ScoreRow } from "@/lib/play/scores";

import { isDatabaseConfigured } from "./config";
import { pseudonymize } from "./vote";
import { getSupabase } from "./supabase";

export type SubmitResult = { status: "new_best" | "not_higher"; score: number; rank: number } | { status: "invalid" };

/** Records a player's score if it beats their best. Throws if the database can't be reached. */
export async function submitScore(input: { game: string; playerId: string; name: string; score: number }): Promise<SubmitResult> {
  const { data, error } = await getSupabase().rpc("submit_game_score", {
    p_game: input.game,
    p_player_hash: pseudonymize("voter", `${input.game}:${input.playerId}`),
    p_name: input.name,
    p_score: input.score,
  });
  if (error) throw new Error(`submit_game_score failed: ${error.message}`);
  const payload = (data ?? {}) as Record<string, unknown>;
  if (payload.status === "invalid") return { status: "invalid" };
  if ((payload.status === "new_best" || payload.status === "not_higher") && typeof payload.score === "number" && typeof payload.rank === "number") {
    return { status: payload.status, score: payload.score, rank: payload.rank };
  }
  throw new Error(`submit_game_score returned an unexpected payload: ${JSON.stringify(payload)}`);
}

/** The top of a game's board, best first. Throws if the database can't be reached. */
export async function fetchBoard(game: string, limit: number = BOARD_SIZE): Promise<ScoreRow[]> {
  const { data, error } = await getSupabase().rpc("top_game_scores", { p_game: game, p_limit: limit });
  if (error) throw new Error(`top_game_scores failed: ${error.message}`);
  return parseBoard(data);
}

/** The board for server-rendered pages: cached briefly, and empty when the database isn't available. */
export async function getPageBoard(game: string): Promise<ScoreRow[]> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 60, expire: 3600 });
  if (!isDatabaseConfigured()) return [];
  try {
    return await fetchBoard(game);
  } catch (error) {
    console.error(`[scores] ${game}:`, error);
    return [];
  }
}
