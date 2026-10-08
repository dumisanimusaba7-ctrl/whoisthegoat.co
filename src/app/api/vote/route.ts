import { randomUUID } from "node:crypto";

import { checkBotId } from "botid/server";
import { NextResponse, type NextRequest } from "next/server";

import { getDebate, getOption } from "@/lib/debates";
import { isVotingConfigured, serverConfig } from "@/lib/server/config";
import { clientCountry, clientIp, networkKey } from "@/lib/server/network";
import { isSameOriginRequest, NO_STORE, readJsonBody } from "@/lib/server/request";
import { castVote, resolveVoterId, VOTER_COOKIE, VOTER_COOKIE_MAX_AGE } from "@/lib/server/vote";
import { voteTestMode } from "@/lib/test-mode";
import type { VoteRejected, VoteResponse } from "@/lib/vote-api";

const REJECTIONS: Record<VoteRejected["status"], { status: number; message: string }> = {
  invalid: { status: 400, message: "That vote doesn’t match this debate." },
  forbidden: { status: 403, message: "We couldn’t verify this vote. Refresh the page and try again." },
  closed: { status: 409, message: "Voting on this debate has closed." },
  rate_limited: {
    status: 429,
    message: "Too many votes from your network right now. Please try again in a little while.",
  },
  unavailable: { status: 503, message: "Voting is briefly unavailable. Please try again in a moment." },
};

function reject(status: VoteRejected["status"]) {
  const { status: httpStatus, message } = REJECTIONS[status];
  const headers: Record<string, string> = { ...NO_STORE };
  if (status === "rate_limited") headers["Retry-After"] = "60";
  return NextResponse.json<VoteResponse>({ status, message }, { status: httpStatus, headers });
}

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) return reject("forbidden");

  const body = (await readJsonBody(request)) as Record<string, unknown> | undefined;
  const debate = typeof body?.debate === "string" ? getDebate(body.debate) : undefined;
  const choice = debate && typeof body?.choice === "string" ? getOption(debate, body.choice) : undefined;
  if (!debate || !choice) return reject("invalid");

  if (!isVotingConfigured()) {
    console.error("[vote] Voting is not configured: check SUPABASE_URL, SUPABASE_SECRET_KEY and VOTE_HASH_SECRET");
    return reject("unavailable");
  }

  if (serverConfig.botProtection) {
    try {
      const verification = await checkBotId();
      if (verification.isBot) return reject("forbidden");
    } catch (error) {
      // Fail open: a BotID outage shouldn't stop real people voting. Network
      // rate limits still apply.
      console.error("[vote] BotID check failed:", error);
    }
  }

  // In test mode every vote counts as a new voter, and no cookie is left behind.
  const voter = voteTestMode
    ? { id: randomUUID(), isNew: false }
    : resolveVoterId(request.cookies.get(VOTER_COOKIE)?.value);
  const ip = clientIp(request.headers);

  let result;
  try {
    result = await castVote({
      debate: debate.slug,
      choice: choice.slug,
      voterId: voter.id,
      network: ip ? networkKey(ip) : null,
      country: clientCountry(request.headers),
    });
  } catch (error) {
    console.error("[vote] cast_vote failed:", error);
    return reject("unavailable");
  }

  if (result.status !== "ok" && result.status !== "already_voted") return reject(result.status);

  const response = NextResponse.json<VoteResponse>({ ...result, debate: debate.slug }, { headers: NO_STORE });
  if (voter.isNew) {
    response.cookies.set(VOTER_COOKIE, voter.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: VOTER_COOKIE_MAX_AGE,
    });
  }
  return response;
}
