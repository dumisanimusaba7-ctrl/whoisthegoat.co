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

/**
 * The slim bar at the top of every page. Wide screens get the 728×90 above.
 * Phones need a 320×50 unit (create one in Adsterra and set its key as
 * NEXT_PUBLIC_ADSTERRA_BAR_PHONE_KEY); until then they get no top bar, rather
 * than a 250px box pushing the vote down.
 */
export const ADSTERRA_BAR_PHONE = process.env.NEXT_PUBLIC_ADSTERRA_BAR_PHONE_KEY
  ? ({ key: process.env.NEXT_PUBLIC_ADSTERRA_BAR_PHONE_KEY, width: 320, height: 50 } as const)
  : null;

export type AdsterraBanner = { readonly key: string; readonly width: number; readonly height: number };

/** Screens at least this wide get the 728×90; narrower ones get the 300×250. */
export const WIDE_BANNER_MIN_WIDTH = 800;

const FRAME_STYLE =
  "<style>html,body{margin:0;padding:0;background:transparent;overflow:hidden}</style>";

// Reports the frame's content height to the page, which sizes the iframe to it.
const REPORT_HEIGHT = `<script>(function(){function p(){parent.postMessage({wigoatAd:true,height:document.documentElement.scrollHeight},"*")}if(window.ResizeObserver)new ResizeObserver(p).observe(document.body);addEventListener("load",p);setTimeout(p,1500);setTimeout(p,4000)})()</script>`;

function page(body: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><base target="_blank">${FRAME_STYLE}</head><body>${body}${REPORT_HEIGHT}</body></html>`;
}

/** The document an ad frame loads: Adsterra's own snippet, alone, so units never share globals. */
export function nativeFrameHtml(): string {
  return page(
    `<script async="async" data-cfasync="false" src="${ADSTERRA_NATIVE.script}"></script><div id="${ADSTERRA_NATIVE.container}"></div>`,
  );
}

export function bannerFrameHtml(banner: AdsterraBanner): string {
  return page(
    `<script>atOptions={'key':'${banner.key}','format':'iframe','height':${banner.height},'width':${banner.width},'params':{}};</script><script src="https://bicea.org/22/${banner.key}"></script>`,
  );
}
