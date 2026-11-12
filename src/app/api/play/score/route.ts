import { checkBotId } from "botid/server";
import { NextResponse, type NextRequest } from "next/server";

import { decodeRun } from "@/lib/play/guess";
import { cleanName, GAMES, GUESS_GAME, isGame, QUIZ_GAME, type GameSlug, type ScoreResponse } from "@/lib/play/scores";
import { isVotingConfigured, serverConfig } from "@/lib/server/config";
import { clientCountry } from "@/lib/server/network";
import { isSameOriginRequest, NO_STORE, readJsonBody } from "@/lib/server/request";
import { submitScore } from "@/lib/server/scores";
import { resolveVoterId, VOTER_COOKIE, VOTER_COOKIE_MAX_AGE } from "@/lib/server/vote";

const REJECTIONS = {
  invalid: { status: 400, message: "That score doesn’t look right." },
  forbidden: { status: 403, message: "We couldn’t verify this score. Refresh the page and try again." },
  unavailable: { status: 503, message: "The leaderboard is briefly unavailable. Your best is still saved on this device." },
} as const;

function reject(status: keyof typeof REJECTIONS) {
  const { status: httpStatus, message } = REJECTIONS[status];
  return NextResponse.json<ScoreResponse>({ status, message }, { status: httpStatus, headers: NO_STORE });
}

/** Whether a score is possible for the game: Who is that? needs the run it was made from; the quiz needs a score inside its range. */
function plausible(game: GameSlug, score: number, body: Record<string, unknown>): boolean {
  if (score < 1 || score > GAMES[game].max) return false;
  if (game === GUESS_GAME) return decodeRun(typeof body.run === "string" ? body.run : null, score) !== null;
  return game === QUIZ_GAME;
}

/**
 * Puts a player's best score on a game's board. Only a player's best is ever kept: the database replaces their
 * row only when the new score is higher, so sending a lower one changes nothing. It also files the player under
 * the country the edge network reports, for "you rank #N in your country".
 */
export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) return reject("forbidden");

  const body = (await readJsonBody(request, 2048)) as Record<string, unknown> | undefined;
  const game = typeof body?.game === "string" && isGame(body.game) ? body.game : null;
  const score = typeof body?.score === "number" && Number.isInteger(body.score) ? body.score : null;
  const name = cleanName(body?.name);
  if (!body || !game || score === null || !name || !plausible(game, score, body)) return reject("invalid");

  if (!isVotingConfigured()) return reject("unavailable");

  if (serverConfig.botProtection) {
    try {
      if ((await checkBotId()).isBot) return reject("forbidden");
    } catch (error) {
      // Fail open: a BotID outage shouldn't stop real people.
      console.error("[score] BotID check failed:", error);
    }
  }

  const player = resolveVoterId(request.cookies.get(VOTER_COOKIE)?.value);
  let result;
  try {
    result = await submitScore({ game, playerId: player.id, name, score, country: clientCountry(request.headers) });
  } catch (error) {
    console.error("[score] submit failed:", error);
    return reject("unavailable");
  }
  if (result.status === "invalid") return reject("invalid");

  const response = NextResponse.json<ScoreResponse>(result, { headers: NO_STORE });
  if (player.isNew) {
    response.cookies.set(VOTER_COOKIE, player.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: VOTER_COOKIE_MAX_AGE,
    });
  }
  return response;
}
