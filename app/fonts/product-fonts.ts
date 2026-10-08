import localFont from "next/font/local";

// Fraunces/Manrope for the logged-in product (/dashboard, /mobile,
// /management). The marketing site moved to Newsreader/Inter in October 2026
// (app/layout.tsx); these surfaces were not part of that review, so they keep
// the pair they were designed in. A product layout wraps its children in
// PRODUCT_FONT_CLASS, and `.sbe-app-type` (app/globals.css) points
// --font-heading / --font-body back at these two inside it.
const fraunces = localFont({
  src: "./fraunces-latin-variable.woff2",
  weight: "400 600",
  style: "normal",
  display: "swap",
  variable: "--font-fraunces",
});

const manrope = localFont({
  src: "./manrope-latin-variable.woff2",
  weight: "400 600",
  style: "normal",
  display: "swap",
  variable: "--font-manrope",
});

export const PRODUCT_FONT_CLASS = `${fraunces.variable} ${manrope.variable} sbe-app-type`;
