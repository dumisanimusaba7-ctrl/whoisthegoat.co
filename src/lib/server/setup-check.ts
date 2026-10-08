import "server-only";

import { formatCount, pluralize } from "@/lib/format";

import { configSources, isDatabaseConfigured, MIN_VOTE_HASH_SECRET_LENGTH, serverConfig } from "./config";
import { getSupabase } from "./supabase";

/**
 * A plain-language report of whether this deployment can take votes, served
 * at /api/health. It never prints a key or secret: only whether each setting
 * is present and the right kind, and what the database said when asked.
 */

export type CheckStatus = "ok" | "problem" | "skipped" | "info";
export type Check = { name: string; status: CheckStatus; detail: string };

const SETUP_SCRIPT = "supabase/migrations/20261008120000_voting.sql";

type Deployment = { environment: string; branch: string | null; commit: string | null };

export function currentDeployment(): Deployment {
  return {
    environment: process.env.VERCEL_ENV ?? (process.env.NODE_ENV === "production" ? "not on Vercel" : "development"),
    branch: process.env.VERCEL_GIT_COMMIT_REF ?? null,
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
  };
}

/** Where to add a missing variable, for the environment this deployment runs in. */
function missingHint(name: string, environment: string): string {
  if (environment === "production" || environment === "preview" || environment === "development") {
    const label = environment[0].toUpperCase() + environment.slice(1);
    return `Not set for this deployment. In Vercel → Settings → Environment Variables, add ${name} and tick ${label}, then redeploy.`;
  }
  return `Not set. Add ${name} to the environment, then restart.`;
}

/** Shows enough of the project address to recognise it, without publishing it. */
function maskHost(host: string): string {
  const [ref, ...rest] = host.split(".");
  if (ref.length <= 8) return host;
  return [`${ref.slice(0, 4)}…${ref.slice(-4)}`, ...rest].join(".");
}

export function checkSupabaseUrl(value: string, environment: string): Check {
  const name = "SUPABASE_URL";
  if (!value) return { name, status: "problem", detail: missingHint(name, environment) };

  if (/^postgres(ql)?:/i.test(value)) {
    return {
      name,
      status: "problem",
      detail:
        "This is the database connection string. Use the Project URL instead, shaped like https://<project-ref>.supabase.co (Supabase → Project Settings → Data API).",
    };
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return {
      name,
      status: "problem",
      detail: "Not a web address. Use the Project URL, shaped like https://<project-ref>.supabase.co.",
    };
  }

  if (/(^|\.)supabase\.com$/i.test(url.hostname)) {
    return {
      name,
      status: "problem",
      detail:
        "This is a Supabase dashboard address. Use the Project URL, shaped like https://<project-ref>.supabase.co (Supabase → Project Settings → Data API).",
    };
  }
  if (url.pathname !== "/" && url.pathname !== "") {
    return {
      name,
      status: "problem",
      detail: `Remove "${url.pathname}" from the end. Use just https://${maskHost(url.hostname)}.`,
    };
  }
  if (url.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(url.hostname)) {
    return { name, status: "problem", detail: "Must start with https://." };
  }

  const from =
    configSources.supabaseUrl && configSources.supabaseUrl !== name ? ` (from ${configSources.supabaseUrl})` : "";
  return { name, status: "ok", detail: `${url.protocol}//${maskHost(url.host)}${from}` };
}

