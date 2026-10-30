"use client";

import { ADSTERRA_BAR_PHONE, adsterraEnabled } from "@/lib/adsterra";

import { AdsterraBarUnit } from "./adsterra-unit";

/**
 * A slim banner under the header on every page. It scrolls away with the page
 * (the header is the only thing that stays), and sits well above the vote
 * buttons. AdSense has no bar format, so this is Adsterra only.
 */
export function TopAdBar() {
  if (!adsterraEnabled) return null;
  return (
    // Without a phone unit the whole strip stays hidden on phones, label included.
    <aside aria-label="Advertisement" className={`border-b border-rule bg-paper-2 ${ADSTERRA_BAR_PHONE ? "" : "hidden min-[800px]:block"}`}>
      <div className="mx-auto max-w-6xl px-4 py-2 sm:px-6">
        <p className="mb-1 text-center text-[11px] leading-none text-mute">Advertisement</p>
        <AdsterraBarUnit />
      </div>
    </aside>
  );
}
