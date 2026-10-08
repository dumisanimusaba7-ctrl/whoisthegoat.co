import "server-only";

import { isIP } from "node:net";

/**
 * The caller's IP as reported by the platform edge. On Vercel both headers are
 * set by the proxy and cannot be spoofed by the client.
 */
export function clientIp(headers: Headers): string | null {
  const candidates = [
    headers.get("x-real-ip"),
    headers.get("x-forwarded-for")?.split(",")[0],
  ];
  for (const candidate of candidates) {
    const ip = candidate?.trim();
    if (ip && isIP(ip)) return ip;
  }
  return null;
}

/**
 * Groups addresses the way networks hand them out: an IPv4 address on its
 * own, an IPv6 address by its /64 (one subscriber typically owns a whole /64).
 */
export function networkKey(ip: string): string | null {
  const version = isIP(ip);
  if (version === 4) return ip;
  if (version !== 6) return null;

  const mapped = ip.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i);
  if (mapped && isIP(mapped[1]) === 4) return mapped[1];

  const groups = expandIpv6(ip);
  return groups ? `${groups.slice(0, 4).join(":")}::/64` : null;
}

function expandIpv6(ip: string): string[] | null {
  const address = ip.split("%")[0].toLowerCase();
  // An embedded IPv4 tail (e.g. 64:ff9b::1.2.3.4) becomes two hex groups.
  const withoutV4 = address.replace(/(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/, (_, a, b, c, d) => {
    const hi = ((Number(a) << 8) | Number(b)).toString(16);
    const lo = ((Number(c) << 8) | Number(d)).toString(16);
    return `${hi}:${lo}`;
  });

  const [head, tail] = withoutV4.split("::");
  const headGroups = head ? head.split(":") : [];
  const tailGroups = tail !== undefined && tail !== "" ? tail.split(":") : [];
  const missing = 8 - headGroups.length - tailGroups.length;
  if (missing < 0 || (tail === undefined && missing !== 0)) return null;

  const groups = [...headGroups, ...Array(missing).fill("0"), ...tailGroups];
  if (groups.length !== 8 || groups.some((g) => !/^[0-9a-f]{1,4}$/.test(g))) return null;
  return groups.map((g) => g.replace(/^0+(?=.)/, ""));
}

/** Two-letter country code from the edge, or null if unknown. */
export function clientCountry(headers: Headers): string | null {
  const code = (headers.get("x-vercel-ip-country") ?? headers.get("cf-ipcountry") ?? "").toUpperCase();
  return /^[A-Z]{2}$/.test(code) && code !== "XX" ? code : null;
}
