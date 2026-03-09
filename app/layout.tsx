import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Serve By Example AI",
  description:
    "AI-powered bartending, hospitality and management training for venue teams and future leaders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}