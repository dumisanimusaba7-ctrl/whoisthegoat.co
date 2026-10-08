import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { isDatabaseConfigured, serverConfig } from "./config";

const REQUEST_TIMEOUT_MS = 8_000;

let client: SupabaseClient | null = null;

/**
 * Server-side Supabase client using the secret (service role) key. The
 * database exposes nothing to the anon key, so this is the only way in.
 */
export function getSupabase(): SupabaseClient {
  if (!isDatabaseConfigured()) {
    throw new Error("Supabase is not configured: set SUPABASE_URL and SUPABASE_SECRET_KEY");
  }
  client ??= createClient(serverConfig.supabaseUrl, serverConfig.supabaseSecretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          // Opt out of Next.js's fetch cache: callers decide what to cache (see
          // getPageResults). Otherwise a cached scope would also persist the raw
          // response under the default 15-minute lifetime.
          cache: "no-store",
          // Never let a slow database hold a function open indefinitely.
          signal: init?.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        }),
    },
  });
  return client;
}
