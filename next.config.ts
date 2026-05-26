const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

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
  // Content Security Policy
  // - unsafe-inline required for Next.js hydration scripts and injected styles
  // - Stripe needs js.stripe.com for script + frames
  // - Supabase needs *.supabase.co for auth and DB calls
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self'",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com",
      "frame-src https://js.stripe.com https://*.stripe.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
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
