export const SITE_NAME = "WHOISTHEGOAT.CO";
export const SITE_DOMAIN = "whoisthegoat.co";
export const SITE_TAGLINE = "The world decides.";
/** Public contact address shown on the privacy page. */
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@whoisthegoat.co";
export const SITE_DESCRIPTION =
  "The world's live vote on sport's biggest debates. No sign-up, one tap, real results. Messi or Ronaldo: who is the GOAT?";

/**
 * Absolute origin used for canonical URLs, Open Graph images and share links.
 * Set NEXT_PUBLIC_SITE_URL in production; Vercel's system variables are used
 * as a fallback so preview deployments still produce working absolute URLs.
 */
export function getSiteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return new URL(explicit);

  const vercelHost =
    process.env.VERCEL_ENV === "production"
      ? process.env.VERCEL_PROJECT_PRODUCTION_URL
      : process.env.VERCEL_URL;
  if (vercelHost) return new URL(`https://${vercelHost}`);

  return new URL(`http://localhost:${process.env.PORT ?? 3000}`);
}

export function absoluteUrl(path: string): string {
  return new URL(path, getSiteUrl()).toString();
}
