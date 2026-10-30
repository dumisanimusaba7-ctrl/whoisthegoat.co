"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import {
  ADSTERRA_BANNERS,
  ADSTERRA_BAR_PHONE,
  ADSTERRA_NATIVE,
  bannerScriptUrl,
  WIDE_BANNER_MIN_WIDTH,
  type AdsterraBanner,
} from "@/lib/adsterra";

/**
 * Adsterra's snippets, run in the page as Adsterra's instructions have them
 * (it checks which site an ad appears on, so they can't run in a blank frame).
 * Each ad loads as it nears the screen.
 */

/** True once the element is near the screen: ads load as people scroll to them, not up front. */
function useNearScreen<T extends Element>() {
  // A callback ref, so watching starts whenever the element appears (it may render a moment after mount).
  const [el, ref] = useState<T | null>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    if (!el || near) return;
    if (!("IntersectionObserver" in window)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNear(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [el, near]);
  return [el, ref, near] as const;
}

function subscribeWide(callback: () => void) {
  const query = window.matchMedia(`(min-width: ${WIDE_BANNER_MIN_WIDTH}px)`);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

const isWide = () => window.matchMedia(`(min-width: ${WIDE_BANNER_MIN_WIDTH}px)`).matches;

// Every banner snippet sets one global, `atOptions`, which its script reads as
// it runs. Loading them one at a time stops two banners reading each other's.
let queue: Promise<void> = Promise.resolve();

function loadBanner(container: HTMLElement, banner: AdsterraBanner) {
  queue = queue.then(
    () =>
      new Promise<void>((resolve) => {
        if (!container.isConnected) return resolve();
        const options = document.createElement("script");
        options.text = `atOptions = ${JSON.stringify({ key: banner.key, format: "iframe", height: banner.height, width: banner.width, params: {} })};`;
        const script = document.createElement("script");
        script.src = bannerScriptUrl(banner);
        let settled = false;
        const next = () => {
          if (settled) return;
          settled = true;
          resolve();
        };
        script.onload = () => setTimeout(next, 50);
        script.onerror = next;
        // Never hold up the next banner for long (a blocked or slow script).
        setTimeout(next, 4000);
        container.append(options, script);
      }),
  );
}

function Banner({ banner, reserve }: { banner: AdsterraBanner | null; reserve: string }) {
  const [el, ref, near] = useNearScreen<HTMLDivElement>();
  useEffect(() => {
    if (!near || !el || !banner) return;
    loadBanner(el, banner);
    return () => {
      el.replaceChildren();
    };
  }, [near, el, banner]);
  if (!banner) return null;
  // Space is reserved so nothing jumps when the ad arrives.
  return <div ref={ref} key={banner.key} className={`flex items-start justify-center overflow-hidden ${reserve}`} />;
}

/** A display banner: the 728×90 on wide screens, the 300×250 on phones. Only one is ever loaded. */
export function AdsterraBannerUnit() {
  const wide = useSyncExternalStore(subscribeWide, isWide, () => false);
  return <Banner banner={wide ? ADSTERRA_BANNERS.wide : ADSTERRA_BANNERS.square} reserve="min-h-[250px] min-[800px]:min-h-[90px]" />;
}

/** A slim bar: the 728×90 on wide screens, the 320×50 on phones. */
export function AdsterraBarUnit() {
  const wide = useSyncExternalStore(subscribeWide, isWide, () => false);
  const banner = wide ? ADSTERRA_BANNERS.wide : ADSTERRA_BAR_PHONE;
  return <Banner banner={banner} reserve={wide ? "min-h-[90px]" : "min-h-[50px]"} />;
}

// The native banner fills one fixed element id, so only one can be on a page at
// a time; any other native placement shows a display banner instead.
let nativeTaken = false;

/** A native banner: Adsterra's row of article-style ads. */
export function AdsterraNativeUnit() {
  const [el, ref, near] = useNearScreen<HTMLDivElement>();
  const [mine, setMine] = useState<boolean | null>(null);

  useEffect(() => {
    if (nativeTaken) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMine(false);
      return;
    }
    nativeTaken = true;
    setMine(true);
    return () => {
      nativeTaken = false;
    };
  }, []);

  useEffect(() => {
    if (!near || !el || !mine) return;
    const holder = document.createElement("div");
    holder.id = ADSTERRA_NATIVE.container;
    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = ADSTERRA_NATIVE.script;
    el.append(script, holder);
    return () => {
      el.replaceChildren();
    };
  }, [near, el, mine]);

  if (mine === false) return <AdsterraBannerUnit />;
  return <div ref={ref} className="min-h-[200px]" />;
}
