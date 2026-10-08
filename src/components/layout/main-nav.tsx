"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/debates", label: "Debates", match: (path: string) => path === "/debates" },
  { href: "/results", label: "Results", match: (path: string) => path === "/results" || path.endsWith("/results") },
];

/** Primary navigation. The current section is marked with an underline that slides between items. */
export function MainNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main">
      <ul className="flex items-center gap-1">
        {NAV.map((item) => {
          const active = item.match(pathname);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex h-11 items-center px-3 text-sm font-semibold transition-colors duration-[var(--duration-micro)] ${active ? "text-white" : "text-white/65 hover:text-white"}`}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-3 bottom-2 h-px origin-left bg-white transition-transform duration-[var(--duration-ui)] ease-out ${active ? "scale-x-100" : "scale-x-0"}`}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
