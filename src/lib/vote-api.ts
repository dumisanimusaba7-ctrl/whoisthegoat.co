import type { OptionTally } from "./results";

/** Request body for POST /api/vote. */
export type VoteRequest = { debate: string; choice: string };

export type VoteAccepted = {
  status: "ok" | "already_voted";
  debate: string;
  /** The option this voter is counted for (their original choice if they had already voted). */
  choice: string;
  /** Country the vote was attributed to, if known. */
  country: string | null;
  total: number;
  options: OptionTally[];
};

export type VoteRejected = {
  status: "rate_limited" | "closed" | "invalid" | "forbidden" | "unavailable";
  message: string;
};

export type VoteResponse = VoteAccepted | VoteRejected;

export function isVoteAccepted(response: VoteResponse): response is VoteAccepted {
  return response.status === "ok" || response.status === "already_voted";
}
