"use client";

import { TURNSTILE_SITE_KEY } from "./turnstile";

type Turnstile = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  execute: (widget: string) => void;
  reset: (widget: string) => void;
};

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
// Long enough for the rare visitor Cloudflare asks to tick a box.
const TOKEN_TIMEOUT_MS = 30_000;

let script: Promise<Turnstile | null> | null = null;
let widget: { id: string; waiting: ((token: string | null) => void) | null } | null = null;

/** Loads Cloudflare's script once; call early so it's ready by the time someone votes. */
export function loadTurnstile(): Promise<Turnstile | null> {
  if (!script) {
    script = new Promise((resolve) => {
      if (window.turnstile) return resolve(window.turnstile);
      const tag = document.createElement("script");
      tag.src = SCRIPT_URL;
      tag.async = true;
      tag.onload = () => resolve(window.turnstile ?? null);
      tag.onerror = () => {
        script = null;
        resolve(null);
      };
      document.head.appendChild(tag);
    });
  }
  return script;
}

function settle(token: string | null) {
  const waiting = widget?.waiting;
  if (widget) widget.waiting = null;
  waiting?.(token);
}

/**
 * A fresh single-use token for one vote, or null if the check couldn't run
 * (the server then decides). Nothing shows unless Cloudflare needs the
 * visitor to tick a box, which appears at the bottom of the screen.
 */
export async function getTurnstileToken(): Promise<string | null> {
  const turnstile = await loadTurnstile();
  if (!turnstile) return null;

  if (!widget) {
    const container = document.createElement("div");
    container.className = "fixed inset-x-0 bottom-4 z-50 flex justify-center";
    document.body.appendChild(container);
    widget = { id: "", waiting: null };
    widget.id = turnstile.render(container, {
      sitekey: TURNSTILE_SITE_KEY,
      action: "vote",
      execution: "execute",
      appearance: "interaction-only",
      callback: (token: string) => settle(token),
      "error-callback": () => settle(null),
      "expired-callback": () => settle(null),
    });
  } else {
    turnstile.reset(widget.id);
  }

  const current = widget;
  return new Promise((resolve) => {
    const timer = setTimeout(() => settle(null), TOKEN_TIMEOUT_MS);
    current.waiting = (token) => {
      clearTimeout(timer);
      resolve(token);
    };
    turnstile.execute(current.id);
  });
}
