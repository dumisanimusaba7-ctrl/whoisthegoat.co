/**
 * Adsterra ad units. The keys are public (they sit in every page's HTML), so
 * they live here. Set NEXT_PUBLIC_ADSTERRA_DISABLED=1 to switch every Adsterra
 * ad off. Google AdSense, when configured (see ads.ts), takes the slots it has
 * ids for; everything else shows Adsterra.
 */
export const adsterraEnabled = process.env.NEXT_PUBLIC_ADSTERRA_DISABLED !== "1";

/** Native banner: a row of article-style links. Height varies, so it's measured. */
export const ADSTERRA_NATIVE = {
  script: "https://bicea.org/21/c647b932b167884c21a6111229d18825",
  container: "container-c647b932b167884c21a6111229d18825",
} as const;

/** Display banners: 728×90 for wide screens, 300×250 for phones. */
export const ADSTERRA_BANNERS = {
  wide: { key: "d0b4121d6c73266b352c8ea8d7a27846", width: 728, height: 90 },
  square: { key: "9e448eb09eef246334956c5f157cf2dc", width: 300, height: 250 },
} as const;

/** The slim bar on phones (320×50): the top of every page, and between sections. */
export const ADSTERRA_BAR_PHONE = { key: "215edbc755480cc5b0d45c4f4e9557c9", width: 320, height: 50 } as const;

export type AdsterraBanner = { readonly key: string; readonly width: number; readonly height: number };

/** Screens at least this wide get the 728×90; narrower ones get the 300×250. */
export const WIDE_BANNER_MIN_WIDTH = 800;

/** Adsterra's script for a display banner; it reads the global `atOptions` as it runs. */
export function bannerScriptUrl(banner: AdsterraBanner): string {
  return `https://bicea.org/22/${banner.key}`;
}
