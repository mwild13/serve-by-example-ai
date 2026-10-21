import HelpScreen from "../_components/HelpScreen";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help & FAQ | Serve By Example",
  description: "How the Serve By Example mobile app works.",
  robots: { index: false, follow: false },
};

// Opened from Settings and from Me (?from=me), which decides the back button.
export default async function MobileHelpPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  return <HelpScreen fromMe={from === "me"} />;
}
