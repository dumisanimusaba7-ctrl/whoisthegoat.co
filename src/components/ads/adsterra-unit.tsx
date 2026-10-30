"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import {
  ADSTERRA_BANNERS,
  bannerFrameHtml,
  nativeFrameHtml,
  WIDE_BANNER_MIN_WIDTH,
} from "@/lib/adsterra";

// The ad's own scripts run inside a frame: they can't touch the page, can only
// open a new tab when someone taps, and can't redirect the page by themselves.
const SANDBOX = "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation";

/** True once the element is near the screen: ads load as people scroll to them, not up front. */
function useNearScreen<T extends Element>() {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
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
  }, [near]);
  return [ref, near] as const;
}

function subscribeWide(callback: () => void) {
  const query = window.matchMedia(`(min-width: ${WIDE_BANNER_MIN_WIDTH}px)`);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

const isWide = () => window.matchMedia(`(min-width: ${WIDE_BANNER_MIN_WIDTH}px)`).matches;

/** A display banner: the 728×90 on wide screens, the 300×250 on phones. Only one is ever loaded. */
export function AdsterraBannerUnit() {
  const [ref, near] = useNearScreen<HTMLDivElement>();
  const wide = useSyncExternalStore(subscribeWide, isWide, () => false);
  const banner = wide ? ADSTERRA_BANNERS.wide : ADSTERRA_BANNERS.square;
  return (
    // Space is reserved for the taller phone banner so nothing jumps when it loads.
    <div ref={ref} className="flex min-h-[250px] items-start justify-center min-[800px]:min-h-[90px]">
      {near ? (
        <iframe
          key={banner.key}
          title="Advertisement"
          srcDoc={bannerFrameHtml(banner)}
          width={banner.width}
          height={banner.height}
          sandbox={SANDBOX}
          loading="lazy"
          scrolling="no"
          className="block max-w-full border-0"
        />
      ) : null}
    </div>
  );
}

/** A native banner. Its height depends on the ads it gets, so the frame reports it and grows to fit. */
export function AdsterraNativeUnit() {
  const [ref, near] = useNearScreen<HTMLDivElement>();
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!near) return;
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow) return;
      const data = event.data as { wigoatAd?: boolean; height?: unknown } | null;
      if (data?.wigoatAd && typeof data.height === "number" && data.height > 0) setHeight(Math.min(Math.ceil(data.height), 900));
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [near]);

  return (
    <div ref={ref} className="min-h-[200px]" style={height ? { minHeight: height } : undefined}>
      {near ? (
        <iframe
          ref={frame}
          title="Advertisement"
          srcDoc={nativeFrameHtml()}
          sandbox={SANDBOX}
          loading="lazy"
          scrolling="no"
          className="block w-full border-0"
          style={{ height: height || 200 }}
        />
      ) : null}
    </div>
  );
}
