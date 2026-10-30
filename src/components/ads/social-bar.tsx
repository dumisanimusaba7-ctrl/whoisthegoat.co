"use client";

import { useEffect } from "react";

import { ADSTERRA_SOCIAL_BAR } from "@/lib/adsterra";

/**
 * Adsterra's Social Bar, kept light: the first after 10 seconds (so people can
 * start voting first), the second 3 minutes later, then none until 30 minutes
 * have passed since the first. The times it showed are kept in this browser, so the limits
 * hold across pages and new tabs.
 */
const FIRST_AFTER_MS = 10_000;
const WINDOW_MS = 30 * 60_000;
const MAX_PER_WINDOW = 2;
const MIN_GAP_MS = 3 * 60_000;
const STORAGE_KEY = "goat-social-bar";

function readShown(now: number): number[] {
  try {
    const list: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(list) ? list.filter((t): t is number => typeof t === "number" && now - t < WINDOW_MS) : [];
  } catch {
    // No storage (private mode, blocked): it can't be limited, so don't show it.
    return Array(MAX_PER_WINDOW).fill(now);
  }
}

/** How long until it may show again, or null if it can't in this window. */
export function socialBarWait(shown: number[], now: number, onSiteSince: number): number | null {
  if (shown.length >= MAX_PER_WINDOW) return null;
  const last = Math.max(0, ...shown);
  return Math.max(0, onSiteSince + FIRST_AFTER_MS - now, last + MIN_GAP_MS - now);
}

export function SocialBar() {
  useEffect(() => {
    const src = ADSTERRA_SOCIAL_BAR;
    if (!src) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const start = Date.now();
    const schedule = () => {
      const now = Date.now();
      const shown = readShown(now);
      const wait = socialBarWait(shown, now, start);
      if (wait === null) {
        // Try again once the oldest showing leaves the window.
        timer = setTimeout(schedule, Math.min(...shown) + WINDOW_MS - now + 1000);
        return;
      }
      timer = setTimeout(() => {
        const at = Date.now();
        const again = readShown(at);
        // Another tab may have shown it meanwhile.
        if (socialBarWait(again, at, start) !== 0) return schedule();
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify([...again, at]));
        } catch {
          return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.setAttribute("data-cfasync", "false");
        document.body.append(script);
        schedule();
      }, wait);
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);
  return null;
}
