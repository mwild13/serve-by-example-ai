import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import LanguageRuntimeTranslator from "@/components/LanguageRuntimeTranslator";
import ErrorLogger from "@/components/ErrorLogger";
import FloatingBookCallButton from "@/components/FloatingBookCallButton";
import CookieBanner from "@/components/CookieBanner";

// Self-hosted, not next/font/google — the Cloudflare Pages build fetches
// font files from Google's CDN at build time with next/font/google, and
// that fetch failed there once with "Cannot read properties of null
// (reading '1')" inside next/font's loader (a known next/font/google
// flakiness class, not a code bug — this file otherwise never changed).
// Self-hosting removes the build's dependency on that network call
// entirely. The files below are the latin-subset variable-font files
// Google's own CSS serves (both families are SIL OFL), one file per style.
//
// Newsreader (headings) and Inter (body) are the marketing and auth faces.
// The logged-in product keeps Fraunces/Manrope — see app/fonts/product-fonts.ts.
const newsreader = localFont({
  src: [
    { path: "./fonts/newsreader-latin-variable.woff2", weight: "400 700", style: "normal" },
    { path: "./fonts/newsreader-italic-latin-variable.woff2", weight: "400 700", style: "italic" },
  ],
  display: "swap",
  variable: "--font-newsreader",
});

const inter = localFont({
  src: "./fonts/inter-latin-variable.woff2",
  weight: "400 600",
  style: "normal",
  display: "swap",
  variable: "--font-inter",
});

const siteUrl = "https://servebyexample.co";

const ogTitle       = "Serve By Example | Staff Training for Bars, Restaurants & Hotels";
const ogDescription = "Real-time team analytics, Scenario coaching, cocktail spec libraries, and compliance tracking. Built for Australian venue operators.";
const ogImage       = "/og-image.png"; 

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Serve By Example | Train Hospitality Staff 3x Faster",
  description: "Get your team shift-ready instantly with live-scored scenario roleplays and real-time skill ratings built for fast-paced hospitality.",
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "48x48" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  // Home Screen label on iOS — without this Safari uses the full <title>.
  appleWebApp: {
    capable: true,
    title: "SBE",
    statusBarStyle: "default",
  },
  openGraph: {
    title: ogTitle,
    description: ogDescription,
    url: siteUrl,
    siteName: "Serve By Example",
    locale: "en_AU",
    type: "website",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: ogTitle,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: ogTitle,
    description: ogDescription,
    images: [ogImage],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Browser/OS chrome colour (PWA install bar, Android status bar) — a static
  // <meta name="theme-color"> tag can't reference a CSS custom property, so
  // this is a literal mirror of --green (app/globals.css). Keep in sync if
  // --green ever changes.
  // eslint-disable-next-line sbe-design/no-hardcoded-hex
  themeColor: "#1f4e37",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-AU" className={`${newsreader.variable} ${inter.variable}`}>
      <head>
        {/* Warm up the GTM connection so lazyOnload fires faster */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </head>
      <body>
        {/* Google Analytics is loaded by <CookieBanner /> only after the visitor opts in (lib/consent.ts) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://servebyexample.co/#organization",
                  "name": "Serve By Example",
                  "url": "https://servebyexample.co",
                  "description":
                    "AI-powered hospitality staff training platform for bars, restaurants, and hotel groups in Australia.",
                },
                {
                  "@type": "WebSite",
                  "@id": "https://servebyexample.co/#website",
                  "url": "https://servebyexample.co",
                  "name": "Serve By Example",
                  "publisher": { "@id": "https://servebyexample.co/#organization" },
                },
              ],
            }),
          }}
        />
        <a href="#main-content" className="skip-nav">Skip to main content</a>
        {children}
        <FloatingBookCallButton />
        <CookieBanner />
        <ErrorLogger />
        <LanguageRuntimeTranslator />
      </body>
    </html>
  );
}