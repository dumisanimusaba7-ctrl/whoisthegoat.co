import "server-only";

import { createHmac, randomUUID } from "node:crypto";

import { parseResults, type OptionTally } from "@/lib/results";
import type { VoteAccepted, VoteRejected } from "@/lib/vote-api";

import { serverConfig } from "./config";
import { getSupabase } from "./supabase";

export const VOTER_COOKIE = "wigoat_vid";
/** Browsers cap cookie lifetimes at 400 days. */
export const VOTER_COOKIE_MAX_AGE = 400 * 24 * 60 * 60;

const VOTER_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** Returns the voter id from the cookie, or a fresh one if it's missing or malformed. */
export function resolveVoterId(cookieValue: string | undefined): { id: string; isNew: boolean } {
  if (cookieValue && VOTER_ID_PATTERN.test(cookieValue)) return { id: cookieValue, isNew: false };
  return { id: randomUUID(), isNew: true };
}

/** Keyed, truncated hash so raw identifiers never reach the database. */
export function pseudonymize(kind: "voter" | "network", value: string): string {
  return createHmac("sha256", serverConfig.voteHashSecret)
    .update(`${kind}:${value}`)
    .digest("hex")
    .slice(0, 32);
}

type CastVoteInput = {
  debate: string;
  choice: string;
  voterId: string;
  network: string | null;
  country: string | null;
};

export type CastVoteResult = Omit<VoteAccepted, "debate"> | { status: VoteRejected["status"] };

export async function castVote(input: CastVoteInput): Promise<CastVoteResult> {
  const { data, error } = await getSupabase().rpc("cast_vote", {
    p_debate_slug: input.debate,
    p_option_slug: input.choice,
    p_voter_hash: pseudonymize("voter", input.voterId),
    p_network_hash: input.network ? pseudonymize("network", input.network) : null,
    p_country_code: input.country,
    p_limit_per_minute: serverConfig.limits.perMinute,
    p_limit_per_day: serverConfig.limits.perDay,
  });
  if (error) throw new Error(`cast_vote failed: ${error.message}`);

  const payload = (data ?? {}) as Record<string, unknown>;
  switch (payload.status) {
    case "ok":
    case "already_voted": {
      // Reuse the results validator for the totals that come back with the vote.
      const totals = parseResults({ debate: input.debate, total: payload.total, options: payload.options });
      if (!totals || typeof payload.choice !== "string") {
        throw new Error("cast_vote returned an unexpected payload");
      }
      return {
        status: payload.status,
        choice: payload.choice,
        country: typeof payload.country === "string" ? payload.country : null,
        total: totals.total,
        options: totals.options satisfies OptionTally[],
      };
    }
    case "rate_limited":
      return { status: "rate_limited" };
    case "closed":
      return { status: "closed" };
    case "unknown_debate":
    case "unknown_option":
      return { status: "invalid" };
    default:
      throw new Error(`cast_vote returned an unknown status: ${String(payload.status)}`);
  }
}
