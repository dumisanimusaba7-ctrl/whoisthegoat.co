import "server-only";

import { turnstileEnabled } from "@/lib/turnstile";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const VERIFY_TIMEOUT_MS = 4000;

/** Whether votes must carry a Turnstile token. */
export function turnstileRequired(): boolean {
  return turnstileEnabled && Boolean(process.env.TURNSTILE_SECRET_KEY);
}

/**
 * "pass" or "fail" from Cloudflare; "error" if Cloudflare couldn't be asked,
 * which the caller treats as a pass so an outage doesn't stop real voters.
 */
export async function verifyTurnstile(token: string, ip: string | null): Promise<"pass" | "fail" | "error"> {
  const form = new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY ?? "", response: token });
  if (ip) form.set("remoteip", ip);
  try {
    const response = await fetch(VERIFY_URL, { method: "POST", body: form, signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = (await response.json()) as { success?: boolean };
    return data.success === true ? "pass" : "fail";
  } catch (error) {
    console.error("[vote] Turnstile check failed:", error);
    return "error";
  }
}
