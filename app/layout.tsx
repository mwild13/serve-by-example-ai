import type { Metadata } from "next";
import "./globals.css";
import LanguageRuntimeTranslator from "@/components/LanguageRuntimeTranslator";
import FloatingCoach from "@/components/FloatingCoach";
import ErrorLogger from "@/components/ErrorLogger";

const siteUrl = "https://www.serve-by-example.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Serve By Example AI — Hospitality Training Platform",
  description:
    "AI-powered bartending, hospitality and management training that helps venue teams learn faster, build confidence and perform better.",
  alternates: {
    canonical: "/",
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
    <html lang="en-US">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <ErrorLogger />
        <LanguageRuntimeTranslator />
        <FloatingCoach />
      </body>
    </html>
  );
}