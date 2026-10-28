import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const castVote = vi.fn();
const verifyTurnstile = vi.fn();

vi.mock("@/lib/server/config", () => ({
  serverConfig: { botProtection: false, limits: { perMinute: 10, perDay: 200 }, minCountryVotes: 10 },
  isVotingConfigured: () => true,
  isDatabaseConfigured: () => true,
}));

vi.mock("@/lib/server/vote", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/server/vote")>()),
  castVote: (...args: unknown[]) => castVote(...args),
}));

vi.mock("@/lib/server/turnstile", () => ({
  turnstileRequired: () => true,
  verifyTurnstile: (...args: unknown[]) => verifyTurnstile(...args),
}));

const { POST } = await import("@/app/api/vote/route");

const ORIGIN = "http://localhost:3000";

function voteRequest(body: unknown) {
  return new NextRequest(`${ORIGIN}/api/vote`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: ORIGIN },
    body: JSON.stringify(body),
  });
}

describe("POST /api/vote with Turnstile on", () => {
  beforeEach(() => {
    castVote.mockReset();
    castVote.mockResolvedValue({ status: "ok", choice: "messi", country: null, total: 1, options: [] });
    verifyTurnstile.mockReset();
  });

  it("refuses a vote without a token", async () => {
    const res = await POST(voteRequest({ debate: "messi-vs-ronaldo", choice: "messi" }));
    expect(res.status).toBe(403);
    expect(castVote).not.toHaveBeenCalled();
  });

  it("refuses a vote whose token Cloudflare rejects", async () => {
    verifyTurnstile.mockResolvedValue("fail");
    const res = await POST(voteRequest({ debate: "messi-vs-ronaldo", choice: "messi", turnstile: "bad" }));
    expect(res.status).toBe(403);
    expect(castVote).not.toHaveBeenCalled();
  });

  it("counts a vote with a valid token", async () => {
    verifyTurnstile.mockResolvedValue("pass");
    const res = await POST(voteRequest({ debate: "messi-vs-ronaldo", choice: "messi", turnstile: "good" }));
    expect(res.status).toBe(200);
    expect(castVote).toHaveBeenCalledOnce();
  });

  it("lets the vote through when Cloudflare can't be reached", async () => {
    verifyTurnstile.mockResolvedValue("error");
    const res = await POST(voteRequest({ debate: "messi-vs-ronaldo", choice: "messi", turnstile: "any" }));
    expect(res.status).toBe(200);
  });
});
