import { adsensePublisherId } from "@/lib/ads";

/**
 * Authorized Digital Sellers file for Google AdSense. The publisher id comes from NEXT_PUBLIC_ADSENSE_CLIENT so it
 * can't drift from the ad tags; this account's own id is the fallback, so the line is always served, even if that
 * setting is missing on a deploy. (Publisher ids are public: they are in every page's ad tag.)
 */
const PUBLISHER_FALLBACK = "pub-8456046525908134";

export function GET() {
  const publisher = adsensePublisherId() ?? PUBLISHER_FALLBACK;
  return new Response(`google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
