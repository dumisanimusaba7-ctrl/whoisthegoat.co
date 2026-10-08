import { withBotId } from "botid/next/config";
import type { NextConfig } from "next";

// Vercel adds HSTS itself. Framing is limited to our own origin (rather than
// denied outright) because Vercel BotID runs its challenge in a same-origin frame.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    // Search-friendly aliases for the launch debate.
    return [
      { source: "/who-is-the-goat", destination: "/", permanent: true },
      { source: "/messi-vs-ronaldo-vote", destination: "/messi-vs-ronaldo", permanent: true },
      { source: "/messi-vs-ronaldo-results", destination: "/messi-vs-ronaldo/results", permanent: true },
      { source: "/ronaldo-vs-messi", destination: "/messi-vs-ronaldo", permanent: true },
    ];
  },
};

export default withBotId(nextConfig);
