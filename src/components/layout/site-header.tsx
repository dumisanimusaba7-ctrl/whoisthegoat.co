import Link from "next/link";

import { LogoLockup } from "@/components/brand/logo";
import { getFeaturedDebate } from "@/lib/debates";

import { MainNav } from "./main-nav";

export function SiteHeader() {
  return (
    // Named so route transitions leave the header in place.
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink text-white" style={{ viewTransitionName: "site-header" }}>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4 sm:h-16 sm:gap-4 sm:px-6">
        <Link href="/" aria-label="WHOISTHEGOAT.CO home" className="-ml-1 flex items-center p-1">
          <LogoLockup />
        </Link>
        <MainNav trophiesHref={`/${getFeaturedDebate().slug}/trophies`} />
      </div>
    </header>
  );
}
