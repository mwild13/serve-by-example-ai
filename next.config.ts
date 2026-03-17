const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer({
  output: "standalone",
  outputFileTracingRoot: require("path").resolve(__dirname),
});
