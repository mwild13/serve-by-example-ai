import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import LanguageRuntimeTranslator from "@/components/LanguageRuntimeTranslator";
import ErrorLogger from "@/components/ErrorLogger";
import Script from 'next/script';

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
  variable: "--font-fraunces",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
  variable: "--font-manrope",
});

const siteUrl = "https://servebyexample.co";

const ogTitle       = "Serve By Example — Staff Training for Bars, Restaurants & Hotels";
const ogDescription = "Real-time team analytics, Scenario coaching, cocktail spec libraries, and compliance tracking — built for Australian venue operators.";
const ogImage       = "/og-image.png"; 

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Serve By Example | Train Hospitality Staff 3x Faster",
  description: "Get your team shift-ready instantly with live-scored scenario roleplays and real-time skill ratings built for fast-paced hospitality.",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "manifest", url: "/site.webmanifest" },
    ],
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
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-AU" className={`${fraunces.variable} ${manrope.variable}`}>
      <body>
        {/* Google Analytics (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-EF9YRFXKBG"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-EF9YRFXKBG');
          `}
        </Script>

        <a href="#main-content" className="skip-nav">Skip to main content</a>
        {children}
        <ErrorLogger />
        <LanguageRuntimeTranslator />
      </body>
    </html>
  );
}