import { describe, expect, it } from "vitest";

import {
  checkHashSecret,
  checkSecretKey,
  checkSupabaseUrl,
  explainDatabaseError,
  formatSetupReport,
} from "@/lib/server/setup-check";

function fakeJwt(payload: object): string {
  const part = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${part({ alg: "HS256", typ: "JWT" })}.${part(payload)}.signature`;
}

describe("setup check", () => {
  describe("SUPABASE_URL", () => {
    it("says where to add a missing value for this deployment", () => {
      const check = checkSupabaseUrl("", "preview");
      expect(check.status).toBe("problem");
      expect(check.detail).toContain("tick Preview");
    });

    it("accepts a project URL and masks the project ref", () => {
      const check = checkSupabaseUrl("https://abcdefghijklmnop.supabase.co", "production");
      expect(check).toMatchObject({ status: "ok", detail: "https://abcd…mnop.supabase.co" });
    });

    it.each([
      ["postgresql://postgres:pw@db.abcdefghijklmnop.supabase.co:5432/postgres", "connection string"],
      ["https://supabase.com/dashboard/project/abcdefghijklmnop", "dashboard address"],
      ["https://abcdefghijklmnop.supabase.co/rest/v1", 'Remove "/rest/v1"'],
      ["http://abcdefghijklmnop.supabase.co", "https://"],
      ["abcdefghijklmnop", "Not a web address"],
    ])("explains what's wrong with %s", (value, expected) => {
      const check = checkSupabaseUrl(value, "production");
      expect(check.status).toBe("problem");
      expect(check.detail).toContain(expected);
    });
  });

  describe("SUPABASE_SECRET_KEY", () => {
    it("accepts the secret key and the legacy service_role key", () => {
      expect(checkSecretKey("sb_secret_abc123", "production").status).toBe("ok");
      expect(checkSecretKey(fakeJwt({ role: "service_role" }), "production").status).toBe("ok");
    });

    it("rejects the public keys by name", () => {
      expect(checkSecretKey("sb_publishable_abc123", "production").detail).toContain("publishable (public) key");
      expect(checkSecretKey(fakeJwt({ role: "anon" }), "production").detail).toContain("anon (public) key");
    });

    it("flags something that isn't a key", () => {
      expect(checkSecretKey("not-a-key", "production").status).toBe("problem");
    });
  });

  describe("VOTE_HASH_SECRET", () => {
    it("needs at least 32 characters", () => {
      expect(checkHashSecret("short", "production").detail).toContain("Only 5 characters");
      expect(checkHashSecret("a".repeat(64), "production")).toMatchObject({
        status: "ok",
        detail: "Set (64 characters)",
      });
    });
  });

  describe("database errors", () => {
    it.each([
      [
        { code: "PGRST202", message: "Could not find the function public.cast_vote" },
        undefined,
        "Run supabase/migrations",
      ],
      [{ code: "42501", message: "permission denied for function cast_vote" }, undefined, "isn't allowed"],
      [{ message: "Invalid API key" }, 401, "rejected the key"],
      [{ message: "TypeError: fetch failed" }, undefined, "Couldn't reach Supabase"],
      [{ message: "TimeoutError: The operation was aborted due to timeout" }, undefined, "didn't answer"],
      [{ code: "PGRST106", message: "The schema must be one of the following: graphql_public" }, 406, "Data API"],
    ])("explains %o", (error, status, expected) => {
      expect(explainDatabaseError(error, status)).toContain(expected);
    });
  });

  it("reports whether voting is ready", () => {
    const report = formatSetupReport({
      deployment: { environment: "preview", branch: "main", commit: "abc1234" },
      checks: [
        { name: "SUPABASE_URL", status: "ok", detail: "https://abcd…mnop.supabase.co" },
        { name: "VOTE_HASH_SECRET", status: "problem", detail: "Only 5 characters" },
      ],
      ready: false,
    });
    expect(report).toContain("Deployment: preview · branch main · commit abc1234");
    expect(report).toMatch(/PROBLEM\s+VOTE_HASH_SECRET\s+Only 5 characters/);
    expect(report).toContain("Voting is NOT ready.");
  });
});
