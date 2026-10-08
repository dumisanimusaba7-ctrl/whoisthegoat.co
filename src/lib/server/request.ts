import "server-only";

import { getSiteUrl } from "@/lib/site";

/**
 * Votes must come from our own pages. Browsers always send `Origin` on a
 * cross-origin or POST fetch and `Sec-Fetch-Site` on modern engines, so a
 * request with neither did not come from a browser on this site.
 */
export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (origin) {
    const allowed = new Set([new URL(request.url).origin, getSiteUrl().origin]);
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    if (host) {
      const proto = request.headers.get("x-forwarded-proto") ?? new URL(request.url).protocol.replace(":", "");
      allowed.add(`${proto}://${host}`);
    }
    return allowed.has(origin);
  }
  return request.headers.get("sec-fetch-site") === "same-origin";
}

/** Reads a small JSON body, refusing anything oversized or not JSON. */
export async function readJsonBody(request: Request, maxBytes = 1024): Promise<unknown> {
  const type = request.headers.get("content-type") ?? "";
  if (!type.toLowerCase().startsWith("application/json")) return undefined;
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > maxBytes) return undefined;

  const text = await request.text();
  if (text.length > maxBytes) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

/**
 * CDN cache headers for public, frequently changing responses. Browsers
 * always revalidate; the edge serves a shared copy for `edgeSeconds` and may
 * keep serving it while refreshing in the background.
 */
export function edgeCacheHeaders(edgeSeconds: number, staleSeconds: number): Record<string, string> {
  return {
    "Cache-Control": `public, max-age=0, s-maxage=${edgeSeconds}, stale-while-revalidate=${staleSeconds}`,
  };
}

export const NO_STORE = { "Cache-Control": "no-store" } as const;
