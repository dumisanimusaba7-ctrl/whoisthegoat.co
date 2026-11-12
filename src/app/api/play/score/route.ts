import { checkBotId } from "botid/server";
import { NextResponse, type NextRequest } from "next/server";

import { decodeRun, QUESTIONS_PER_GAME } from "@/lib/play/guess";
import { cleanName, GUESS_GAME, type ScoreResponse } from "@/lib/play/scores";
import { isVotingConfigured, serverConfig } from "@/lib/server/config";
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

/**
 * Puts a player's best score on the Who is that? board. Only a player's best is ever kept: the database
 * replaces their row only when the new score is higher, so sending a lower one changes nothing. The score
 * must come with the run it was made from (the 20 silhouettes and which were right), which has to add up.
 */
export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) return reject("forbidden");

  const body = (await readJsonBody(request, 2048)) as Record<string, unknown> | undefined;
  const score = typeof body?.score === "number" && Number.isInteger(body.score) ? body.score : null;
  const name = cleanName(body?.name);
  if (score === null || score < 1 || score > QUESTIONS_PER_GAME || !name) return reject("invalid");
  if (!decodeRun(typeof body?.run === "string" ? body.run : null, score)) return reject("invalid");

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
    result = await submitScore({ game: GUESS_GAME, playerId: player.id, name, score });
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
