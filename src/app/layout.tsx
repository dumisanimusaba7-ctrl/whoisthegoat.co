import type { Metadata, Viewport } from "next";
import Script from "next/script";

import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ADSENSE_CLIENT, adsEnabled } from "@/lib/ads";
import { DEBATES } from "@/lib/debates";
import { siteKeywords } from "@/lib/seo-keywords";
import { absoluteUrl, getSiteUrl, SITE_DESCRIPTION, SITE_DOMAIN, SITE_NAME } from "@/lib/site";
import { voteTestMode } from "@/lib/test-mode";

import { archivo } from "./fonts";
import "./globals.css";

// Every page must be fully prerendered: viral traffic is served from the CDN
// and never renders per request. Live numbers come from the edge-cached
// results API. This also makes unknown debate URLs wait for their (404)
// render instead of streaming a 200 shell.
export const ensureStatic = "navigation";

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: `Who Is the GOAT? The World Decides | ${SITE_NAME}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: siteKeywords(DEBATES),
  applicationName: SITE_NAME,
  category: "sports",
  creator: SITE_NAME,
  publisher: SITE_NAME,
  // Let search engines show big image previews and full snippets (Google Discover needs large images).
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  openGraph: { siteName: SITE_NAME, type: "website", locale: "en_US" },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false, email: false, address: false },
  ...(adsEnabled() ? { other: { "google-adsense-account": ADSENSE_CLIENT } } : {}),
};

export const viewport: Viewport = {
  themeColor: "#0a0c14",
  width: "device-width",
  initialScale: 1,
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": absoluteUrl("/#website"),
      name: SITE_NAME,
      alternateName: ["Who Is the GOAT", "Who Is the GOATs", SITE_DOMAIN],
      url: absoluteUrl("/"),
      description: SITE_DESCRIPTION,
      inLanguage: "en",
      publisher: { "@id": absoluteUrl("/#organization") },
    },
    {
      "@type": "Organization",
      "@id": absoluteUrl("/#organization"),
      name: SITE_NAME,
      url: absoluteUrl("/"),
      logo: absoluteUrl("/icon-512.png"),
      slogan: "Who is the GOAT? The world decides.",
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={archivo.variable} data-scroll-behavior="smooth">
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only z-50 bg-white px-4 py-3 text-sm font-semibold text-ink focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
        >
          Skip to content
        </a>
        <SiteHeader />
        {voteTestMode ? (
          <p role="status" className="bg-warning px-4 py-2.5 text-center text-sm font-semibold text-ink">
            Test mode is on: this browser can vote again and again, and every vote is counted. Turn it off before
            launch.
          </p>
        ) : null}
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <JsonLd data={websiteJsonLd} />
        {adsEnabled() ? (
          <Script
            id="adsense"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
        ) : null}
      </body>
    </html>
  );
}
