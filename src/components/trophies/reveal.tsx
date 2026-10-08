"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Holds a section's entrance until it scrolls into view, then lets the CSS
 * in globals.css ([data-reveal]) play it once. Content is visible without
 * JavaScript, with reduced motion, and when it's already on screen at load.
 */
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"static" | "pending" | "shown">("static");

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    // Only known after mount: whether the section starts below the fold.
    setState("pending");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setState("shown");
        observer.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} data-reveal={state} className={className}>
      {children}
    </div>
  );
}
