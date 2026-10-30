"use client";

import { usePathname } from "next/navigation";

import { adsterraEnabled } from "@/lib/adsterra";

import { AdsterraBarUnit } from "./adsterra-unit";

/**
 * A slim banner under the header on every page. It scrolls away with the page
 * (the header is the only thing that stays), and sits well above the vote
 * buttons. AdSense has no bar format, so this is Adsterra only.
 *
 * It sits in the layout, which stays put as people move around the site, so
 * it's keyed to the page: every page they open gets a fresh ad.
 */
export function TopAdBar() {
  const pathname = usePathname();
  if (!adsterraEnabled) return null;
  return (
    <aside aria-label="Advertisement" className="border-b border-rule bg-paper-2">
      <div className="mx-auto max-w-6xl px-4 py-2 sm:px-6">
        <p className="mb-1 text-center text-[11px] leading-none text-mute">Advertisement</p>
        <AdsterraBarUnit key={pathname} />
      </div>
    </aside>
  );
}
