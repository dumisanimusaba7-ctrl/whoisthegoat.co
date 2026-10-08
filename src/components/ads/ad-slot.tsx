"use client";

import { useEffect } from "react";

import { ADSENSE_CLIENT, AD_SLOTS, adsEnabled, type AdPlacement } from "@/lib/ads";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * A clearly labelled, reserved-height ad unit. Renders nothing until AdSense
 * is configured, and is only ever placed away from the vote buttons.
 */
export function AdSlot({ placement, className = "" }: { placement: AdPlacement; className?: string }) {
  const slot = AD_SLOTS[placement];
  const enabled = adsEnabled() && Boolean(slot);

  useEffect(() => {
    if (!enabled) return;
    try {
      (window.adsbygoogle = window.adsbygoogle ?? []).push({});
    } catch {
      // Blocked by an extension or not yet approved: leave the space empty.
    }
  }, [enabled]);

  if (!enabled) return null;

  return (
    <aside aria-label="Advertisement" className={`mx-auto max-w-6xl px-4 py-8 sm:px-6 ${className}`}>
      <p className="type-label mb-2 text-center text-[0.6rem] text-mute">Advertisement</p>
      <ins
        className="adsbygoogle block min-h-[120px] w-full"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
