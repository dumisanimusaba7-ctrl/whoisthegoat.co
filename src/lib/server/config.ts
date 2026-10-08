import "server-only";

import { botProtectionEnabled } from "@/lib/bot-protection";

function positiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const serverConfig = {
  supabaseUrl: process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  // New-style secret key (sb_secret_…) or the legacy service_role JWT.
  supabaseSecretKey: process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  /** HMAC key for voter and network hashes. Rotating it lets everyone vote again. */
  voteHashSecret: process.env.VOTE_HASH_SECRET ?? "",
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

export function isVotingConfigured(): boolean {
  return isDatabaseConfigured() && serverConfig.voteHashSecret.length >= 32;
}
