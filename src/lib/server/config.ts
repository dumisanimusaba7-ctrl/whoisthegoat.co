import "server-only";

import { botProtectionEnabled } from "@/lib/bot-protection";

function positiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * The first variable that's set, cleaned of the surrounding whitespace and
 * quotes that copying a value into a dashboard can bring along. Each value is
 * passed in with a literal `process.env.X` so Next.js can resolve it.
 */
function firstSet(...candidates: [name: string, value: string | undefined][]): { name: string; value: string } | null {
  for (const [name, raw] of candidates) {
    const value = raw
      ?.trim()
      .replace(/^(["'])(.*)\1$/, "$2")
      .trim();
    if (value) return { name, value };
  }
  return null;
}

const supabaseUrl = firstSet(
  ["SUPABASE_URL", process.env.SUPABASE_URL],
  ["NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL],
);
// New-style secret key (sb_secret_…) or the legacy service_role JWT.
const supabaseSecretKey = firstSet(
  ["SUPABASE_SECRET_KEY", process.env.SUPABASE_SECRET_KEY],
  ["SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY],
);
const voteHashSecret = firstSet(["VOTE_HASH_SECRET", process.env.VOTE_HASH_SECRET]);

/** Which variable each setting was read from, for the setup check. */
export const configSources = {
  supabaseUrl: supabaseUrl?.name ?? null,
  supabaseSecretKey: supabaseSecretKey?.name ?? null,
  voteHashSecret: voteHashSecret?.name ?? null,
};

export const serverConfig = {
  supabaseUrl: (supabaseUrl?.value ?? "").replace(/\/+$/, ""),
  supabaseSecretKey: supabaseSecretKey?.value ?? "",
  /** HMAC key for voter and network hashes. Rotating it lets everyone vote again. */
  voteHashSecret: voteHashSecret?.value ?? "",
  limits: {
    perMinute: positiveInt(process.env.VOTE_LIMIT_PER_MINUTE, 10),
    perDay: positiveInt(process.env.VOTE_LIMIT_PER_DAY, 200),
  },
  /** Country splits are only published once a country has this many votes. */
  minCountryVotes: positiveInt(process.env.MIN_COUNTRY_VOTES, 10),
  /** Enforce Vercel BotID on votes (Vercel deployments only). */
  botProtection: botProtectionEnabled,
};

export function isDatabaseConfigured(): boolean {
  return Boolean(serverConfig.supabaseUrl && serverConfig.supabaseSecretKey);
}

export const MIN_VOTE_HASH_SECRET_LENGTH = 32;

export function isVotingConfigured(): boolean {
  return isDatabaseConfigured() && serverConfig.voteHashSecret.length >= MIN_VOTE_HASH_SECRET_LENGTH;
}