/** Reads the role out of a legacy Supabase JWT key without verifying it. */
function jwtRole(key: string): string | null {
  const parts = key.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as { role?: unknown };
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

export function checkSecretKey(value: string, environment: string): Check {
  const name = "SUPABASE_SECRET_KEY";
  if (!value) return { name, status: "problem", detail: missingHint(name, environment) };

  const from =
    configSources.supabaseSecretKey && configSources.supabaseSecretKey !== name
      ? ` (from ${configSources.supabaseSecretKey})`
      : "";
  const wrongKey =
    "Supabase → Project Settings → API Keys: use the secret key (sb_secret_…), or the service_role key under Legacy API keys.";

  if (value.startsWith("sb_publishable_")) {
    return { name, status: "problem", detail: `This is the publishable (public) key, which can't vote. ${wrongKey}` };
  }
  if (value.startsWith("sb_secret_")) {
    return { name, status: "ok", detail: `Secret key (sb_secret_…)${from}` };
  }

  const role = jwtRole(value);
  if (role === "service_role") return { name, status: "ok", detail: `Legacy service_role key${from}` };
  if (role === "anon") {
    return { name, status: "problem", detail: `This is the anon (public) key, which can't vote. ${wrongKey}` };
  }
  if (role) return { name, status: "problem", detail: `This key has the role "${role}". ${wrongKey}` };
  return {
    name,
    status: "problem",
    detail: `This doesn't look like a Supabase key; check it was copied in full. ${wrongKey}`,
  };
}

export function checkHashSecret(value: string, environment: string): Check {
  const name = "VOTE_HASH_SECRET";
  if (!value) return { name, status: "problem", detail: missingHint(name, environment) };
  if (value.length < MIN_VOTE_HASH_SECRET_LENGTH) {
    return {
      name,
      status: "problem",
      detail: `Only ${value.length} characters; it needs at least ${MIN_VOTE_HASH_SECRET_LENGTH}. Generate one with: openssl rand -hex 32`,
    };
  }
  return { name, status: "ok", detail: `Set (${value.length} characters)` };
}

type DatabaseError = { message?: string; code?: string; details?: string | null; hint?: string | null };

/** Turns what Supabase (or the network) said into the step that fixes it. */
export function explainDatabaseError(error: DatabaseError, httpStatus?: number): string {
  const text = [error.message, error.details, error.hint].filter(Boolean).join(" ");
  const raw = (error.message ?? "unknown error").slice(0, 200);

  if (error.code === "PGRST202" || /could not find the function/i.test(text)) {
    return `The vote functions aren't in this database. Run ${SETUP_SCRIPT} in the SQL Editor of the Supabase project this URL points to. If you already have, run: notify pgrst, 'reload schema';`;
  }
  if (error.code === "42P01" || /relation .* does not exist/i.test(text)) {
    return `The vote tables are missing. Run ${SETUP_SCRIPT} in the SQL Editor.`;
  }
  if (error.code === "PGRST106" || /schema must be one of/i.test(text)) {
    return "The Data API isn't serving the public schema. In Supabase → Project Settings → Data API, turn the Data API on and make sure `public` is an exposed schema.";
  }
  if (error.code === "42501" || /permission denied/i.test(text)) {
    return "This key isn't allowed to run the vote functions. Use the secret key or the service_role key, not the anon or publishable key.";
  }
  if (httpStatus === 401 || /invalid api key|jwt|unauthorized|no api key/i.test(text)) {
    return "Supabase rejected the key. Check it was copied in full and comes from the same project as SUPABASE_URL.";
  }
  if (/timeout|timed out|aborted/i.test(text)) {
    return "Supabase didn't answer within 8 seconds. The project may be paused or restoring: check it in the Supabase dashboard.";
  }
  if (/fetch failed|enotfound|getaddrinfo|econnrefused|network/i.test(text)) {
    return "Couldn't reach Supabase at this URL. Check SUPABASE_URL, and that the project isn't paused.";
  }
  if (httpStatus === 404) {
    return "Supabase answered 404. Check SUPABASE_URL, and that the Data API is turned on (Project Settings → Data API).";
  }
  return `Supabase returned an error: ${raw}`;
}

async function checkResults(): Promise<Check> {
  const name = "Database: results";
  try {
    const { data, error, status } = await getSupabase().rpc("get_debate_results", {
      p_debate_slug: "messi-vs-ronaldo",
      p_country_limit: 0,
    });
    if (error) return { name, status: "problem", detail: explainDatabaseError(error, status) };
    if (data === null) {
      return {
        name,
        status: "problem",
        detail: `The Messi vs Ronaldo debate isn't in the database. Run the "Launch debate" inserts at the end of ${SETUP_SCRIPT}.`,
      };
    }
    const result = data as { status?: string; total?: number };
    if (result.status !== "live") {
      return {
        name,
        status: "problem",
        detail: `The debate's status is "${result.status}". Open it with: update public.debates set status = 'live' where slug = 'messi-vs-ronaldo';`,
      };
    }
    const total = result.total ?? 0;
    return { name, status: "ok", detail: `Readable: ${formatCount(total)} ${pluralize(total, "vote")} so far` };
  } catch (error) {
    return { name, status: "problem", detail: explainDatabaseError({ message: String(error) }) };
  }
}

/**
 * Asks the vote function about a debate that doesn't exist: it answers
 * "unknown debate" without writing anything, which proves this key may vote.
 */
async function checkVoting(): Promise<Check> {
  const name = "Database: voting";
  try {
    const { data, error, status } = await getSupabase().rpc("cast_vote", {
      p_debate_slug: "setup-check-not-a-debate",
      p_option_slug: "none",
      p_voter_hash: "0".repeat(32),
    });
    if (error) return { name, status: "problem", detail: explainDatabaseError(error, status) };
    if ((data as { status?: string } | null)?.status === "unknown_debate") {
      return { name, status: "ok", detail: "This key can cast votes" };
    }
    return {
      name,
      status: "problem",
      detail: `Unexpected answer from cast_vote: ${JSON.stringify(data).slice(0, 200)}`,
    };
  } catch (error) {
    return { name, status: "problem", detail: explainDatabaseError({ message: String(error) }) };
  }
}

export async function runSetupCheck(): Promise<{ deployment: Deployment; checks: Check[]; ready: boolean }> {
  const deployment = currentDeployment();
  const settings = [
    checkSupabaseUrl(serverConfig.supabaseUrl, deployment.environment),
    checkSecretKey(serverConfig.supabaseSecretKey, deployment.environment),
    checkHashSecret(serverConfig.voteHashSecret, deployment.environment),
  ];

  const canReachDatabase = isDatabaseConfigured() && settings[0].status === "ok";
  const database: Check[] = canReachDatabase
    ? await Promise.all([checkResults(), checkVoting()])
    : [
        { name: "Database: results", status: "skipped", detail: "Fix SUPABASE_URL and SUPABASE_SECRET_KEY first." },
        { name: "Database: voting", status: "skipped", detail: "Fix SUPABASE_URL and SUPABASE_SECRET_KEY first." },
      ];

  const extras: Check[] = [
    { name: "Bot protection", status: "info", detail: serverConfig.botProtection ? "On (Vercel BotID)" : "Off" },
    {
      name: "Test mode",
      status: "info",
      detail: process.env.NEXT_PUBLIC_VOTE_TEST_MODE === "1" ? "On: turn it off before launch" : "Off",
    },
  ];

  const checks = [...settings, ...database, ...extras];
  const ready = checks.every((check) => check.status === "ok" || check.status === "info");
  return { deployment, checks, ready };
}

export function formatSetupReport({ deployment, checks, ready }: Awaited<ReturnType<typeof runSetupCheck>>): string {
  const where = [
    `Deployment: ${deployment.environment}`,
    deployment.branch ? `branch ${deployment.branch}` : null,
    deployment.commit ? `commit ${deployment.commit}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const label: Record<CheckStatus, string> = { ok: "OK", problem: "PROBLEM", skipped: "SKIPPED", info: "INFO" };
  const width = Math.max(...checks.map((check) => check.name.length));
  const rows = checks.map((check) => `${label[check.status].padEnd(8)} ${check.name.padEnd(width)}  ${check.detail}`);

  const verdict = ready
    ? "Voting is ready."
    : "Voting is NOT ready. Fix the PROBLEM lines, then redeploy (Vercel only applies variable changes to new deployments).";

  return ["WHOISTHEGOAT.CO setup check", where, "", ...rows, "", verdict, ""].join("\n");
}
