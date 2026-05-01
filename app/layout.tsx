import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import LanguageRuntimeTranslator from "@/components/LanguageRuntimeTranslator";
import ErrorLogger from "@/components/ErrorLogger";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-fraunces",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-manrope",
});

const siteUrl = "https://www.serve-by-example.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Serve By Example AI — Hospitality Training Platform",
  description:
    "AI-powered bartending, hospitality and management training that helps venue teams learn faster, build confidence and perform better.",
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
    title: "Serve By Example AI — Hospitality Training Platform",
    description:
      "AI-powered bartending, hospitality and management training that helps venue teams learn faster, build confidence and perform better.",
    url: siteUrl,
    siteName: "Serve By Example AI",
    locale: "en_AU",
    type: "website",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Serve By Example AI — Hospitality Training Platform" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Serve By Example AI — Hospitality Training Platform",
    description:
      "AI-powered bartending, hospitality and management training that helps venue teams learn faster, build confidence and perform better.",
    images: ["/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-US" className={`${fraunces.variable} ${manrope.variable}`}>
      <body>
        {children}
        <ErrorLogger />
        <LanguageRuntimeTranslator />
      </body>
    </html>
  );
}
