/**
 * Cloudflare Turnstile: an invisible bot check on votes that works on any
 * host. On when NEXT_PUBLIC_TURNSTILE_SITE_KEY (browser) and
 * TURNSTILE_SECRET_KEY (server) are both set; inlined at build time.
 */
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

export const turnstileEnabled = TURNSTILE_SITE_KEY !== "";
