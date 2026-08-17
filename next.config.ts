const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const { withSentryConfig } = require("@sentry/nextjs");

// CSP is set per-request by middleware.ts (nonce-based) — not here.
// These headers apply to all routes via next.config, covering anything
// middleware doesn't touch (e.g. static assets served by Next.js directly).
const securityHeaders = [
  // Prevent browsers guessing content types — stops MIME-sniffing attacks
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // Prevent site being embedded in iframes — stops clickjacking
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // Control referrer info sent on navigation
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // Disable unused browser features
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig = {
  output: "standalone",
  outputFileTracingRoot: require("path").resolve(__dirname),

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/pricing",
        destination: "/membership",
        permanent: true,
      },
      // /solutions/multi-venue consolidated into /solutions/pub-groups (2026-07-28)
      {
        source: "/solutions/multi-venue",
        destination: "/solutions/pub-groups",
        permanent: true,
      },
    ];
  },

  images: {
    // Serve AVIF first (best compression), fall back to WebP
    formats: ["image/avif", "image/webp"],
    // Breakpoints aligned to real device widths — avoids generating unnecessary sizes
    deviceSizes: [390, 640, 750, 828, 1080, 1200, 1920],
    // Thumbnail sizes for smaller images (icons, avatars)
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Explicitly allow non-default quality values used in <Image quality={n}>
    qualities: [50, 60, 75, 85, 90],
    // Cache optimised images for 1 year on the edge
    minimumCacheTTL: 31536000,
  },
};

// Wrap with Sentry then bundle analyzer
// Sentry options: disable source-map uploads (no auth token configured yet —
// add SENTRY_AUTH_TOKEN to Cloudflare env vars to enable uploads).
module.exports = withSentryConfig(
  withBundleAnalyzer(nextConfig),
  {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    silent: true,
    // Disable source map upload until SENTRY_AUTH_TOKEN is set
    sourcemaps: {
      disable: !process.env.SENTRY_AUTH_TOKEN,
    },
    // Don't tunnel requests through the app (keeps CSP simpler)
    tunnelRoute: undefined,
  }
);
