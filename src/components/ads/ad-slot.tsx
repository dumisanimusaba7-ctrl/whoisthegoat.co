"use client";

import { useEffect } from "react";

import { ADSENSE_CLIENT, AD_SLOTS, adsEnabled, type AdPlacement } from "@/lib/ads";
import { adsterraEnabled } from "@/lib/adsterra";

import { AdsterraBannerUnit, AdsterraNativeUnit } from "./adsterra-unit";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * A clearly labelled ad space, only ever placed away from the vote buttons.
 * Google AdSense fills it when configured for this placement (ads.ts);
 * otherwise Adsterra does: a `native` banner or a display `banner` (728×90 on
 * wide screens, 300×250 on phones). Renders nothing if neither is on.
 */
export function AdSlot({
  placement,
  kind = "banner",
  className = "",
}: {
  placement: AdPlacement;
  kind?: "banner" | "native";
  className?: string;
}) {
  const adsense = adsEnabled() && Boolean(AD_SLOTS[placement]);
  if (!adsense && !adsterraEnabled) return null;

  return (
    <aside aria-label="Advertisement" className={`mx-auto max-w-6xl px-4 py-8 sm:px-6 ${className}`}>
      <p className="mb-2 text-center text-xs text-mute">Advertisement</p>
      {adsense ? <AdSenseUnit slot={AD_SLOTS[placement]} /> : kind === "native" ? <AdsterraNativeUnit /> : <AdsterraBannerUnit />}
    </aside>
  );
}

function AdSenseUnit({ slot }: { slot: string }) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle ?? []).push({});
    } catch {
      // Blocked by an extension or not yet approved: leave the space empty.
    }
  }, []);

  return (
    <ins
      className="adsbygoogle block min-h-[120px] w-full"
      style={{ display: "block" }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
