import Link from "next/link";

import { LogoMark, LogoWordmark } from "@/components/brand/logo";
import { SITE_TAGLINE } from "@/lib/site";

const LINKS = [
  { href: "/", label: "Vote" },
  { href: "/debates", label: "Debates" },
  { href: "/results", label: "Results" },
  { href: "/#how-it-works", label: "How the vote works" },
  { href: "/privacy", label: "Privacy" },
];

export function SiteFooter() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            <Link href="/" aria-label="WHOISTHEGOAT.CO home" className="inline-flex flex-col gap-4">
              <LogoMark className="h-14 w-auto self-start" />
              <LogoWordmark className="h-6 w-auto" />
            </Link>
            <p className="mt-4 text-sm text-mute-dark">{SITE_TAGLINE}</p>
          </div>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-6">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-11 items-center text-sm font-medium text-white/65 transition-colors duration-[var(--duration-micro)] hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs leading-relaxed text-mute-dark sm:flex-row sm:justify-between">
          <p className="max-w-2xl">
            WHOISTHEGOAT.CO is an independent fan vote. It is not affiliated with, endorsed by or sponsored by any
            player, club, league or federation. Player names are used for identification only.
          </p>
          <p className="shrink-0">© 2026 WHOISTHEGOAT.CO</p>
        </div>
      </div>
    </footer>
  );
}
