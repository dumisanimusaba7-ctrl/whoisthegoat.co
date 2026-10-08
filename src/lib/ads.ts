/**
 * Google AdSense configuration. Ads render only when a client id and the
 * slot for a placement are set, so the site ships clean until AdSense
 * approves the domain.
 */
export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "";

export const AD_SLOTS = {
  /** Below the live result, after the share card. Never near the vote buttons. */
  results: process.env.NEXT_PUBLIC_ADSENSE_SLOT_RESULTS ?? "",
  /** Between editorial sections lower on the page. */
  editorial: process.env.NEXT_PUBLIC_ADSENSE_SLOT_EDITORIAL ?? "",
} as const;

export type AdPlacement = keyof typeof AD_SLOTS;

export function adsEnabled(): boolean {
  return /^ca-pub-\d{10,20}$/.test(ADSENSE_CLIENT);
}

/** "ca-pub-123" → "pub-123", as ads.txt expects. */
export function adsensePublisherId(): string | null {
  return adsEnabled() ? ADSENSE_CLIENT.replace(/^ca-/, "") : null;
}
