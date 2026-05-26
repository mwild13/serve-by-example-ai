const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer({
  output: "standalone",
  outputFileTracingRoot: require("path").resolve(__dirname),
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
