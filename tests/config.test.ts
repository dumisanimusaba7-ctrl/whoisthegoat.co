import { afterEach, describe, expect, it, vi } from "vitest";

async function loadConfig(env: Record<string, string>) {
  vi.resetModules();
  for (const [name, value] of Object.entries(env)) vi.stubEnv(name, value);
  return import("@/lib/server/config");
}

describe("server config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each([
    "https://abcdefghijklmnop.supabase.co",
    "https://abcdefghijklmnop.supabase.co/",
    "https://abcdefghijklmnop.supabase.co/rest/v1",
    "https://abcdefghijklmnop.supabase.co/rest/v1/",
    ' "https://abcdefghijklmnop.supabase.co/rest/v1/" ',
  ])("reads the project URL from %j", async (value) => {
    const { serverConfig } = await loadConfig({ SUPABASE_URL: value });
    expect(serverConfig.supabaseUrl).toBe("https://abcdefghijklmnop.supabase.co");
  });

  it("strips whitespace and quotes pasted around a secret", async () => {
    const { serverConfig, configSources } = await loadConfig({
      SUPABASE_SECRET_KEY: "",
      SUPABASE_SERVICE_ROLE_KEY: " 'sb_secret_abc' \n",
    });
    expect(serverConfig.supabaseSecretKey).toBe("sb_secret_abc");
    expect(configSources.supabaseSecretKey).toBe("SUPABASE_SERVICE_ROLE_KEY");
  });
});
