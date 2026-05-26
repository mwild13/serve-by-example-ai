const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

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

module.exports = withBundleAnalyzer({
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

  images: {
    // Serve AVIF first (best compression), fall back to WebP
    formats: ["image/avif", "image/webp"],
    // Breakpoints aligned to real device widths — avoids generating unnecessary sizes
    deviceSizes: [390, 640, 750, 828, 1080, 1200, 1920],
    // Thumbnail sizes for smaller images (icons, avatars)
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache optimised images for 1 year on the edge
    minimumCacheTTL: 31536000,
  },
});
