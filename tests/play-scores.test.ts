import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildQuestions, encodeRun } from "@/lib/play/guess";
import { cleanName, parseBoard } from "@/lib/play/scores";

const submitScore = vi.fn();

vi.mock("@/lib/server/config", () => ({
  serverConfig: { botProtection: false, limits: { perMinute: 10, perDay: 200 }, minCountryVotes: 10 },
  isVotingConfigured: () => true,
  isDatabaseConfigured: () => true,
}));

vi.mock("@/lib/server/scores", () => ({
  submitScore: (...args: unknown[]) => submitScore(...args),
  fetchBoard: vi.fn(),
  getPageBoard: vi.fn(),
}));

const { POST } = await import("@/app/api/play/score/route");

const ORIGIN = "http://localhost:3000";

function scoreRequest(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest(`${ORIGIN}/api/play/score`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: ORIGIN, ...headers },
    body: JSON.stringify(body),
  });
}

/** A real run of 20 questions with `right` of them right, and its code. */
function run(right: number) {
  let n = 0;
  const played = buildQuestions().map((q) => ({ id: q.silhouette.id, right: n++ < right }));
  return encodeRun(played);
}

describe("names on the board", () => {
  it("accepts ordinary names, trims and tidies them", () => {
    expect(cleanName("  Sam  ")).toBe("Sam");
    expect(cleanName("Big   Kev")).toBe("Big Kev");
    expect(cleanName("Zoë_99")).toBe("Zoë_99");
    expect(cleanName("Ibrahimović")).toBe("Ibrahimović");
  });

  it("refuses names that are too short, too long, empty, not text or have odd characters", () => {
    for (const bad of ["", " ", "a", "x".repeat(17), 42, null, undefined, "<b>hi</b>", "http://x.co", "12345", "Sam\u0000"]) expect(cleanName(bad)).toBeNull();
  });

  it("refuses rude names, including look-alike spellings", () => {
    for (const bad of ["fuck you", "SH1T", "f u c k", "n4zi", "Hitler fan", "adm1n", "Big D1ck"]) expect(cleanName(bad)).toBeNull();
  });

  it("reads a board and drops rows that aren't a name and a score", () => {
    expect(parseBoard([{ name: "Sam", score: 12 }, { name: 3, score: 1 }, { name: "Al", score: 1.5 }, null, { name: "Bo", score: -1 }])).toEqual([{ name: "Sam", score: 12 }]);
    expect(parseBoard("nope")).toEqual([]);
  });
});

describe("POST /api/play/score", () => {
  beforeEach(() => {
    submitScore.mockReset();
    submitScore.mockResolvedValue({ status: "new_best", score: 9, rank: 3, country: null, countryRank: null });
  });

  it("sends a valid best to the board with the player's name", async () => {
    const res = await POST(scoreRequest({ game: "guess-the-player", score: 9, run: run(9), name: "Sam" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "new_best", score: 9, rank: 3, country: null, countryRank: null });
    expect(submitScore).toHaveBeenCalledWith(expect.objectContaining({ game: "guess-the-player", name: "Sam", score: 9 }));
    // A new player gets a cookie so their later scores replace this one instead of adding rows.
    expect(res.headers.get("set-cookie")).toContain("wigoat_vid=");
  });

  it("does not set a new cookie for someone who already has one", async () => {
    const res = await POST(scoreRequest({ game: "guess-the-player", score: 9, run: run(9), name: "Sam" }, { cookie: "wigoat_vid=0b6f1c3e-1f4a-4c1d-9a55-0d6f1f5b7a10" }));
    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie")).toBeNull();
  });

  it("rejects requests from other sites", async () => {
    expect((await POST(scoreRequest({ game: "guess-the-player", score: 9, run: run(9), name: "Sam" }, { origin: "https://evil.example" }))).status).toBe(403);
    expect(submitScore).not.toHaveBeenCalled();
  });

  it("rejects a score that doesn't match its run, a score of 0, an impossible score or a bad name", async () => {
    const bad = [
      { game: "guess-the-player", score: 12, run: run(9), name: "Sam" },
      { score: 0, run: run(0), name: "Sam" },
      { score: 21, run: run(9), name: "Sam" },
      { score: 9.5, run: run(9), name: "Sam" },
      { score: 9, run: "nonsense", name: "Sam" },
      { score: 9, name: "Sam" },
      { score: 9, run: run(9), name: "shit" },
      { score: 9, run: run(9) },
    ];
    for (const body of bad) expect((await POST(scoreRequest(body))).status, JSON.stringify(body).slice(0, 60)).toBe(400);
    expect(submitScore).not.toHaveBeenCalled();
  });

  it("takes a quiz score inside its range, with the player's country, and refuses one outside it", async () => {
    submitScore.mockResolvedValue({ status: "new_best", score: 1234, rank: 5, country: "GB", countryRank: 2 });
    const ok = await POST(scoreRequest({ game: "know-your-goats", score: 1234, name: "Sam" }, { "x-vercel-ip-country": "GB" }));
    expect(ok.status).toBe(200);
    expect(await ok.json()).toEqual({ status: "new_best", score: 1234, rank: 5, country: "GB", countryRank: 2 });
    expect(submitScore).toHaveBeenCalledWith(expect.objectContaining({ game: "know-your-goats", score: 1234, country: "GB" }));
    for (const score of [0, 2251, 99999, -5, 12.5]) {
      expect((await POST(scoreRequest({ game: "know-your-goats", score, name: "Sam" }))).status, String(score)).toBe(400);
    }
  });

  it("refuses an unknown game", async () => {
    expect((await POST(scoreRequest({ game: "nope", score: 9, run: run(9), name: "Sam" }))).status).toBe(400);
    expect((await POST(scoreRequest({ score: 9, run: run(9), name: "Sam" }))).status).toBe(400);
  });

  it("says the board is unavailable when the database fails", async () => {
    submitScore.mockRejectedValue(new Error("down"));
    expect((await POST(scoreRequest({ game: "guess-the-player", score: 9, run: run(9), name: "Sam" }))).status).toBe(503);
  });
});
