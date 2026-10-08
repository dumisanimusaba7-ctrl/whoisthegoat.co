import { adsensePublisherId } from "@/lib/ads";

/**
 * Authorized Digital Sellers file for Google AdSense, generated from
 * NEXT_PUBLIC_ADSENSE_CLIENT so it can never drift from the ad tags.
 */
export function GET() {
  const publisher = adsensePublisherId();
  if (!publisher) return new Response("Not found", { status: 404 });
  return new Response(`google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
