/**
 * Vercel BotID only works on Vercel deployments, and the browser and server
 * halves must agree: a protected request without the client challenge is
 * treated as a bot. Both read this one flag, inlined at build time.
 * Set NEXT_PUBLIC_BOTID_DISABLED=1 to switch it off everywhere.
 */
export const botProtectionEnabled =
  Boolean(process.env.NEXT_PUBLIC_VERCEL_ENV) && process.env.NEXT_PUBLIC_BOTID_DISABLED !== "1";

export const PROTECTED_ROUTES = [{ path: "/api/vote", method: "POST" as const }];
