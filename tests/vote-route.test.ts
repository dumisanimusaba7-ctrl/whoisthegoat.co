import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const castVote = vi.fn();

vi.mock("@/lib/server/config", () => ({
  serverConfig: { botProtection: false, limits: { perMinute: 10, perDay: 200 }, minCountryVotes: 10 },
  isVotingConfigured: () => true,
  isDatabaseConfigured: () => true,
}));

vi.mock("@/lib/server/vote", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/server/vote")>()),
  castVote: (...args: unknown[]) => castVote(...args),
}));

const { POST } = await import("@/app/api/vote/route");

const ORIGIN = "http://localhost:3000";

function voteRequest(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest(`${ORIGIN}/api/vote`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: ORIGIN, ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const accepted = {
  status: "ok",
  choice: "messi",
  country: "AR",
  total: 1,
  options: [
    { option: "messi", votes: 1 },
    { option: "ronaldo", votes: 0 },
  ],
};

describe("POST /api/vote", () => {
  beforeEach(() => {
    castVote.mockReset();
    castVote.mockResolvedValue(accepted);
  });

  it("rejects requests from other sites", async () => {
    const res = await POST(voteRequest({ debate: "messi-vs-ronaldo", choice: "messi" }, { origin: "https://evil.example" }));
    expect(res.status).toBe(403);
    expect(castVote).not.toHaveBeenCalled();
  });

  it("rejects requests without browser provenance", async () => {
    const req = new NextRequest(`${ORIGIN}/api/vote`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ debate: "messi-vs-ronaldo", choice: "messi" }),
    });
    expect((await POST(req)).status).toBe(403);
  });

  it("validates the debate and option against the registry", async () => {
    expect((await POST(voteRequest({ debate: "messi-vs-ronaldo", choice: "pele" }))).status).toBe(400);
    expect((await POST(voteRequest({ debate: "nope", choice: "messi" }))).status).toBe(400);
    expect((await POST(voteRequest("not json"))).status).toBe(400);
    expect((await POST(voteRequest("x".repeat(5000)))).status).toBe(400);
    expect(castVote).not.toHaveBeenCalled();
  });

  it("records a vote, derives network and country server-side, and sets the voter cookie", async () => {
    const res = await POST(
      voteRequest(
        { debate: "messi-vs-ronaldo", choice: "messi", country: "PT" },
        { "x-real-ip": "2001:db8:abcd:12::99", "x-vercel-ip-country": "AR" },
      ),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(await res.json()).toMatchObject({ status: "ok", choice: "messi", debate: "messi-vs-ronaldo" });

    const input = castVote.mock.calls[0][0];
    expect(input).toMatchObject({ debate: "messi-vs-ronaldo", choice: "messi", network: "2001:db8:abcd:12::/64", country: "AR" });

    const cookie = res.cookies.get("wigoat_vid");
    expect(cookie?.value).toBe(input.voterId);
    expect(cookie?.httpOnly).toBe(true);
  });

  it("reuses an existing voter id and doesn't reset the cookie", async () => {
    const id = "0b5c8f1e-3a4d-4e2b-9f6a-1c2d3e4f5a6b";
    const res = await POST(voteRequest({ debate: "messi-vs-ronaldo", choice: "ronaldo" }, { cookie: `wigoat_vid=${id}` }));
    expect(castVote.mock.calls[0][0].voterId).toBe(id);
    expect(res.cookies.get("wigoat_vid")).toBeUndefined();
  });

  it("maps database outcomes to HTTP responses", async () => {
    castVote.mockResolvedValueOnce({ status: "rate_limited" });
    const limited = await POST(voteRequest({ debate: "messi-vs-ronaldo", choice: "messi" }));
    expect(limited.status).toBe(429);
    expect(limited.headers.get("retry-after")).toBe("60");

    castVote.mockRejectedValueOnce(new Error("connection refused"));
    vi.spyOn(console, "error").mockImplementationOnce(() => {});
    expect((await POST(voteRequest({ debate: "messi-vs-ronaldo", choice: "messi" }))).status).toBe(503);
  });
});
